"use client"

import { useMemo } from "react"
import { ArrowUpRight, Sparkles, Target, Trophy, BookOpen, Clock, CalendarDays, User } from "lucide-react"
import { useAuth } from "@/lib/auth"
import {
  DOMAINS,
  DOMAIN_LABEL,
  GAP_THRESHOLD,
  STRONG_THRESHOLD,
  INTERVENTIONS,
  analyzeStudent,
  getStudent,
  overallScore,
  previousOverall,
  trendDelta,
  riskLevel,
  RISK_META,
  type DomainKey,
} from "@/lib/edutrack-data"
import { Card, RadialScore, ScoreBar, StudentAvatar, TrendPill } from "@/components/edutrack/primitives"
import { SkillRadar } from "@/components/edutrack/skill-radar"

function getDomainAdvice(domainKey: DomainKey, score: number, gain: number): string {
  const gainNote = gain > 0 ? `Great momentum — you gained +${gain} points! Keep it up. ` : ""

  switch (domainKey) {
    case "phonics":
      return `${gainNote}Focus on daily 5-minute sound-blending cards. Practice CVC phoneme patterns to strengthen letter-sound recognition.`
    case "fluency":
      return `${gainNote}Try paired repeated reading of leveled passages. Tracking your words-per-minute goal will help build reading automaticity.`
    case "comprehension":
      return `${gainNote}Front-load key vocabulary with visual cards before reading. Practice story-mapping questions to deepen text understanding.`
    case "numberSense":
      return `${gainNote}Engage in 10-minute Number Talks mental math warmups. Concrete base-ten blocks will reinforce place-value structure.`
    case "arithmetic":
      return `${gainNote}Work through low-stakes fact fluency drills with strategy cues. Short daily practice will increase calculation speed.`
    case "problemSolving":
      return `${gainNote}Apply the 4-step Read-Plan-Solve-Check routine to word problems. Break multi-step questions into simple parts.`
    default:
      return `${gainNote}Targeted practice in ${DOMAIN_LABEL[domainKey] || "this topic"} will help strengthen foundational understanding step by step.`
  }
}

export default function StudentDashboardPage() {
  const { session } = useAuth()
  const student = session?.studentId ? getStudent(session.studentId) : undefined

  const analysis = useMemo(() => (student ? analyzeStudent(student) : null), [student])

  if (!student || !analysis) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <p className="text-muted-foreground">We couldn&apos;t find your profile. Please sign in again.</p>
      </div>
    )
  }

  const overall = overallScore(student)
  const delta = trendDelta(student)
  const risk = riskLevel(student)
  const first = student.name.split(" ")[0]

  // Domains ordered weakest-first for the "focus" view.
  const ranked = [...DOMAINS].sort((a, b) => student.scores[a.key] - student.scores[b.key])
  const focusAreas = ranked.filter((d) => student.scores[d.key] < GAP_THRESHOLD)
  const strengths = ranked.filter((d) => student.scores[d.key] >= STRONG_THRESHOLD).reverse()

  const recommended = INTERVENTIONS.filter((i) => analysis.recommendedInterventionIds.includes(i.id))

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      {/* Welcome */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <StudentAvatar student={student} size="lg" />
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{first}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {student.grade} · Age {student.age}
            </p>
          </div>
        </div>
        <div
          className={`inline-flex items-center gap-2 self-start rounded-xl border px-3.5 py-2 text-sm font-medium sm:self-auto ${RISK_META[risk].tw}`}
        >
          <span className={`size-2 rounded-full ${RISK_META[risk].dot}`} aria-hidden />
          {risk === "on-track"
            ? "You're on track — keep it up!"
            : risk === "watch"
              ? "A few areas to work on"
              : "Let's focus on your goals together"}
        </div>
      </section>

      {/* Top row: score + radar */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center gap-4 p-6">
          <RadialScore score={overall} label="Overall" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">vs last term</span>
            <TrendPill delta={delta} />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Previous overall was {previousOverall(student)}.
          </p>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight">Your skill map</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Current scores compared to last term.</p>
            </div>
            <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-chart-1" /> Now
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm border border-dashed border-muted-foreground" /> Last term
              </span>
            </div>
          </div>
          <div className="mt-2 flex justify-center">
            <SkillRadar scores={student.scores} compare={student.previousScores} size={300} />
          </div>
        </Card>
      </section>

      {/* Where to improve */}
      <section className="mt-8">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-primary" />
          <h2 className="font-display text-xl font-bold tracking-tight">Where to improve</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          These are the skills the AI coach suggests you focus on next.
        </p>

        {focusAreas.length === 0 ? (
          <Card className="mt-4 flex items-center gap-3 border-success/30 bg-success/5 p-5">
            <Trophy className="size-6 text-success" />
            <p className="text-sm">
              Great news — every skill is above benchmark. Ask your teacher for enrichment challenges to keep growing.
            </p>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {focusAreas.map((d) => {
              const score = student.scores[d.key]
              const prev = student.previousScores[d.key]
              const gain = score - prev
              return (
                <Card key={d.key} className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-4 text-primary" />
                      <h3 className="font-medium">{DOMAIN_LABEL[d.key]}</h3>
                    </div>
                    <TrendPill delta={gain} />
                  </div>
                  <div className="mt-3">
                    <ScoreBar score={score} label={`Score vs benchmark (${GAP_THRESHOLD})`} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {getDomainAdvice(d.key, score, gain)}
                  </p>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Strengths */}
      {strengths.length > 0 ? (
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-success" />
            <h2 className="font-display text-xl font-bold tracking-tight">Your strengths</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {strengths.map((d) => (
              <span
                key={d.key}
                className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3.5 py-1.5 text-sm font-medium text-success"
              >
                <Sparkles className="size-3.5" />
                {DOMAIN_LABEL[d.key]} · {student.scores[d.key]}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* All skills breakdown */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold tracking-tight">All skills</h2>
        <Card className="mt-4 divide-y divide-border">
          {ranked.map((d) => (
            <div key={d.key} className="flex items-center gap-4 p-4">
              <span className="w-36 shrink-0 text-sm font-medium">{DOMAIN_LABEL[d.key]}</span>
              <div className="flex-1">
                <ScoreBar score={student.scores[d.key]} />
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">
                {student.scores[d.key]}
              </span>
              <span className="w-14 shrink-0 text-right">
                <TrendPill delta={student.scores[d.key] - student.previousScores[d.key]} />
              </span>
            </div>
          ))}
        </Card>
      </section>

      {/* Recommended plan */}
      {recommended.length > 0 ? (
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="size-5 text-primary" />
            <h2 className="font-display text-xl font-bold tracking-tight">Your growth plan</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Activities your teacher can set up to help you improve.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {recommended.map((iv) => (
              <Card key={iv.id} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium">{iv.title}</h3>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {iv.tier}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{iv.summary}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {iv.durationWeeks} weeks
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {iv.frequency}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* Profile details */}
      <section className="mt-8 mb-4">
        <h2 className="font-display text-xl font-bold tracking-tight">My details</h2>
        <Card className="mt-4 grid gap-px overflow-hidden bg-border sm:grid-cols-2">
          <Detail icon={User} label="Guardian" value={student.guardian} />
          <Detail icon={CalendarDays} label="Weeks tracked" value={`${student.signals.weeksTracked} weeks`} />
          <Detail icon={BookOpen} label="Attendance" value={`${student.signals.attendance}%`} />
          <Detail icon={Clock} label="Class engagement" value={`${student.signals.engagement}%`} />
        </Card>
      </section>
    </div>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 bg-card p-4">
      <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="leading-tight">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
