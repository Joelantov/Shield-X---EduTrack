"use client"

// Mock, frontend-only auth for the EduTrack demo.
// No backend, no real credentials — the session lives in React state
// and is persisted to localStorage so it survives navigation/refresh.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type Role = "teacher" | "student"

export type Session = {
  role: Role
  name: string
  // Present only for students — links the session to a roster record.
  studentId?: string
}

const STORAGE_KEY = "edutrack-session"

type AuthValue = {
  session: Session | null
  ready: boolean
  loginTeacher: () => void
  loginStudent: (studentId: string, name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSession(JSON.parse(raw) as Session)
    } catch {
      // ignore malformed storage
    }
    setReady(true)
  }, [])

  const persist = useCallback((next: Session | null) => {
    setSession(next)
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // storage may be unavailable — session still works in-memory
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      session,
      ready,
      loginTeacher: () => persist({ role: "teacher", name: "Ms. Rivera" }),
      loginStudent: (studentId, name) => persist({ role: "student", name, studentId }),
      logout: () => persist(null),
    }),
    [session, ready, persist],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
