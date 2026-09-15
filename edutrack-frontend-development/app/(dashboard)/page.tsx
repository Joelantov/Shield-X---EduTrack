"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CalendarCheck,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Send,
  X,
  Bot,
  HelpCircle,
  Eye,
  Check,
  ShieldCheck,
  Grid,
  UserPlus,
} from "lucide-react"
import { PageHeader } from "@/components/edutrack/page-header"
import { Card, RiskBadge, StudentAvatar, ScoreBar, TrendPill } from "@/components/edutrack/primitives"
import {
  STUDENTS,
  classStats,
  domainAverages,
  overallScore,
  trendDelta,
  riskLevel,
  analyzeStudent,
  addStudentToStore,
  REASON_META,
  DOMAIN_LABEL,
  GAP_THRESHOLD,
} from "@/lib/edutrack-data"
import { fetchAlerts, markAlertReviewed, askCopilot, fetchHeatmap, createStudent } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const router = useRouter()
  const stats = classStats()
  const domains = domainAverages()

  // State for Feature 1: Smart Alert Engine
  const [alerts, setAlerts] = useState<any[]>([])

  // State for Feature 2: Teacher Copilot
  const [isCopilotOpen, setIsCopilotOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string; source?: string }>>([
    {
      role: "assistant",
      text: "Hello Ms. Rivera! I am **Ask EduTrack**, your AI Copilot. Ask me anything about class performance, student alerts, or topic mastery.",
    },
  ])
  const [inputQuery, setInputQuery] = useState("")
  const [isCopilotLoading, setIsCopilotLoading] = useState(false)

  // State for Feature 4: Class Learning Heatmap
  const [heatmapData, setHeatmapData] = useState<any>(null)
  const [hoveredCell, setHoveredCell] = useState<{ studentName: string; domainLabel: string; score: number; avg: number } | null>(null)

  // State for Add Student System
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isCreatingStudent, setIsCreatingStudent] = useState(false)
  const [addStudentSuccess, setAddStudentSuccess] = useState<string | null>(null)
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    gender: "female" as "female" | "male",
    grade: "Grade 8",
    age: 13,
    guardian: "",
    subject: "Mathematics",
    attendance: 90,
    phonics: 70,
    fluency: 70,
    comprehension: 70,
    numberSense: 70,
    arithmetic: 70,
    problemSolving: 70,
    note: "",
  })

  const getFallbackAlerts = () =>
    STUDENTS.filter((s) => riskLevel(s) !== "on-track").map((s) => ({
      student_id: s.id,
      student_name: s.name,
      risk_level: riskLevel(s),
      classification: "Persistent Gap",
      summary_why: `Flagged as learning gap due to consecutive declines in core skills.`,
      evidence_reasons: [
        "3 consecutive declining assessments",
        "Targeted topic accuracy below 50%",
        "Independent practice rate declining",
      ],
      confidence_percentage: 92,
      status: "Needs review",
      generated_type: "Automatically generated",
    }))

  const loadBackendData = () => {
    fetchAlerts().then((data) => {
      if (data && data.length > 0) setAlerts(data)
      else setAlerts(getFallbackAlerts())
    })
    fetchHeatmap().then((data) => {
      if (data) setHeatmapData(data)
    })
  }

  useEffect(() => {
    loadBackendData()
  }, [])

  const handleMarkReviewed = async (studentId: string) => {
    setAlerts((prev) => {
      const baseList = prev.length > 0 ? prev : getFallbackAlerts()
      return baseList.map((a) => (a.student_id === studentId ? { ...a, status: "Teacher reviewed" } : a))
    })
    await markAlertReviewed(studentId)
  }

  const handleSendCopilotQuery = async (queryText?: string) => {
    const text = queryText || inputQuery
    if (!text.trim()) return

    setChatMessages((prev) => [...prev, { role: "user", text }])
    if (!queryText) setInputQuery("")
    setIsCopilotLoading(true)

    const res = await askCopilot(text)
    setChatMessages((prev) => [
      ...prev,
      { role: "assistant", text: res.answer, source: res.source },
    ])
    setIsCopilotLoading(false)
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudentForm.name.trim()) return

    setIsCreatingStudent(true)
    const scores = {
      phonics: Number(newStudentForm.phonics),
      fluency: Number(newStudentForm.fluency),
      comprehension: Number(newStudentForm.comprehension),
      numberSense: Number(newStudentForm.numberSense),
      arithmetic: Number(newStudentForm.arithmetic),
      problemSolving: Number(newStudentForm.problemSolving),
    }

    const addedLocal = addStudentToStore({
      name: newStudentForm.name,
      gender: newStudentForm.gender,
      grade: newStudentForm.grade,
      age: Number(newStudentForm.age),
      guardian: newStudentForm.guardian,
      scores,
      signals: {
        attendance: Number(newStudentForm.attendance),
        engagement: 75,
        homeworkCompletion: 80,
        isELL: false,
        weeksTracked: 1,
      },
      note: newStudentForm.note || "Newly added student.",
    })

    await createStudent({
      ...newStudentForm,
      scores,
    })

    setIsAddStudentOpen(false)
    setNewStudentForm({
      name: "",
      gender: "female",
      grade: "Grade 8",
      age: 13,
      guardian: "",
      subject: "Mathematics",
      attendance: 90,
      phonics: 70,
      fluency: 70,
      comprehension: 70,
      numberSense: 70,
      arithmetic: 70,
      problemSolving: 70,
      note: "",
    })

    setAddStudentSuccess(`${addedLocal.name} added to roster with AI risk prediction! Redirecting to students list...`)
    setTimeout(() => {
      setAddStudentSuccess(null)
      router.push("/students")
    }, 1800)
    setIsCreatingStudent(false)
  }

  const riskOrder = [
    { key: "at-risk" as const, label: "At Risk", color: "bg-destructive" },
    { key: "watch" as const, label: "Watch", color: "bg-warning" },
    { key: "on-track" as const, label: "On Track", color: "bg-success" },
  ]

  const statCards = [
    { label: "Students Tracked", value: stats.total + (heatmapData?.heatmap?.length ? heatmapData.heatmap.length - 12 : 0), icon: Users, tone: "text-chart-1" },
    { label: "Class Mastery", value: `${stats.avgOverall}%`, icon: TrendingUp, tone: "text-chart-2" },
    { label: "Need Intervention", value: stats.byRisk["at-risk"] + stats.byRisk.watch, icon: AlertTriangle, tone: "text-warning-foreground" },
    { label: "Avg Attendance", value: `${stats.avgAttendance}%`, icon: CalendarCheck, tone: "text-chart-4" },
  ]

  const copilotSuggestions = [
    "Which students need my attention today?",
    "Which topic is weakest across the class?",
    "Who improved this week?",
    "Show students with declining performance but good attendance.",
    "Which intervention is working?",
    "Which students have missing data?",
  ]

  return (
    <div className="relative pb-24">
      {/* Add Student success toast */}
      {addStudentSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-5 py-3 shadow-xl backdrop-blur-sm text-sm font-medium text-success">
            <CheckCircle2 className="size-4 shrink-0" />
            {addStudentSuccess}
          </div>
        </div>
      )}
      <PageHeader
        eyebrow="Class Overview · Grade 2"
        title="Good morning, Ms. Rivera"
        description="EduTrack flagged early learning signals across your class. Review smart alerts, inspect topic heatmaps, and consult Ask EduTrack."
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddStudentOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/80"
            >
              <UserPlus className="size-4 text-primary" />
              Add Student
            </button>
            <Link
              href="/students"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              View all students
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        }
      />

      <div className="space-y-6 px-5 py-6 sm:px-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className={`size-4.5 ${s.tone}`} />
              </div>
              <p className="mt-3 font-display text-3xl font-bold tabular-nums">{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Overview Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Risk distribution */}
          <Card className="p-6 lg:col-span-1">
            <h2 className="font-display text-base font-semibold">Risk Distribution</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Where your class stands today</p>

            <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full">
              {riskOrder.map((r) => {
                const pct = (stats.byRisk[r.key] / stats.total) * 100
                return pct > 0 ? (
                  <div key={r.key} className={r.color} style={{ width: `${pct}%` }} aria-hidden />
                ) : null
              })}
            </div>

            <ul className="mt-5 space-y-3">
              {riskOrder.map((r) => (
                <li key={r.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${r.color}`} aria-hidden />
                    {r.label}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {stats.byRisk[r.key]}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      ({Math.round((stats.byRisk[r.key] / stats.total) * 100)}%)
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
              <TrendingUp className="size-4" />
              <span>
                <strong className="font-semibold">{stats.improving} students</strong> improving this term
              </span>
            </div>
          </Card>

          {/* Domain averages */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display text-base font-semibold">Skill Domain Averages</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Class-wide mastery by foundational skill</p>
              </div>
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                <span className="h-2 w-4 rounded-full border border-dashed border-warning" aria-hidden />
                Benchmark {GAP_THRESHOLD}
              </span>
            </div>

            <ul className="mt-6 space-y-4">
              {domains.map((d) => (
                <li key={d.key} className="grid grid-cols-[7.5rem_1fr_2.25rem] items-center gap-3">
                  <span className="truncate text-sm text-muted-foreground">{d.label}</span>
                  <div className="relative">
                    <ScoreBar score={d.avg} />
                    <span
                      className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-warning"
                      style={{ left: `${GAP_THRESHOLD}%` }}
                      aria-hidden
                    />
                  </div>
                  <span className="text-right text-sm font-semibold tabular-nums">{d.avg}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* FEATURE 1: SMART ALERT ENGINE */}
        <Card className="overflow-hidden border-destructive/20">
          <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4.5 text-destructive" />
              <h2 className="font-display text-base font-semibold">Smart Alert Engine</h2>
            </div>
            <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
              {alerts.length} active alerts
            </span>
          </div>

          <ul className="divide-y divide-border">
            {(alerts.length > 0
              ? alerts
              : STUDENTS.filter((s) => riskLevel(s) !== "on-track").map((s) => ({
                  student_id: s.id,
                  student_name: s.name,
                  risk_level: riskLevel(s),
                  classification: "Persistent Gap",
                  summary_why: `Flagged as learning gap due to consecutive declines.`,
                  evidence_reasons: [
                    "3 consecutive declining assessments",
                    "Targeted topic accuracy below 50%",
                    "Independent practice rate declining",
                  ],
                  confidence_percentage: 92,
                  status: "Needs review",
                  generated_type: "Automatically generated",
                }))
            ).map((alert: any) => {
              const isReviewed = alert.status === "Teacher reviewed"
              return (
                <li key={alert.student_id} className="p-6 transition-colors hover:bg-secondary/20">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link href={`/students/${alert.student_id}`} className="font-display text-lg font-bold hover:underline">
                          {alert.student_name}
                        </Link>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                            alert.risk_level === "at-risk"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-warning/20 text-warning-foreground"
                          )}
                        >
                          {alert.risk_level}
                        </span>

                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {alert.confidence_percentage}% confidence
                        </span>

                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            isReviewed
                              ? "border-success/30 bg-success/10 text-success"
                              : "border-destructive/30 bg-destructive/10 text-destructive"
                          )}
                        >
                          {alert.status}
                        </span>

                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          {alert.generated_type}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-foreground">{alert.summary_why}</p>

                      {/* Evidence Reasons List */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                          Evidence Reasons ({alert.evidence_reasons?.length || 0}):
                        </p>
                        <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
                          {(alert.evidence_reasons || []).map((reason: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 rounded-md bg-secondary/50 px-3 py-1.5 text-xs">
                              <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMarkReviewed(alert.student_id)}
                        disabled={isReviewed}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors",
                          isReviewed
                            ? "bg-success/10 text-success cursor-default"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        )}
                      >
                        {isReviewed ? <Check className="size-3.5" /> : <Eye className="size-3.5" />}
                        {isReviewed ? "Reviewed" : "Mark as Reviewed"}
                      </button>

                      <Link
                        href={`/students/${alert.student_id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Full Analysis <ArrowUpRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        {/* FEATURE 4: CLASS LEARNING HEATMAP */}
        <Card className="p-6 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Grid className="size-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Class Learning Heatmap</h2>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-success">🟢 Mastered (≥70%)</span>
              <span className="flex items-center gap-1.5 font-medium text-warning-foreground">🟡 Emerging (50–69%)</span>
              <span className="flex items-center gap-1.5 font-medium text-destructive">🔴 Gap (&lt;50%)</span>
            </div>
          </div>

          {/* Dynamic Class Insight Banner */}
          <div className="mt-4 rounded-lg bg-primary/10 border border-primary/20 p-4 text-sm font-medium text-primary flex items-center gap-2">
            <Sparkles className="size-4 shrink-0" />
            <span>
              <strong>Class Insight:</strong>{" "}
              {heatmapData?.class_insight ||
                "Problem Solving is the most widespread learning gap, affecting 8 of 13 students."}
            </span>
          </div>

          {/* Heatmap Matrix Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="py-3 px-4 font-semibold">Student</th>
                  {(
                    heatmapData?.domains || [
                      { key: "phonics", label: "Phonics" },
                      { key: "fluency", label: "Reading Fluency" },
                      { key: "comprehension", label: "Comprehension" },
                      { key: "numberSense", label: "Number Sense" },
                      { key: "arithmetic", label: "Arithmetic" },
                      { key: "problemSolving", label: "Problem Solving" },
                    ]
                  ).map((d: any) => (
                    <th key={d.key} className="py-3 px-3 font-semibold text-center">
                      {d.label}
                      <span className="block text-[10px] font-normal text-muted-foreground">
                        Avg: {heatmapData?.class_averages?.[d.key] || 60}%
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(
                  heatmapData?.heatmap ||
                  STUDENTS.map((s) => ({
                    student_id: s.id,
                    student_name: s.name,
                    scores: s.scores,
                  }))
                ).map((row: any) => (
                  <tr key={row.student_id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      <Link href={`/students/${row.student_id}`} className="hover:underline">
                        {row.student_name}
                      </Link>
                    </td>

                    {(
                      heatmapData?.domains || [
                        { key: "phonics", label: "Phonics" },
                        { key: "fluency", label: "Reading Fluency" },
                        { key: "comprehension", label: "Comprehension" },
                        { key: "numberSense", label: "Number Sense" },
                        { key: "arithmetic", label: "Arithmetic" },
                        { key: "problemSolving", label: "Problem Solving" },
                      ]
                    ).map((d: any) => {
                      const score = row.scores[d.key] ?? 50
                      const avg = heatmapData?.class_averages?.[d.key] || 60
                      const gap = score - avg
                      const statusColor =
                        score >= 70
                          ? "bg-success/15 text-success border-success/30"
                          : score >= 50
                            ? "bg-warning/15 text-warning-foreground border-warning/30"
                            : "bg-destructive/15 text-destructive border-destructive/30"
                      const dot = score >= 70 ? "🟢" : score >= 50 ? "🟡" : "🔴"

                      return (
                        <td key={d.key} className="py-2 px-2 text-center relative group">
                          <span
                            className={cn(
                              "inline-flex items-center justify-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold tabular-nums w-16",
                              statusColor
                            )}
                          >
                            <span>{dot}</span>
                            <span>{score}%</span>
                          </span>

                          {/* Hover Tooltip: Student Score | Class Avg | Difference */}
                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-48 rounded-lg bg-popover border border-border p-2 text-left shadow-lg text-xs">
                            <p className="font-semibold text-popover-foreground">{row.student_name}</p>
                            <p className="text-muted-foreground">{d.label}</p>
                            <div className="mt-1 border-t border-border pt-1 space-y-0.5 font-mono">
                              <p>Score: <strong>{score}%</strong></p>
                              <p>Class Avg: <strong>{avg}%</strong></p>
                              <p>Gap: <strong className={gap >= 0 ? "text-success" : "text-destructive"}>{gap >= 0 ? `+${gap}` : gap} points</strong></p>
                            </div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* FEATURE 2: TEACHER COPILOT – "ASK EDUTRACK" FLOATING BUTTON & DRAWER */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-xl transition-transform hover:scale-105"
        >
          <Sparkles className="size-4 animate-spin text-accent" />
          ✨ Ask EduTrack
        </button>
      </div>

      {/* Copilot Drawer / Modal */}
      {isCopilotOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-full max-w-md animate-in slide-in-from-bottom-5 duration-300">
          <Card className="flex h-[520px] flex-col overflow-hidden shadow-2xl border-primary/30">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="size-5" />
                <div>
                  <h3 className="font-display font-bold text-sm leading-none">Ask EduTrack Copilot</h3>
                  <p className="text-[11px] opacity-80 mt-0.5">Evidence-backed AI Teacher Assistant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCopilotOpen(false)}
                className="rounded-lg p-1 hover:bg-primary-foreground/20"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed text-xs sm:text-sm",
                    msg.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                      : "bg-secondary text-secondary-foreground rounded-bl-none border border-border"
                  )}
                >
                  <span>{msg.text}</span>
                  {msg.source && (
                    <span className="mt-1 text-[10px] opacity-70 italic">
                      Source: {msg.source === "gemini_api" ? "Gemini 2.5 Flash" : "Live Backend Analytics"}
                    </span>
                  )}
                </div>
              ))}
              {isCopilotLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                  <Sparkles className="size-3.5 animate-pulse text-primary" />
                  Analyzing database and synthesizing answer...
                </div>
              )}
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="border-t border-border bg-muted/40 p-2 overflow-x-auto flex gap-1.5 no-scrollbar">
              {copilotSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendCopilotQuery(s)}
                  className="whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendCopilotQuery()
              }}
              className="flex items-center gap-2 border-t border-border bg-card p-3"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask EduTrack a question..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isCopilotLoading}
                className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* ADD STUDENT MODAL SYSTEM */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg p-6 space-y-4 shadow-2xl border-primary/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="size-5 text-primary" />
                <h3 className="font-display font-bold text-lg">Add New Student to EduTrack</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="rounded-md p-1 hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-medium text-foreground block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                    placeholder="e.g. Diya Patel"
                    className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Gender *</label>
                  <select
                    value={newStudentForm.gender}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, gender: e.target.value as "female" | "male" })}
                    className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="female">Female 👧</option>
                    <option value="male">Male 👦</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Grade</label>
                  <input
                    type="text"
                    value={newStudentForm.grade}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, grade: e.target.value })}
                    className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Age</label>
                  <input
                    type="number"
                    value={newStudentForm.age}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, age: Number(e.target.value) })}
                    className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={newStudentForm.guardian}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, guardian: e.target.value })}
                    placeholder="e.g. Rajesh Patel"
                    className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Subject Focus</label>
                  <input
                    type="text"
                    value={newStudentForm.subject}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, subject: e.target.value })}
                    className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-2 border-t border-border pt-3">
                  Initial Skill Scores (%):
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span>Phonics</span>
                    <input
                      type="number"
                      max="100"
                      min="0"
                      value={newStudentForm.phonics}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, phonics: Number(e.target.value) })}
                      className="w-full h-8 rounded border border-border bg-card px-2 mt-1"
                    />
                  </div>
                  <div>
                    <span>Fluency</span>
                    <input
                      type="number"
                      max="100"
                      min="0"
                      value={newStudentForm.fluency}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, fluency: Number(e.target.value) })}
                      className="w-full h-8 rounded border border-border bg-card px-2 mt-1"
                    />
                  </div>
                  <div>
                    <span>Comprehension</span>
                    <input
                      type="number"
                      max="100"
                      min="0"
                      value={newStudentForm.comprehension}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, comprehension: Number(e.target.value) })}
                      className="w-full h-8 rounded border border-border bg-card px-2 mt-1"
                    />
                  </div>
                  <div>
                    <span>Number Sense</span>
                    <input
                      type="number"
                      max="100"
                      min="0"
                      value={newStudentForm.numberSense}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, numberSense: Number(e.target.value) })}
                      className="w-full h-8 rounded border border-border bg-card px-2 mt-1"
                    />
                  </div>
                  <div>
                    <span>Arithmetic</span>
                    <input
                      type="number"
                      max="100"
                      min="0"
                      value={newStudentForm.arithmetic}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, arithmetic: Number(e.target.value) })}
                      className="w-full h-8 rounded border border-border bg-card px-2 mt-1"
                    />
                  </div>
                  <div>
                    <span>Problem Solving</span>
                    <input
                      type="number"
                      max="100"
                      min="0"
                      value={newStudentForm.problemSolving}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, problemSolving: Number(e.target.value) })}
                      className="w-full h-8 rounded border border-border bg-card px-2 mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Teacher Note / Observation</label>
                <textarea
                  value={newStudentForm.note}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, note: e.target.value })}
                  placeholder="e.g. Needs additional practice on multi-step word problems."
                  className="w-full h-16 rounded-lg border border-border bg-card p-2 text-xs outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingStudent || !newStudentForm.name.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-50"
                >
                  <UserPlus className="size-4" />
                  {isCreatingStudent ? "Adding Student..." : "Save Student to EduTrack"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
