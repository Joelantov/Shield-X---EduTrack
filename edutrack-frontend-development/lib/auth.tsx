"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { loginUser, registerUser } from "@/lib/api"

export type Role = "teacher" | "student"

export type Session = {
  role: Role
  name: string
  email?: string
  studentId?: string
}

const STORAGE_KEY = "edutrack-session"

type AuthValue = {
  session: Session | null
  ready: boolean
  loginTeacher: (email?: string, password?: string) => Promise<boolean>
  loginStudent: (studentId: string, name: string, email?: string, password?: string) => Promise<boolean>
  registerAccount: (email: string, password: string, name: string, role: Role, studentId?: string) => Promise<boolean>
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
      // ignore
    }
    setReady(true)
  }, [])

  const persist = useCallback((next: Session | null) => {
    setSession(next)
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // storage unavailable
    }
  }, [])

  const loginTeacher = useCallback(async (email?: string, password?: string) => {
    if (email && password) {
      const dbUser = await loginUser(email, password)
      if (dbUser) {
        persist({ role: "teacher", name: dbUser.name || "Ms. Rivera", email: dbUser.email })
        return true
      }
    }
    // Fallback/Demo mode
    persist({ role: "teacher", name: "Ms. Rivera", email: email || "rivera@edutrack.school" })
    return true
  }, [persist])

  const loginStudent = useCallback(async (studentId: string, name: string, email?: string, password?: string) => {
    if (email && password) {
      const dbUser = await loginUser(email, password)
      if (dbUser) {
        persist({ role: "student", name: dbUser.name || name, studentId: dbUser.student_id || studentId, email: dbUser.email })
        return true
      }
    }
    // Fallback/Demo mode
    persist({ role: "student", name, studentId, email })
    return true
  }, [persist])

  const registerAccount = useCallback(async (email: string, password: string, name: string, role: Role, studentId?: string) => {
    const dbUser = await registerUser({ email, password, name, role, student_id: studentId })
    if (dbUser) {
      persist({ role: (dbUser.role as Role) || role, name: dbUser.name || name, email: dbUser.email, studentId: dbUser.student_id || studentId })
      return true
    }
    // Fallback mode
    persist({ role, name, email, studentId })
    return true
  }, [persist])

  const logout = useCallback(() => persist(null), [persist])

  const value = useMemo<AuthValue>(
    () => ({
      session,
      ready,
      loginTeacher,
      loginStudent,
      registerAccount,
      logout,
    }),
    [session, ready, loginTeacher, loginStudent, registerAccount, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
