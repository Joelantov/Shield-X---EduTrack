"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Target, Sparkles, Trophy, AlertTriangle, CheckCircle2, ArrowUpRight, HelpCircle, BookOpen } from "lucide-react"
import { useAuth } from "@/lib/auth"
import {
  DOMAINS,
  DOMAIN_LABEL,
  GAP_THRESHOLD,
  STRONG_THRESHOLD,
  INTERVENTIONS,
  getStudent,
  overallScore,
  trendDelta,
  type DomainKey,
} from "@/lib/edutrack-data"
import { Card, ScoreBar } from "@/components/edutrack/primitives"

function getDetailedImprovementAdvice(domainKey: DomainKey, score: number, gain: number) {
  const isWeak = score < GAP_THRESHOLD
  const isStrong = score >= STRONG_THRESHOLD

  switch (domainKey) {
    case "phonics":
      return {
        whereToImprove: "Middle-term sound blending & multi-syllabic decoding",
        howToImprove: [
          "Spend 5 minutes daily with digital phoneme flashcards.",
          "Practice breaking complex words into prefixes, roots, and suffixes.",
          "Complete 1 sound-blending warmup quiz each morning.",
        ],
        estimatedGain: "+12% score boost in 2 weeks",
      }
    case "fluency":
      return {
        whereToImprove: "Reading speed, phrasing, and oral automaticity",
        howToImprove: [
          "Use the 1-minute repeated oral reading strategy with leveled passages.",
          "Track your Words Correct Per Minute (WCPM) goal on your weekly chart.",
          "Read aloud along with audio-supported text passages.",
        ],
        estimatedGain: "+10% fluency increase in 3 weeks",
      }
    case "comprehension":
      return {
        whereToImprove: "Main idea identification & inferential questioning",
        howToImprove: [
          "Pre-read vocabulary terms before starting new reading chapters.",
          "Use story-mapping diagrams (characters, problem, resolution).",
          "Answer 3 targeted comprehension questions after every reading section.",
        ],
        estimatedGain: "+15% comprehension mastery",
      }
    case "numberSense":
      return {
        whereToImprove: "Place value, fraction concepts, and quantitative estimation",
        howToImprove: [
          "Work through 10-minute Number Talks mental math visual exercises.",
          "Use visual fraction bars to compare benchmark fractions.",
          "Practice estimation check steps before computing exact answers.",
        ],
        estimatedGain: "+14% number sense score",
      }
    case "arithmetic":
      return {
        whereToImprove: "Calculation speed and multi-digit operational accuracy",
        howToImprove: [
          "Complete low-stakes daily arithmetic fact fluency cards.",
          "Double-check carryover and borrow steps on multi-digit problems.",
          "Review step-by-step worked examples before starting homework assignments.",
        ],
        estimatedGain: "+10% calculation speed gain",
      }
    case "problemSolving":
      return {
        whereToImprove: "Quadratic equations, word problem translation & multi-step logic",
        howToImprove: [
          "Apply the 4-step Read-Plan-Solve-Check routine to word problems.",
          "Practice middle-term splitting and factoring for quadratic equations.",
          "Draw visual area models or diagrams to represent algebraic word problems.",
        ],
        estimatedGain: "+20% problem solving breakthrough",
      }
    default:
      return {
        whereToImprove: "Core foundational skill reinforcement",
        howToImprove: ["Follow daily practice sets and review teacher feedback."],
        estimatedGain: "+10% overall gain",
      }
  }
}

export default function StudentImprovementPage() {
  const { session } = useAuth()
  const student = session?.studentId ? getStudent(session.studentId) : undefined
  const [activeTab, setActiveTab] = useState<"all" | "weaknesses" | "strengths">("all")

  if (!student) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-muted-foreground">Please sign in to view your improvement plan.</p>
      </div>
    )
  }

  const overall = overallScore(student)
  const delta = trendDelta(student)

  const ranked = [...DOMAINS].sort((a, b) => student.scores[a.key] - student.scores[b.key])
  const weaknesses = ranked.filter((d) => student.scores[d.key] < GAP_THRESHOLD)
  const strengths = ranked.filter((d) => student.scores[d.key] >= STRONG_THRESHOLD).reverse()

  const displayedDomains =
    activeTab === "weaknesses" ? (weaknesses.length > 0 ? weaknesses : ranked.slice(0, 2)) : activeTab === "strengths" ? strengths : ranked

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6 sm:px-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Personal AI Action Plan</span>
          <h1 className="font-display text-2xl font-bold text-foreground">Where & How to Improve</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>{student.name}</span>
          <span>•</span>
          <span className="text-foreground">{student.grade} ({student.section || "Sec A"})</span>
          <span>•</span>
          <span className="text-primary font-bold">Roll No: {student.rollNo || "#14"}</span>
        </div>
      </div>

      {/* SUMMARY BANNER */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 border-success/30 bg-success/5 space-y-2">
          <div className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider">
            <Trophy className="size-4" />
            Top Strengths ({strengths.length})
          </div>
          <p className="text-xs text-muted-foreground">
            {strengths.length > 0
              ? `You excel in ${strengths.map((s) => s.label).join(", ")}. Keep leveraging these strengths!`
              : "Consistently working towards mastering foundational core skills."}
          </p>
        </Card>

        <Card className="p-5 border-destructive/30 bg-destructive/5 space-y-2">
          <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="size-4" />
            Target Focus Areas ({weaknesses.length})
          </div>
          <p className="text-xs text-muted-foreground">
            {weaknesses.length > 0
              ? `${weaknesses.map((w) => w.label).join(", ")} below benchmark threshold (${GAP_THRESHOLD}%).`
              : "All skill domains are above baseline gap thresholds!"}
          </p>
        </Card>

        <Card className="p-5 border-primary/30 bg-primary/5 space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Sparkles className="size-4" />
            AI Strategy Recommendation
          </div>
          <p className="text-xs text-muted-foreground">
            Focused daily 10-minute practice sessions will help raise your problem solving score by up to +20%!
          </p>
        </Card>
      </div>

      {/* TAB CONTROLS */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${activeTab === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
        >
          All Domains ({DOMAINS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("weaknesses")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${activeTab === "weaknesses" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-secondary"}`}
        >
          Focus Areas ({weaknesses.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("strengths")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${activeTab === "strengths" ? "bg-success text-success-foreground" : "text-muted-foreground hover:bg-secondary"}`}
        >
          Strengths ({strengths.length})
        </button>
      </div>

      {/* DETAILED DOMAIN-BY-DOMAIN IMPROVEMENT PLAN CARDS */}
      <div className="space-y-6">
        {displayedDomains.map((domain) => {
          const score = student.scores[domain.key]
          const prev = student.previousScores[domain.key]
          const gain = score - prev
          const details = getDetailedImprovementAdvice(domain.key, score, gain)
          const isWeak = score < GAP_THRESHOLD
          const isStrong = score >= STRONG_THRESHOLD

          return (
            <Card
              key={domain.key}
              className={`p-6 space-y-4 transition-all ${
                isWeak ? "border-destructive/40 bg-destructive/5" : isStrong ? "border-success/30 bg-success/5" : "border-border"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-10 items-center justify-center rounded-xl text-xs font-bold ${
                      isWeak
                        ? "bg-destructive/20 text-destructive"
                        : isStrong
                          ? "bg-success/20 text-success"
                          : "bg-primary/20 text-primary"
                    }`}
                  >
                    {score}%
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">{domain.label}</h3>
                    <p className="text-xs text-muted-foreground">{domain.strand} Strand</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${gain >= 0 ? "text-success" : "text-destructive"}`}>
                    {gain >= 0 ? `+${gain} pts gain` : `${gain} pts`}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                      isWeak
                        ? "bg-destructive/15 text-destructive"
                        : isStrong
                          ? "bg-success/15 text-success"
                          : "bg-warning/20 text-warning-foreground"
                    }`}
                  >
                    {isWeak ? "Priority Gap" : isStrong ? "Mastered" : "Developing"}
                  </span>
                </div>
              </div>

              {/* WHERE TO IMPROVE */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    1. Where to Focus
                  </span>
                  <p className="text-xs font-semibold text-foreground leading-relaxed">
                    {details.whereToImprove}
                  </p>
                </div>

                {/* HOW TO IMPROVE */}
                <div className="md:col-span-2 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                    2. How to Improve (Step-by-Step AI Guide)
                  </span>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {details.howToImprove.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3 text-xs">
                <span className="font-bold text-success">
                  Target Outcome: {details.estimatedGain}
                </span>
                <Link
                  href="/student/copilot"
                  className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
                >
                  Ask AI Tutor for Practice Problems <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
