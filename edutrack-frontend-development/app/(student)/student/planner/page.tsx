"use client"

import { useState } from "react"
import { CalendarDays, Target, Sparkles, CheckCircle2, Plus, Clock, Award } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getStudent, overallScore, trendDelta } from "@/lib/edutrack-data"
import { Card, ScoreBar } from "@/components/edutrack/primitives"

export default function StudentPlannerPage() {
  const { session } = useAuth()
  const student = session?.studentId ? getStudent(session.studentId) : undefined

  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Boost Problem Solving score to ≥65%",
      category: "Academic Target",
      progress: 55,
      targetDate: "End of Term 3",
      aiRecommendation: "Practice 1 quadratic factoring problem set daily.",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Maintain ≥90% Monthly Attendance",
      category: "Attendance Goal",
      progress: student?.signals.attendance || 88,
      targetDate: "Ongoing",
      aiRecommendation: "Great consistency! Keep up your 88%+ attendance streak.",
      status: "On Track",
    },
    {
      id: 3,
      title: "Complete 3 Mini Reassessment Quizzes",
      category: "Practice Target",
      progress: 66,
      targetDate: "March 30",
      aiRecommendation: "1 quiz remaining to complete your monthly practice goal.",
      status: "In Progress",
    },
    {
      id: 4,
      title: "Sustain Comprehension Mastery (≥80%)",
      category: "Strength Goal",
      progress: 81,
      targetDate: "End of Year",
      aiRecommendation: "Excellent comprehension! Challenge yourself with advanced passages.",
      status: "Achieved",
    },
  ])

  const [newGoalTitle, setNewGoalTitle] = useState("")

  if (!student) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-muted-foreground">Please sign in to view your Academic Planner.</p>
      </div>
    )
  }

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoalTitle.trim()) return

    setGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newGoalTitle,
        category: "Personal Goal",
        progress: 10,
        targetDate: "End of Term 3",
        aiRecommendation: "Break your goal down into small 10-minute daily steps.",
        status: "In Progress",
      },
    ])
    setNewGoalTitle("")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6 sm:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Learning Roadmap</span>
          <h1 className="font-display text-2xl font-bold text-foreground">Academic Year Planner & AI Goals</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>{student.name}</span>
          <span>•</span>
          <span className="text-foreground">{student.grade} ({student.section || "Sec A"})</span>
          <span>•</span>
          <span className="text-primary font-bold">Roll No: {student.rollNo || "#14"}</span>
        </div>
      </div>

      {/* ACADEMIC YEAR ROADMAP TIMELINE */}
      <Card className="p-6 space-y-6 border-primary/20">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Academic Year Roadmap 2025–2026</h2>
          </div>
          <span className="text-xs font-bold text-primary">Term 3 Active</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4 space-y-2 border-success/40 bg-success/5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-success">Term 1</span>
              <span className="rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success">Completed</span>
            </div>
            <h3 className="font-display font-bold text-sm text-foreground">Diagnostic Baseline</h3>
            <p className="text-xs text-muted-foreground">Initial diagnostic assessments completed across literacy & numeracy.</p>
          </Card>

          <Card className="p-4 space-y-2 border-success/40 bg-success/5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-success">Term 2</span>
              <span className="rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success">Completed</span>
            </div>
            <h3 className="font-display font-bold text-sm text-foreground">Mid-Year Review</h3>
            <p className="text-xs text-muted-foreground">Progress checkpoint. Targeted algebra & reading interventions assigned.</p>
          </Card>

          <Card className="p-4 space-y-2 border-primary/50 bg-primary/5 ring-1 ring-primary/30">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-primary">Term 3 (Current)</span>
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">In Progress</span>
            </div>
            <h3 className="font-display font-bold text-sm text-foreground">Skill Recovery & Practice</h3>
            <p className="text-xs text-muted-foreground">Focusing on Quadratic Equations factoring & word problem solving.</p>
          </Card>

          <Card className="p-4 space-y-2 border-border bg-secondary/20 opacity-80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-muted-foreground">Term 4</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Upcoming</span>
            </div>
            <h3 className="font-display font-bold text-sm text-foreground">Final Reassessment</h3>
            <p className="text-xs text-muted-foreground">End-of-year comprehensive evaluation and promotion review.</p>
          </Card>
        </div>
      </Card>

      {/* AI GOALS & PERSONAL TARGETS TRACKER */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Target className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Personal AI Learning Goals</h2>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {goals.filter((g) => g.status === "Achieved").length} of {goals.length} Achieved
          </span>
        </div>

        {/* Goals List */}
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-4 space-y-3 border-border hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{goal.category}</span>
                  <h3 className="font-display font-bold text-sm text-foreground">{goal.title}</h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    goal.status === "Achieved"
                      ? "bg-success/15 text-success"
                      : goal.status === "On Track"
                        ? "bg-primary/15 text-primary"
                        : "bg-warning/20 text-warning-foreground"
                  }`}
                >
                  {goal.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Target Date: {goal.targetDate}</span>
                  <span className="text-foreground">{goal.progress}%</span>
                </div>
                <ScoreBar score={goal.progress} />
              </div>

              {/* AI Recommendation */}
              <div className="rounded-lg bg-primary/5 p-2.5 text-xs text-muted-foreground flex items-start gap-2">
                <Sparkles className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-primary font-semibold">AI Tip:</strong> {goal.aiRecommendation}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Personal Goal Form */}
        <form onSubmit={handleAddGoal} className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border">
          <input
            type="text"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            placeholder="Add a new personal learning goal (e.g. Master Fraction multiplication)..."
            className="flex-1 w-full h-10 rounded-lg border border-border bg-card px-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            <span>Add Goal</span>
          </button>
        </form>
      </Card>
    </div>
  )
}
