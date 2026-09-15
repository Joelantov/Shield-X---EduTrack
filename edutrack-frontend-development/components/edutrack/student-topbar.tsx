"use client"

import { useRouter } from "next/navigation"
import { GraduationCap, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function StudentTopbar() {
  const { session, logout } = useAuth()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <GraduationCap className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-bold tracking-tight">EduTrack</p>
            <p className="text-[11px] text-sidebar-foreground/55">My Learning Progress</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-sidebar-foreground/70 sm:inline">
            Signed in as <span className="font-medium text-sidebar-foreground">{session?.name}</span>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-sidebar-border px-3 py-1.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
