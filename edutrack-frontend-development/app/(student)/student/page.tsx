"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  GitFork,
  CalendarDays,
  Award,
  AlertTriangle,
  User,
  BookOpen,
  CalendarCheck,
  ChevronRight,
  ShieldCheck,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import {
  DOMAINS,
  GAP_THRESHOLD,
  STRONG_THRESHOLD,
  INTERVENTIONS,
  analyzeStudent,
  getStudent,
  overallScore,
  trendDelta,
  riskLevel,
  RISK_META,
} from "@/lib/edutrack-data"
import { Card, RadialScore, ScoreBar, StudentAvatar } from "@/components/edutrack/primitives"

export default function StudentDashboardPage() {
  const { session } = useAuth()
  const student = session?.studentId ? getStudent(session.studentId) : undefined

  const analysis = useMemo(() => (student ? analyzeStudent(student) : null), [student])

  if (!student || !analysis) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <Card className="p-8 text-center space-y-4">
          <p className="text-muted-foreground">We couldn&apos;t find your student profile. Please sign in again.</p>
          <Link href="/login" className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Go to Login
          </Link>
        </Card>
      </div>
    )
  }

  const overall = overallScore(student)
  const delta = trendDelta(student)
  const risk = riskLevel(student)
  const ranked = [...DOMAINS].sort((a, b) => student.scores[a.key] - student.scores[b.key])
  const weakestDomain = ranked[0]
  const topStrengths = ranked.filter((d) => student.scores[d.key] >= STRONG_THRESHOLD).reverse()

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6 sm:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. STUDENT PROFILE HERO CARD */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 p-6 shadow-md transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <StudentAvatar student={student} size="xl" />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                  {student.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {student.gender === "female" ? "Female 👧" : "Male 👦"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide ${RISK_META[risk].tw}`}
                >
                  <span className={`size-2 rounded-full ${RISK_META[risk].dot} animate-pulse`} aria-hidden />
                  {RISK_META[risk].label}
                </span>
              </div>

              {/* Student Metadata: Grade, Section, Roll No */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="size-3.5 text-primary" />
                  <strong>{student.grade}</strong>
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-foreground">
                  {student.section || "Section A"}
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  Roll No: {student.rollNo || "#14"}
                </span>
                <span className="text-border">•</span>
                <span>Guardian: {student.guardian}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              href="/student/copilot"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              <Sparkles className="size-4 animate-pulse" />
              <span>Ask EduTrack AI</span>
            </Link>
          </div>
        </div>
      </Card>

      {/* 2. OVERALL PERFORMANCE + TOP AT-RISK TOPIC */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Overall Mastery Card */}
        <Card className="flex flex-col items-center justify-center p-6 text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Performance</p>
          <RadialScore score={overall} label="Overall Mastery" />
          <div className="flex items-center justify-center gap-2 text-xs font-medium">
            <span className="text-muted-foreground">Term Delta:</span>
            <span className={delta >= 0 ? "text-success font-semibold" : "text-destructive font-semibold"}>
              {delta >= 0 ? `+${delta}` : delta} pts this term
            </span>
          </div>
        </Card>

        {/* Top At-Risk Topic Card */}
        <Card className="p-6 md:col-span-2 flex flex-col justify-between border-destructive/20 bg-destructive/5 space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-destructive/10 pb-3">
              <span className="flex items-center gap-2 font-display text-sm font-bold text-destructive">
                <AlertTriangle className="size-4.5" />
                Priority Topic Needing Attention
              </span>
              <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
                Score: {student.scores[weakestDomain.key]}%
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="font-display text-lg font-bold text-foreground">
                {weakestDomain.label}: Priority Target Topic
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your AI analysis detected a minor skill dip in {weakestDomain.label}. Focused practice this week will quickly boost your score back above target benchmark.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <span className="text-xs text-muted-foreground">Target Benchmark: {GAP_THRESHOLD}%</span>
            <Link
              href="/student/improvement"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              View Step-by-Step Improvement Plan <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* 3. STUDENT PORTAL SUB-PAGE MODULES GRID */}
      <div>
        <h2 className="font-display text-lg font-bold text-foreground mb-3">Explore Your Learning Portal</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Growth & Attendance */}
          <Link href="/student/growth" className="group">
            <Card className="p-5 transition-all hover:border-primary/50 hover:shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <TrendingUp className="size-5" />
                </span>
                <span className="text-xs font-bold text-success">{student.signals.attendance}% Attendance</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                  Growth & Attendance
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Track your term-by-term score trajectory, milestones, and attendance record.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-primary">
                <span>View Timeline</span> <ChevronRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>

          {/* Knowledge Graph */}
          <Link href="/student/knowledge-graph" className="group">
            <Card className="p-5 transition-all hover:border-primary/50 hover:shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <GitFork className="size-5" />
                </span>
                <span className="text-xs font-bold text-muted-foreground">6 Domains</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                  Knowledge Graph & Class Map
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Explore how your skills connect and compare your mastery with class benchmarks.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-primary">
                <span>Open Knowledge Map</span> <ChevronRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>

          {/* Where & How to Improve */}
          <Link href="/student/improvement" className="group">
            <Card className="p-5 transition-all hover:border-primary/50 hover:shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <Target className="size-5" />
                </span>
                <span className="text-xs font-bold text-warning-foreground">AI Action Plan</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                  Where & How to Improve
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  See strengths, weaknesses, and step-by-step suggestions tailored for you.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-primary">
                <span>View Suggestions</span> <ChevronRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>

          {/* Academic Planner & Goals */}
          <Link href="/student/planner" className="group">
            <Card className="p-5 transition-all hover:border-primary/50 hover:shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <CalendarDays className="size-5" />
                </span>
                <span className="text-xs font-bold text-primary">Academic Year</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                  Academic Planner & Goals
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Set personal learning targets, view term milestones, and track AI recommendations.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-primary">
                <span>Open Planner</span> <ChevronRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>

          {/* Grades & History */}
          <Link href="/student/grades" className="group">
            <Card className="p-5 transition-all hover:border-primary/50 hover:shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <Award className="size-5" />
                </span>
                <span className="text-xs font-bold text-success">Gradebook</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                  Grades & History
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Review complete subject grades, mini-quiz scores, and assessment logs.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-primary">
                <span>View Gradebook</span> <ChevronRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>

          {/* Ask EduTrack AI Copilot */}
          <Link href="/student/copilot" className="group">
            <Card className="p-5 transition-all hover:border-primary/50 hover:shadow-md space-y-3 bg-primary/5 border-primary/30">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:scale-105 transition-transform">
                  <Sparkles className="size-5" />
                </span>
                <span className="text-xs font-bold text-primary">AI Tutor</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                  Ask EduTrack Copilot
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Get instant explanations, homework help, and study tips anytime.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-primary">
                <span>Start Chat</span> <ChevronRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
