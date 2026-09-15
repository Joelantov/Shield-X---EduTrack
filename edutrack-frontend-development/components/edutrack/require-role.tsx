"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap } from "lucide-react"
import { useAuth, type Role } from "@/lib/auth"

function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <span className="flex size-11 animate-pulse items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="size-6" />
        </span>
        <p className="text-sm">Loading your workspace…</p>
      </div>
    </div>
  )
}

export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { session, ready } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (!session) {
      router.replace("/login")
    } else if (session.role !== role) {
      router.replace(session.role === "teacher" ? "/" : "/student")
    }
  }, [ready, session, role, router])

  if (!ready || !session || session.role !== role) return <Loading />
  return <>{children}</>
}
