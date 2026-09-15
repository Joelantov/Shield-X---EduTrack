"use client"

import { useMemo } from "react"
import { Award, FileText, CheckCircle2, AlertTriangle, ArrowUpRight, TrendingUp } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { DOMAINS, getStudent, overallScore, trendDelta, DOMAIN_LABEL } from "@/lib/edutrack-data"
import { Card, ScoreBar } from "@/components/edutrack/primitives"

function getGradeLetter(score: number): { letter: string; tw: string } {
  if (score >= 90) return { letter: "A+", tw: "bg-success/20 text-success border-success/30" }
  if (score >= 80) return { letter: "A", tw: "bg-success/15 text-success border-success/30" }
  if (score >= 70) return { letter: "B+", tw: "bg-primary/15 text-primary border-primary/30" }
  if (score >= 60) return { letter: "B", tw: "bg-primary/10 text-primary border-primary/20" }
  if (score >= 50) return { letter: "C", tw: "bg-warning/20 text-warning-foreground border-warning/30" }
  return { letter: "D", tw: "bg-destructive/15 text-destructive border-destructive/30" }
}

export default function StudentGradesPage() {
  const { session } = useAuth()
  const student = session?.studentId ? getStudent(session.studentId) : undefined

  if (!student) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-muted-foreground">Please sign in to view your gradebook.</p>
      </div>
    )
  }

  const overall = overallScore(student)
  const delta = trendDelta(student)
  const overallGrade = getGradeLetter(overall)

  // Simulated recent assessment logs
  const assessmentLogs = [
    { id: "q01", title: "Term 3 Quadratic Factoring Quiz", date: "Mar 12, 2026", marks: "9/20", pct: 45, domain: "Problem Solving" },
    { id: "q02", title: "Reading Passage Comprehension #4", date: "Mar 08, 2026", marks: "17/20", pct: 85, domain: "Comprehension" },
    { id: "q03", title: "Oral Reading Fluency Checkpoint", date: "Mar 01, 2026", marks: "16/20", pct: 80, domain: "Fluency" },
    { id: "q04", title: "Multi-digit Arithmetic Speed Drill", date: "Feb 22, 2026", marks: "14/20", pct: 70, domain: "Arithmetic" },
    { id: "q05", title: "Number Sense Place Value Check", date: "Feb 15, 2026", marks: "15/20", pct: 75, domain: "Number Sense" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6 sm:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Academic Records</span>
          <h1 className="font-display text-2xl font-bold text-foreground">Grades & Assessment History</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>{student.name}</span>
          <span>•</span>
          <span className="text-foreground">{student.grade} ({student.section || "Sec A"})</span>
          <span>•</span>
          <span className="text-primary font-bold">Roll No: {student.rollNo || "#14"}</span>
        </div>
      </div>

      {/* OVERALL GRADE SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 flex items-center justify-between border-primary/20 bg-primary/5">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Cumulative Grade</span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-foreground">{overall}%</span>
              <span className={`rounded-lg border px-2.5 py-0.5 text-sm font-extrabold ${overallGrade.tw}`}>
                Grade {overallGrade.letter}
              </span>
            </div>
          </div>
          <Award className="size-10 text-primary opacity-80" />
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed Assessments</span>
          <p className="font-display text-2xl font-bold text-foreground">14 Assessments</p>
          <p className="text-xs text-muted-foreground">100% submission rate this term</p>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Term Trend Delta</span>
          <p className={delta >= 0 ? "font-display text-2xl font-bold text-success" : "font-display text-2xl font-bold text-destructive"}>
            {delta >= 0 ? `+${delta} Points` : `${delta} Points`}
          </p>
          <p className="text-xs text-muted-foreground">Compared to previous term baseline</p>
        </Card>
      </div>

      {/* DOMAIN GRADEBOOK TABLE */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Domain Gradebook</h2>
          </div>
          <span className="text-xs text-muted-foreground">6 Skill Domains</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Skill Domain</th>
                <th className="py-3 px-4">Strand</th>
                <th className="py-3 px-4">Score (%)</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DOMAINS.map((d) => {
                const score = student.scores[d.key]
                const grade = getGradeLetter(score)
                const isWeak = score < 55

                return (
                  <tr key={d.key} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">{d.label}</td>
                    <td className="py-3 px-4 text-muted-foreground">{d.strand}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 max-w-[140px]">
                        <span className="font-bold tabular-nums w-8">{score}%</span>
                        <ScoreBar score={score} />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-bold ${grade.tw}`}>
                        {grade.letter}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          isWeak ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
                        }`}
                      >
                        {isWeak ? <AlertTriangle className="size-3" /> : <CheckCircle2 className="size-3" />}
                        {isWeak ? "Needs Focus" : "Proficient"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* RECENT ASSESSMENT LOGS */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-display font-bold text-foreground">Recent Quiz & Test History</h3>
          <span className="text-xs text-muted-foreground">Term 3 Assessment Log</span>
        </div>

        <div className="space-y-3">
          {assessmentLogs.map((log) => {
            const grade = getGradeLetter(log.pct)
            return (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{log.title}</span>
                    <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{log.domain}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Date: {log.date}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Marks: {log.marks}</span>
                  <span className="font-extrabold text-foreground">{log.pct}%</span>
                  <span className={`rounded-md border px-2 py-0.5 font-bold ${grade.tw}`}>{grade.letter}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
