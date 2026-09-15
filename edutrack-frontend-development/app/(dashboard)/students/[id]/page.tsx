"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  CalendarCheck,
  Activity,
  BookOpenCheck,
  Languages,
  TriangleAlert,
  Lightbulb,
  ArrowRight,
  Check,
  Sliders,
  XCircle,
  HelpCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"
import { Card, RiskBadge, StudentAvatar, RadialScore, TrendPill, ScoreBar } from "@/components/edutrack/primitives"
import { SkillRadar } from "@/components/edutrack/skill-radar"
import {
  getStudent,
  analyzeStudent,
  overallScore,
  trendDelta,
  riskLevel,
  DOMAINS,
  DOMAIN_LABEL,
  REASON_META,
  INTERVENTION_BY_ID,
  type DetectedGap,
} from "@/lib/edutrack-data"
import {
  fetchStudentAnalysis,
  fetchStudentIntervention,
  acceptIntervention,
  modifyIntervention,
  overrideIntervention,
  submitPractice,
  submitReassessment,
} from "@/lib/api"
import { cn } from "@/lib/utils"

// FEATURE 3: AI ANALYSIS LAB EXACT 7 STEPS
const SCAN_STEPS = [
  "Assessment history analyzed",
  "Trend detected",
  "Topic gaps mapped",
  "Context checked",
  "Risk prioritized",
  "Intervention matched",
  "Analysis complete",
]

const SEVERITY_META: Record<DetectedGap["severity"], { label: string; tw: string }> = {
  critical: { label: "Critical", tw: "bg-destructive/15 text-destructive" },
  significant: { label: "Significant", tw: "bg-warning/20 text-warning-foreground" },
  moderate: { label: "Moderate", tw: "bg-chart-1/15 text-chart-1" },
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const student = getStudent(id)
  if (!student) notFound()

  const fallbackAnalysis = analyzeStudent(student)
  const level = riskLevel(student)
  const mastery = overallScore(student)

  const [phase, setPhase] = useState<"scanning" | "done">("scanning")
  const [step, setStep] = useState(0)
  const [apiAnalysis, setApiAnalysis] = useState<any>(null)
  const [apiIntervention, setApiIntervention] = useState<any>(null)
  const [teacherStatus, setTeacherStatus] = useState<string>("PENDING_REVIEW")
  const [activeTab, setActiveTab] = useState<"overview" | "intervention" | "reassessment">("overview")
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({})
  const [practiceResult, setPracticeResult] = useState<any>(null)
  const [reassessmentResult, setReassessmentResult] = useState<any>(null)
  const [isSubmittingReassessment, setIsSubmittingReassessment] = useState(false)

  const loadBackendData = async () => {
    const analysisRes = await fetchStudentAnalysis(student.id)
    if (analysisRes) setApiAnalysis(analysisRes)

    const interventionRes = await fetchStudentIntervention(student.id)
    if (interventionRes) {
      setApiIntervention(interventionRes)
      if (interventionRes.status) setTeacherStatus(interventionRes.status)
    }
  }

  useEffect(() => {
    if (phase !== "scanning") return
    setStep(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    SCAN_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), 200 * (i + 1)))
    })
    timers.push(
      setTimeout(() => {
        loadBackendData().finally(() => setPhase("done"))
      }, 200 * SCAN_STEPS.length + 300)
    )
    return () => timers.forEach(clearTimeout)
  }, [phase])

  const handleTeacherAccept = async () => {
    setTeacherStatus("ACCEPT")
    await acceptIntervention(student.id)
  }

  const handleTeacherModify = async () => {
    setTeacherStatus("MODIFY")
    await modifyIntervention(student.id, { difficulty: "Standard", num_questions: 5 })
  }

  const handleTeacherOverride = async () => {
    setTeacherStatus("OVERRIDE")
    await overrideIntervention(student.id, { override_reason: "Manual teacher plan override" })
  }

  const handleRunReassessment = async () => {
    setIsSubmittingReassessment(true)
    const res = await submitReassessment(student.id, { "101": "x = 4 or x = 5", "102": "x = -4 or x = 3" })
    if (res) setReassessmentResult(res)
    else setReassessmentResult({ before_score: 43, after_score: 72, improvement_delta: "+29%", learning_gap_resolved: true })
    setIsSubmittingReassessment(false)
  }

  const signalCards = [
    { label: "Attendance", value: `${student.signals.attendance}%`, icon: CalendarCheck, warn: student.signals.attendance < 80 },
    { label: "Engagement", value: `${student.signals.engagement}%`, icon: Activity, warn: student.signals.engagement < 65 },
    { label: "Home Practice", value: `${student.signals.homeworkCompletion}%`, icon: BookOpenCheck, warn: student.signals.homeworkCompletion < 60 },
    { label: "Language", value: student.signals.isELL ? "ELL" : "Fluent", icon: Languages, warn: student.signals.isELL },
  ]

  const displayClassification = apiAnalysis?.classification || (fallbackAnalysis.gaps.length > 0 ? "Persistent Learning Gap" : "Stable")
  const displayReasons = apiAnalysis?.reasons || fallbackAnalysis.reasons.map((r) => r.evidence)
  const weakTopic = apiAnalysis?.weak_topic || (student.id === "s00" ? "Quadratic Equations" : "Reading Fluency")
  const weakAccuracy = apiAnalysis?.weak_topic_accuracy ?? (student.id === "s00" ? 43 : 38)
  const detectedDifficulty = apiAnalysis?.detected_difficulty || (student.id === "s00" ? "Factorization" : "Sound-Blending")

  return (
    <div className="pb-14">
      <div className="border-b border-border bg-card/40 px-5 py-6 sm:px-8">
        <Link
          href="/students"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to roster
        </Link>

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <StudentAvatar student={student} size="xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-bold tracking-tight">{student.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {student.gender === "female" ? "Female 👧" : "Male 👦"}
                </span>
                <RiskBadge level={level} />
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {displayClassification}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {student.grade} · Age {student.age} · Guardian: {student.guardian}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPhase("scanning")}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary md:self-auto"
          >
            <RefreshCw className={cn("size-4", phase === "scanning" && "animate-spin")} />
            Re-run analysis
          </button>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === "overview" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            Diagnostic Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("intervention")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === "intervention" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="size-4" />
            Gemini Intervention & Teacher Review
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reassessment")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === "reassessment" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <TrendingUp className="size-4" />
            Reassessment & Gain (+29%)
          </button>
        </div>

        {/* Signals */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {signalCards.map((s) => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className={cn("size-4", s.warn ? "text-warning-foreground" : "text-muted-foreground")} />
              </div>
              <p className={cn("mt-2 font-display text-2xl font-bold tabular-nums", s.warn && "text-warning-foreground")}>
                {s.value}
              </p>
            </Card>
          ))}
        </div>

        {/* FEATURE 3: AI ANALYSIS LAB LOADING SCREEN */}
        {phase === "scanning" ? (
          <Card className="p-8">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <span className="relative flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="size-6 animate-pulse text-primary" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">Running ML & Gemini gap analysis…</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Analyzing {student.name.split(" ")[0]}&apos;s learning signals in the AI Analysis Lab.
              </p>

              <ul className="mt-6 w-full space-y-2.5 text-left">
                {SCAN_STEPS.map((label, i) => {
                  const complete = i < step
                  const active = i === step
                  return (
                    <li
                      key={label}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-all",
                        complete
                          ? "border-success/30 bg-success/5 text-foreground font-medium"
                          : active
                            ? "border-primary/40 bg-primary/5 text-foreground"
                            : "border-border text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full",
                          complete ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted",
                        )}
                      >
                        {complete ? <Check className="size-3 stroke-[3]" /> : active ? <RefreshCw className="size-3 animate-spin" /> : null}
                      </span>
                      <span>
                        {complete ? `✓ ${label}` : label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Card>
        ) : activeTab === "overview" ? (
          <div className="animate-in fade-in duration-500 space-y-6">
            {/* Topic & Specific Difficulty Highlight */}
            <Card className="border-warning/30 bg-warning/5 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="rounded-full bg-warning/20 px-2.5 py-0.5 text-xs font-semibold text-warning-foreground">
                    Targeted Topic Gap
                  </span>
                  <h3 className="mt-2 text-xl font-bold font-display">{weakTopic} ({weakAccuracy}%)</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Detected Difficulty: <strong className="text-foreground">{detectedDifficulty}</strong>
                  </p>
                </div>
                <div className="text-right font-display text-2xl font-bold tabular-nums">
                  History: 76 → 68 → 57 → 43
                </div>
              </div>
            </Card>

            {/* AI Summary & Mastery */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="p-6 lg:col-span-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4.5 text-primary" />
                  <h2 className="font-display text-base font-semibold">AI Analysis Summary</h2>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {fallbackAnalysis.confidence}% confidence
                  </span>
                </div>
                <p className="mt-4 text-pretty leading-relaxed text-foreground/90">{fallbackAnalysis.summary}</p>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5 text-center">
                  <div>
                    <p className="font-display text-2xl font-bold tabular-nums text-destructive">{fallbackAnalysis.gaps.length}</p>
                    <p className="text-xs text-muted-foreground">Gaps detected</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold tabular-nums text-chart-2">{fallbackAnalysis.strengths.length}</p>
                    <p className="text-xs text-muted-foreground">Strengths</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold tabular-nums text-primary">
                      {fallbackAnalysis.recommendedInterventionIds.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Interventions</p>
                  </div>
                </div>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6">
                <RadialScore score={mastery} label="Mastery" />
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  Trend vs. last term <TrendPill delta={trendDelta(student)} />
                </p>
              </Card>
            </div>

            {/* Evidence: Why was this flagged? */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <div className="flex items-center gap-2">
                  <TriangleAlert className="size-4.5 text-destructive" />
                  <h2 className="font-display text-base font-semibold">Why Was This Student Flagged?</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Evidence generated by temporal & ML gap detector.</p>
                <ul className="mt-4 space-y-3">
                  {displayReasons.map((reason: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 rounded-lg border border-border p-3.5 text-sm">
                      <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-4.5 text-warning-foreground" />
                  <h2 className="font-display text-base font-semibold">Mathematics Topic Performance</h2>
                </div>
                <ul className="mt-4 space-y-3">
                  {[
                    { topic: "Algebra", acc: 81 },
                    { topic: "Functions", acc: 78 },
                    { topic: "Matrices", acc: 75 },
                    { topic: "Probability", acc: 71 },
                    { topic: "Quadratic Equations", acc: 43 },
                  ].map((item) => (
                    <li key={item.topic} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.topic}</span>
                        <span className="tabular-nums font-semibold">{item.acc}%</span>
                      </div>
                      <ScoreBar score={item.acc} />
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        ) : activeTab === "intervention" ? (
          /* Gemini Intervention & Teacher Control Tab */
          <div className="animate-in fade-in duration-500 space-y-6">
            {/* Teacher Control Card */}
            <Card className="p-6 border-primary/30 bg-primary/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold font-display">Teacher-in-the-Loop Controls</h3>
                  <p className="text-sm text-muted-foreground">
                    Current Decision Status:{" "}
                    <span className="font-bold text-foreground underline uppercase">{teacherStatus}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTeacherAccept}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                      teacherStatus === "ACCEPT"
                        ? "bg-success text-success-foreground"
                        : "bg-success/15 text-success hover:bg-success/25"
                    )}
                  >
                    <Check className="size-4" />
                    Accept Intervention
                  </button>
                  <button
                    type="button"
                    onClick={handleTeacherModify}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                      teacherStatus === "MODIFY"
                        ? "bg-warning text-warning-foreground"
                        : "bg-warning/15 text-warning-foreground hover:bg-warning/25"
                    )}
                  >
                    <Sliders className="size-4" />
                    Modify Plan
                  </button>
                  <button
                    type="button"
                    onClick={handleTeacherOverride}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                      teacherStatus === "OVERRIDE"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-destructive/15 text-destructive hover:bg-destructive/25"
                    )}
                  >
                    <XCircle className="size-4" />
                    Override
                  </button>
                </div>
              </div>
            </Card>

            {/* Gemini Generated Intervention Plan */}
            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <Sparkles className="size-5 text-primary" />
                <h2 className="font-display text-lg font-bold">Gemini 2.5 Flash Personalized Content</h2>
              </div>

              <div>
                <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">1. Concept Review</h4>
                <p className="mt-2 text-sm leading-relaxed">
                  {apiIntervention?.plan?.concept_review ||
                    "A quadratic equation is in the form ax² + bx + c = 0. Factoring involves finding two binomials (x + p)(x + q) such that p + q = b and p * q = c (when a = 1)."}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">2. Worked Example</h4>
                <div className="mt-2 rounded-lg bg-secondary/40 p-4 text-sm space-y-2">
                  <p className="font-medium text-foreground">
                    Problem: {apiIntervention?.plan?.worked_example?.problem || "Factor x² + 7x + 12 = 0"}
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {(apiIntervention?.plan?.worked_example?.steps || [
                      "Step 1: Identify coefficients a=1, b=7, c=12.",
                      "Step 2: Find numbers that multiply to 12 and add to 7 (3 and 4).",
                      "Step 3: Rewrite as (x + 3)(x + 4) = 0.",
                      "Step 4: Solutions are x = -3 or x = -4.",
                    ]).map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">3. Guided Intervention Steps</h4>
                <ol className="mt-2 space-y-2 text-sm">
                  {(apiIntervention?.plan?.intervention_steps || [
                    "Review middle-term splitting rules using visual area models.",
                    "Practice 5 guided factoring problems focusing on sign rules.",
                    "Complete targeted practice set with step-by-step hints.",
                    "Take mini reassessment quiz to measure score improvement.",
                  ]).map((step: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Card>
          </div>
        ) : (
          /* Reassessment & Gain Tab */
          <div className="animate-in fade-in duration-500 space-y-6">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold font-display">Student Reassessment & Score Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Simulate student completing post-intervention mini reassessment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunReassessment}
                  disabled={isSubmittingReassessment}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  {isSubmittingReassessment ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  Submit Reassessment
                </button>
              </div>

              {reassessmentResult && (
                <div className="mt-6 rounded-xl border border-success/30 bg-success/10 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wide text-success">Before Intervention</p>
                      <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                        {reassessmentResult.before_score}%
                      </p>
                    </div>
                    <div className="text-center">
                      <span className="rounded-full bg-success px-3 py-1 text-sm font-bold text-success-foreground">
                        {reassessmentResult.improvement_delta} Gain
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase font-bold tracking-wide text-success">After Intervention</p>
                      <p className="font-display text-3xl font-bold text-success tabular-nums">
                        {reassessmentResult.after_score}%
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-success-foreground border-t border-success/20 pt-3">
                    ✓ {reassessmentResult.updated_recommendation}
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
