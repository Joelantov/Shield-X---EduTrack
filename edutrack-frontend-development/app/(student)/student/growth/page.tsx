"use client"

import { useMemo } from "react"
import Link from "next/link"
import { TrendingUp, CalendarCheck, ArrowUpRight, Award, CheckCircle2, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { DOMAINS, getStudent, overallScore, trendDelta, DOMAIN_LABEL } from "@/lib/edutrack-data"
import { Card } from "@/components/edutrack/primitives"

export default function StudentGrowthPage() {
  const { session } = useAuth()
  const student = session?.studentId ? getStudent(session.studentId) : undefined

  if (!student) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-muted-foreground">Please sign in to view your growth timeline.</p>
      </div>
    )
  }

  const overall = overallScore(student)
  const delta = trendDelta(student)

  // Simulated term timeline records
  const termTimeline = [
    {
      term: "Term 1 (Baseline)",
      date: "Sep - Nov 2025",
      score: overall - delta,
      status: "Initial Diagnostic Assessment",
      highlights: "Baseline established across all 6 foundational domains.",
    },
    {
      term: "Term 2 (Mid-Year Review)",
      date: "Dec 2025 - Feb 2026",
      score: overall - Math.round(delta / 2),
      status: "Progress Checkpoint",
      highlights: "Showed notable gains in Literacy & Number Sense.",
    },
    {
      term: "Term 3 (Current)",
      date: "Mar 2026 (Present)",
      score: overall,
      status: "Active Term",
      highlights: "Sustaining momentum with focused effort on problem solving.",
    },
  ]

  // Monthly attendance simulation
  const monthlyAttendance = [
    { month: "Sep", rate: 94 },
    { month: "Oct", rate: 90 },
    { month: "Nov", rate: 88 },
    { month: "Dec", rate: 85 },
    { month: "Jan", rate: 92 },
    { month: "Feb", rate: student.signals.attendance },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6 sm:px-8">
      {/* Page Title & Profile Snippet */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Performance Trajectory</span>
          <h1 className="font-display text-2xl font-bold text-foreground">Growth Timeline & Attendance</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>{student.name}</span>
          <span>•</span>
          <span className="text-foreground">{student.grade} ({student.section || "Sec A"})</span>
          <span>•</span>
          <span className="text-primary font-bold">Roll No: {student.rollNo || "#14"}</span>
        </div>
      </div>

      {/* ATTENDANCE SECTION */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 flex flex-col justify-between space-y-4 border-primary/20 bg-primary/5">
          <div className="space-y-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <CalendarCheck className="size-4" />
              Attendance Overview
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-extrabold text-foreground">{student.signals.attendance}%</span>
              <span className="text-xs font-semibold text-success">Good Standing</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {student.signals.attendance >= 85
                ? "Your regular attendance strongly supports your skill progression and test scores!"
                : "Improving attendance will give you more practice time and boost your confidence."}
            </p>
          </div>

          <div className="rounded-lg bg-card p-3 border border-border text-xs flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success shrink-0" />
            <span>No attendance alerts logged this term</span>
          </div>
        </Card>

        {/* Monthly Attendance Chart */}
        <Card className="p-6 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-display font-bold text-foreground">Monthly Attendance Tracker</h3>
            <span className="text-xs text-muted-foreground">Academic Year 2025–2026</span>
          </div>

          <div className="grid grid-cols-6 gap-2 pt-2">
            {monthlyAttendance.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="w-full bg-secondary rounded-lg h-24 relative flex items-end justify-center p-1">
                  <div
                    className="w-full bg-primary/80 rounded-md transition-all duration-500"
                    style={{ height: `${item.rate}%` }}
                  />
                  <span className="absolute top-1 text-[10px] font-bold text-foreground">{item.rate}%</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* STUDENT GROWTH TIMELINE */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Student Growth Timeline</h2>
          </div>
          <span className="text-xs font-bold text-success">
            +{delta >= 0 ? delta : 0} Points Overall Improvement
          </span>
        </div>

        {/* Timeline Cards */}
        <div className="relative border-l-2 border-primary/30 ml-4 space-y-6 pl-6 py-2">
          {termTimeline.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] top-1 flex size-4 items-center justify-center rounded-full bg-primary ring-4 ring-background" />

              <Card className="p-5 space-y-2 border-border/80 transition-all hover:border-primary/40">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-foreground text-sm">{item.term}</h3>
                    <span className="text-xs text-muted-foreground">({item.date})</span>
                  </div>
                  <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    Overall Score: {item.score}%
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground">{item.status}</p>
                <p className="text-xs text-muted-foreground">{item.highlights}</p>
              </Card>
            </div>
          ))}
        </div>
      </Card>

      {/* DOMAIN PROGRESSION TRAJECTORY */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-display font-bold text-foreground">Domain Score Progress (Previous vs Current)</h3>
          <span className="text-xs text-muted-foreground">6 Foundational Domains</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {DOMAINS.map((d) => {
            const curr = student.scores[d.key]
            const prev = student.previousScores[d.key]
            const gain = curr - prev
            return (
              <div key={d.key} className="rounded-xl border border-border p-4 space-y-2 bg-card">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground">{d.label}</span>
                  <span className={gain >= 0 ? "text-xs font-bold text-success" : "text-xs font-bold text-destructive"}>
                    {gain >= 0 ? `+${gain} pts` : `${gain} pts`}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground w-12">Prev: {prev}%</span>
                  <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${curr}%` }} />
                  </div>
                  <span className="font-bold text-foreground w-12 text-right">Curr: {curr}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
