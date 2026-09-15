"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, Sparkles, User, Users, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { STUDENTS, overallScore } from "@/lib/edutrack-data"
import { StudentAvatar } from "@/components/edutrack/primitives"

type Tab = "teacher" | "student"

export default function LoginPage() {
  const { session, ready, loginTeacher, loginStudent } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("teacher")
  const [studentId, setStudentId] = useState(STUDENTS[0].id)

  // If already signed in, bounce to the right dashboard.
  useEffect(() => {
    if (!ready || !session) return
    router.replace(session.role === "teacher" ? "/" : "/student")
  }, [ready, session, router])

  function handleTeacher(e: React.FormEvent) {
    e.preventDefault()
    loginTeacher()
    router.replace("/")
  }

  function handleStudent(e: React.FormEvent) {
    e.preventDefault()
    const s = STUDENTS.find((x) => x.id === studentId)
    if (!s) return
    loginStudent(s.id, s.name)
    router.replace("/student")
  }

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px circle at 20% 15%, color-mix(in oklab, var(--sidebar-primary) 45%, transparent), transparent 55%), radial-gradient(500px circle at 85% 80%, color-mix(in oklab, var(--chart-2) 40%, transparent), transparent 55%)",
          }}
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <GraduationCap className="size-6" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-xl font-bold tracking-tight">EduTrack</p>
            <p className="text-xs text-sidebar-foreground/60">Early Learning Intervention</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/40 px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5 text-sidebar-primary" />
            AI-Powered Insights
          </p>
          <h1 className="text-balance font-display text-3xl font-bold leading-tight">
            Detect the gap. Understand the reason. Deliver the right intervention.
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-sidebar-foreground/60">
            One workspace for teachers to track class-wide learning and for students to see exactly where to grow next.
          </p>
        </div>

        <p className="relative text-xs text-sidebar-foreground/45">
          Demo environment · Simulated AI · No real student data
        </p>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center bg-background px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight">Sign in to EduTrack</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Choose how you want to sign in.</p>

          {/* Role tabs */}
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/50 p-1">
            {(
              [
                { id: "teacher" as Tab, label: "Teacher", icon: Users },
                { id: "student" as Tab, label: "Student", icon: User },
              ]
            ).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setTab(r.id)}
                aria-pressed={tab === r.id}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  tab === r.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <r.icon className="size-4" />
                {r.label}
              </button>
            ))}
          </div>

          {tab === "teacher" ? (
            <form onSubmit={handleTeacher} className="mt-6 space-y-4">
              <Field label="Email">
                <input
                  type="email"
                  defaultValue="rivera@edutrack.school"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none ring-primary/30 transition focus:border-primary focus:ring-2"
                  autoComplete="email"
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  defaultValue="demo1234"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none ring-primary/30 transition focus:border-primary focus:ring-2"
                  autoComplete="current-password"
                />
              </Field>
              <SubmitButton>Sign in as teacher</SubmitButton>
              <p className="text-center text-xs text-muted-foreground">
                Demo account is pre-filled — just click to continue.
              </p>
            </form>
          ) : (
            <form onSubmit={handleStudent} className="mt-6 space-y-4">
              <Field label="Select your name">
                <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-lg border border-border bg-card p-1.5">
                  {STUDENTS.map((s) => {
                    const selected = s.id === studentId
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setStudentId(s.id)}
                        aria-pressed={selected}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                          selected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted",
                        )}
                      >
                        <StudentAvatar student={s} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{s.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {s.grade} · Overall {overallScore(s)}
                          </span>
                        </span>
                        {selected ? <ChevronRight className="size-4 text-primary" /> : null}
                      </button>
                    )
                  })}
                </div>
              </Field>
              <SubmitButton>Sign in as student</SubmitButton>
              <p className="text-center text-xs text-muted-foreground">
                Pick a student profile to view their personal progress.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.99]"
    >
      {children}
      <ChevronRight className="size-4" />
    </button>
  )
}
