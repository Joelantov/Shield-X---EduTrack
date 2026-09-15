"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Search, ArrowUpRight, SlidersHorizontal, UserPlus, X, CheckCircle2 } from "lucide-react"
import { PageHeader } from "@/components/edutrack/page-header"
import { Card, RiskBadge, StudentAvatar, TrendPill } from "@/components/edutrack/primitives"
import {
  STUDENTS,
  type RiskLevel,
  overallScore,
  trendDelta,
  riskLevel,
  analyzeStudent,
  DOMAIN_LABEL,
} from "@/lib/edutrack-data"
import { fetchStudents, createStudent } from "@/lib/api"
import { cn } from "@/lib/utils"

type FilterKey = "all" | RiskLevel
type SortKey = "risk" | "mastery-asc" | "mastery-desc" | "name"

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "at-risk", label: "At Risk" },
  { key: "watch", label: "Watch" },
  { key: "on-track", label: "On Track" },
]

const SORTS: { key: SortKey; label: string }[] = [
  { key: "risk", label: "Priority (risk first)" },
  { key: "mastery-asc", label: "Mastery: low to high" },
  { key: "mastery-desc", label: "Mastery: high to low" },
  { key: "name", label: "Name (A–Z)" },
]

const RISK_RANK: Record<RiskLevel, number> = { "at-risk": 0, watch: 1, "on-track": 2 }

const EMPTY_FORM = {
  name: "",
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
}

export default function StudentsPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterKey>("all")
  const [sort, setSort] = useState<SortKey>("risk")
  const [roster, setRoster] = useState<any[]>(STUDENTS)

  // Add Student modal state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isCreatingStudent, setIsCreatingStudent] = useState(false)
  const [addStudentSuccess, setAddStudentSuccess] = useState<string | null>(null)
  const [newStudentForm, setNewStudentForm] = useState(EMPTY_FORM)

  const loadRoster = () => {
    fetchStudents().then((res) => {
      if (res && res.length > 0) setRoster(res)
    })
  }

  useEffect(() => {
    loadRoster()
  }, [])

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

    const created = await createStudent({ ...newStudentForm, scores })

    if (created) {
      loadRoster()
      setIsAddStudentOpen(false)
      setNewStudentForm(EMPTY_FORM)
      setAddStudentSuccess(`${created.name} has been added to EduTrack!`)
      setTimeout(() => setAddStudentSuccess(null), 4000)
    } else {
      setIsAddStudentOpen(false)
      setAddStudentSuccess("Student added! (Backend offline — restart backend to persist)")
      setTimeout(() => setAddStudentSuccess(null), 4000)
    }
    setIsCreatingStudent(false)
  }

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: roster.length, "at-risk": 0, watch: 0, "on-track": 0 }
    for (const s of roster) c[riskLevel(s)]++
    return c
  }, [roster])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = roster.filter((s) => {
      const matchQ = !q || s.name.toLowerCase().includes(q)
      const matchF = filter === "all" || riskLevel(s) === filter
      return matchQ && matchF
    })
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name)
        case "mastery-asc":
          return overallScore(a) - overallScore(b)
        case "mastery-desc":
          return overallScore(b) - overallScore(a)
        case "risk":
        default:
          return RISK_RANK[riskLevel(a)] - RISK_RANK[riskLevel(b)] || overallScore(a) - overallScore(b)
      }
    })
    return list
  }, [query, filter, sort, roster])

  return (
    <div className="pb-14">
      {/* Success toast */}
      {addStudentSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-5 py-3 shadow-xl backdrop-blur-sm text-sm font-medium text-success">
            <CheckCircle2 className="size-4 shrink-0" />
            {addStudentSuccess}
          </div>
        </div>
      )}

      <PageHeader
        eyebrow="Roster"
        title="Students"
        description="Every learner with their current mastery, trend, and AI-detected gaps. Select a student for the full intervention analysis."
        action={
          <button
            type="button"
            onClick={() => setIsAddStudentOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <UserPlus className="size-4" />
            Add Student
          </button>
        }
      />

      <div className="space-y-5 px-5 py-6 sm:px-8">
        {/* Controls */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  filter === f.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    filter === f.key ? "bg-primary-foreground/20" : "bg-muted",
                  )}
                >
                  {counts[f.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students..."
                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/40"
                aria-label="Search students by name"
              />
            </div>
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 appearance-none rounded-lg border border-border bg-card pl-9 pr-8 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/40"
                aria-label="Sort students"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid of student cards */}
        {rows.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            No students match your search.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((student) => {
              const analysis = analyzeStudent(student)
              const level = riskLevel(student)
              const mastery = overallScore(student)
              return (
                <Card key={student.id} className="group flex flex-col p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <StudentAvatar student={student} size="lg" />
                      <div>
                        <p className="font-semibold leading-tight">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.grade}</p>
                      </div>
                    </div>
                    <RiskBadge level={level} />
                  </div>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Mastery</p>
                      <p className="flex items-center gap-2 font-display text-2xl font-bold tabular-nums">
                        {mastery}%<TrendPill delta={trendDelta(student)} />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Detected gaps</p>
                      <p className="font-display text-2xl font-bold tabular-nums">{analysis.gaps.length}</p>
                    </div>
                  </div>

                  <div className="mt-4 min-h-[2.75rem]">
                    {analysis.gaps.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.gaps.slice(0, 3).map((g) => (
                          <span
                            key={g.domain}
                            className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                          >
                            {DOMAIN_LABEL[g.domain]}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                        No gaps · ready for enrichment
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/students/${student.id}`}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    View AI analysis
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ADD STUDENT MODAL */}
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

                <div>
                  <label className="font-medium text-foreground block mb-1">Attendance %</label>
                  <input
                    type="number"
                    max="100"
                    min="0"
                    value={newStudentForm.attendance}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, attendance: Number(e.target.value) })}
                    className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-2 border-t border-border pt-3">
                  Initial Skill Scores (%):
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { key: "phonics", label: "Phonics" },
                    { key: "fluency", label: "Fluency" },
                    { key: "comprehension", label: "Comprehension" },
                    { key: "numberSense", label: "Number Sense" },
                    { key: "arithmetic", label: "Arithmetic" },
                    { key: "problemSolving", label: "Problem Solving" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <span>{label}</span>
                      <input
                        type="number"
                        max="100"
                        min="0"
                        value={(newStudentForm as any)[key]}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, [key]: Number(e.target.value) })}
                        className="w-full h-8 rounded border border-border bg-card px-2 mt-1"
                      />
                    </div>
                  ))}
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
