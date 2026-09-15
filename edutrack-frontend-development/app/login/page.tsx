"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, Sparkles, User, Users, ChevronRight, UserPlus, LogIn, Lock, Mail, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth, type Role } from "@/lib/auth"
import { STUDENTS, overallScore } from "@/lib/edutrack-data"
import { StudentAvatar } from "@/components/edutrack/primitives"

type Tab = "teacher" | "student"
type Mode = "login" | "register"

export default function LoginPage() {
  const { session, ready, loginTeacher, loginStudent, registerAccount } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("teacher")
  const [mode, setMode] = useState<Mode>("login")
  const [studentId, setStudentId] = useState(STUDENTS[0].id)

  // Form states
  const [email, setEmail] = useState("rivera@edutrack.school")
  const [password, setPassword] = useState("demo1234")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [authFeedback, setAuthFeedback] = useState<string | null>(null)

  // If already signed in, bounce to the right dashboard.
  useEffect(() => {
    if (!ready || !session) return
    router.replace(session.role === "teacher" ? "/" : "/student")
  }, [ready, session, router])

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await loginTeacher(email, password)
    setAuthFeedback("Authenticated successfully! Redirecting...")
    setTimeout(() => router.replace("/"), 1000)
  }

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const s = STUDENTS.find((x) => x.id === studentId)
    await loginStudent(s?.id || studentId, s?.name || "Student", email, password)
    setAuthFeedback("Student session authenticated! Redirecting...")
    setTimeout(() => router.replace("/student"), 1000)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim() || !name.trim()) return

    setIsLoading(true)
    const currentRole: Role = tab
    const selectedSid = tab === "student" ? studentId : undefined

    await registerAccount(email, password, name, currentRole, selectedSid)
    setAuthFeedback(`Account created as ${currentRole.toUpperCase()}! Redirecting...`)
    setTimeout(() => {
      router.replace(currentRole === "teacher" ? "/" : "/student")
    }, 1200)
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
            AI-Powered Classroom Intelligence
          </p>
          <h1 className="text-balance font-display text-3xl font-bold leading-tight">
            Detect the gap. Understand the reason. Deliver the right intervention.
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-sidebar-foreground/60">
            One workspace for teachers to track class-wide learning and for students to see exactly where to grow next.
          </p>
        </div>

        <p className="relative text-xs text-sidebar-foreground/45 flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-sidebar-primary/60" />
          EduTrack · Secure Authentication · AI Learning Platform
        </p>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center bg-background px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="font-display font-bold text-xl">EduTrack</span>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {mode === "login" ? "Sign in to EduTrack" : "Create Your Account"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {mode === "login"
                ? "Enter your credentials or use a demo account."
                : "Register a new account to get started."}
            </p>
          </div>

          {/* Feedback Toast */}
          {authFeedback && (
            <div className="rounded-xl border border-success/30 bg-success/10 p-3 text-xs font-semibold text-success flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{authFeedback}</span>
            </div>
          )}

          {/* Mode toggle (Sign In vs Register) */}
          <div className="flex rounded-lg border border-border p-1 bg-muted/30 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={cn(
                "flex-1 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5",
                mode === "login" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LogIn className="size-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register")
                if (!name) setName(tab === "teacher" ? "Teacher User" : "Student User")
              }}
              className={cn(
                "flex-1 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5",
                mode === "register" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserPlus className="size-3.5" />
              Register
            </button>
          </div>

          {/* Role tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/50 p-1">
            {(
              [
                { id: "teacher" as Tab, label: "Teacher Role", icon: Users },
                { id: "student" as Tab, label: "Student Role", icon: User },
              ]
            ).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setTab(r.id)
                  if (r.id === "teacher" && mode === "login") setEmail("rivera@edutrack.school")
                  else if (r.id === "student" && mode === "login") setEmail("ananya@edutrack.school")
                }}
                aria-pressed={tab === r.id}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
                  tab === r.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <r.icon className="size-3.5" />
                {r.label}
              </button>
            ))}
          </div>

          {/* SIGN IN MODE */}
          {mode === "login" ? (
            tab === "teacher" ? (
              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <Field label="Teacher Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rivera@edutrack.school"
                      className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-xs sm:text-sm outline-none ring-primary/30 transition focus:border-primary focus:ring-2"
                      required
                    />
                  </div>
                </Field>

                <Field label="Password">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-xs sm:text-sm outline-none ring-primary/30 transition focus:border-primary focus:ring-2"
                      required
                    />
                  </div>
                </Field>

                <SubmitButton isLoading={isLoading}>Sign In</SubmitButton>
                <p className="text-center text-[11px] text-muted-foreground">
                  Default Demo: <strong className="text-foreground">rivera@edutrack.school</strong> / <strong className="text-foreground">demo1234</strong>
                </p>
              </form>
            ) : (
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <Field label="Select Student Profile">
                  <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-border bg-card p-1.5 no-scrollbar">
                    {STUDENTS.map((s) => {
                      const selected = s.id === studentId
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => {
                            setStudentId(s.id)
                            setEmail(`${s.name.toLowerCase().split(" ")[0]}@edutrack.school`)
                          }}
                          aria-pressed={selected}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left transition-colors",
                            selected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted",
                          )}
                        >
                          <StudentAvatar student={s} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-bold">{s.name}</span>
                            <span className="block text-[10px] text-muted-foreground">
                              {s.grade} · Overall {overallScore(s)}%
                            </span>
                          </span>
                          {selected ? <ChevronRight className="size-4 text-primary" /> : null}
                        </button>
                      )
                    })}
                  </div>
                </Field>

                <Field label="Student Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs sm:text-sm outline-none ring-primary/30 transition focus:border-primary focus:ring-2"
                    required
                  />
                </Field>

                <Field label="Password">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs sm:text-sm outline-none ring-primary/30 transition focus:border-primary focus:ring-2"
                    required
                  />
                </Field>

                <SubmitButton isLoading={isLoading}>Sign In as Student</SubmitButton>
              </form>
            )
          ) : (
            /* REGISTER MODE */
            <form onSubmit={handleRegister} className="space-y-4">
              <Field label="Full Name">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diya Patel"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs sm:text-sm outline-none ring-primary/30 transition focus:border-primary focus:ring-2"
                />
              </Field>

              <Field label="Email Address">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@edutrack.school"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs sm:text-sm outline-none ring-primary/30 transition focus:border-primary focus:ring-2"
                />
              </Field>

              <Field label="Create Password">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose password"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs sm:text-sm outline-none ring-primary/30 transition focus:border-primary focus:ring-2"
                />
              </Field>

              {tab === "student" && (
                <Field label="Link Student Profile">
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs sm:text-sm outline-none"
                  >
                    {STUDENTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.grade})
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
              >
                <UserPlus className="size-4" />
                <span>Create Account</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="block text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  )
}

function SubmitButton({ children, isLoading }: { children: React.ReactNode; isLoading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
    >
      {children}
      <ChevronRight className="size-4" />
    </button>
  )
}
