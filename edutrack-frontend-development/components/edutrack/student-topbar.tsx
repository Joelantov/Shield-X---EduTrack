"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  GraduationCap,
  LogOut,
  LayoutDashboard,
  TrendingUp,
  GitFork,
  Target,
  CalendarDays,
  Award,
  Sparkles,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

export function StudentTopbar() {
  const { session, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  const navItems = [
    { href: "/student", label: "Overview", icon: LayoutDashboard },
    { href: "/student/growth", label: "Growth & Attendance", icon: TrendingUp },
    { href: "/student/knowledge-graph", label: "Knowledge Graph", icon: GitFork },
    { href: "/student/improvement", label: "Improvement", icon: Target },
    { href: "/student/planner", label: "Planner & Goals", icon: CalendarDays },
    { href: "/student/grades", label: "Grades", icon: Award },
    { href: "/student/copilot", label: "Ask EduTrack", icon: Sparkles, highlight: true },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-sidebar/95 text-sidebar-foreground backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link href="/student" className="flex items-center gap-2.5 group">
          <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-bold tracking-tight">EduTrack</p>
            <p className="text-[11px] text-sidebar-foreground/60">Student Portal</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-sidebar-foreground/70 sm:inline">
            Student: <strong className="font-semibold text-sidebar-foreground">{session?.name}</strong>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sidebar-border px-3 py-1.5 text-xs font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <LogOut className="size-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Sub-page Navigation Tabs */}
      <nav className="border-t border-sidebar-border/60 bg-sidebar/50 px-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto py-1.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                  isActive
                    ? item.highlight
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs font-bold"
                    : item.highlight
                      ? "text-primary hover:bg-primary/10"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn("size-3.5", isActive && item.highlight && "animate-pulse")} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
