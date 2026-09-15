"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Sparkles,
  ClipboardList,
  GraduationCap,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/interventions", label: "Interventions", icon: ClipboardList },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname.startsWith(href)
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className={cn("size-4.5 shrink-0", active ? "" : "opacity-80")} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
        <GraduationCap className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-base font-bold tracking-tight text-sidebar-foreground">EduTrack</p>
        <p className="text-[11px] text-sidebar-foreground/55">Early Learning Intervention</p>
      </div>
    </div>
  )
}

function SidebarInner({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { session, logout } = useAuth()
  const router = useRouter()

  function handleLogout() {
    onNavigate?.()
    logout()
    router.replace("/login")
  }

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Brand />
      <div className="px-1">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Workspace
        </p>
        <NavLinks pathname={pathname} onNavigate={onNavigate} />
      </div>

      <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3.5">
        <div className="flex items-center gap-2 text-sidebar-foreground">
          <Sparkles className="size-4 text-sidebar-primary" />
          <p className="text-xs font-semibold">AI Insight Engine</p>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-sidebar-foreground/60">
          Analysis is simulated on-device from mock signals. No student data leaves the browser.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-xl px-1">
        <span className="flex size-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
          RM
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{session?.name ?? "Ms. Rivera"}</p>
          <p className="text-[11px] text-sidebar-foreground/55">Grade 8 · Room 14</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 bg-sidebar lg:block">
        <div className="sticky top-0 h-svh">
          <SidebarInner pathname={pathname} />
        </div>
      </aside>

      {/* Mobile top bar toggle */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-9 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-sidebar shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
              aria-label="Close navigation menu"
            >
              <X className="size-4.5" />
            </button>
            <SidebarInner pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  )
}
