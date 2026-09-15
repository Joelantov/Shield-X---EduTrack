"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  type DomainKey,
  type RiskLevel,
  type Student,
  RISK_META,
  riskLevel,
  studentInitials,
} from "@/lib/edutrack-data"

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card/95 text-card-foreground shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/30 backdrop-blur-xs",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const meta = RISK_META[level]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-2xs transition-all duration-300 hover:scale-105",
        meta.tw,
        className,
      )}
    >
      <span className={cn("size-2 rounded-full animate-pulse", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}

const AVATAR_SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
  xl: "size-20 text-lg",
} as const

export function StudentAvatar({
  student,
  size = "md",
  className,
}: {
  student: Student
  size?: keyof typeof AVATAR_SIZES
  className?: string
}) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative inline-block shrink-0 group">
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white overflow-hidden shadow-sm ring-2 ring-background transition-all duration-300 group-hover:scale-105 group-hover:shadow-md",
          AVATAR_SIZES[size],
          className,
        )}
        style={{ backgroundColor: student.avatarColor }}
        aria-label={student.name}
      >
        {student.avatarUrl && !hasError ? (
          <img
            src={student.avatarUrl}
            alt={student.name}
            onError={() => setHasError(true)}
            className="size-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span>{studentInitials(student)}</span>
        )}
      </span>
    </div>
  )
}

function scoreColor(score: number) {
  if (score < 48) return "bg-gradient-to-r from-destructive to-rose-500"
  if (score < 55) return "bg-gradient-to-r from-warning to-amber-500"
  if (score < 80) return "bg-gradient-to-r from-primary to-indigo-500"
  return "bg-gradient-to-r from-success to-emerald-500"
}

export function ScoreBar({
  score,
  label,
  className,
}: {
  score: number
  label?: string
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-muted-foreground">{label}</span>
          <span className="tabular-nums font-bold text-foreground">{score}%</span>
        </div>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/80 p-0.5 shadow-inner" role="presentation">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out shadow-xs", scoreColor(score))}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  )
}

export function RadialScore({
  score,
  size = 132,
  stroke = 12,
  label,
}: {
  score: number
  size?: number
  stroke?: number
  label?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const level: RiskLevel = score < 50 ? "at-risk" : score < 68 ? "watch" : "on-track"
  const color = `var(--${level === "at-risk" ? "destructive" : level === "watch" ? "warning" : "success"})`

  return (
    <div className="relative inline-flex items-center justify-center transition-transform duration-300 hover:scale-105" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 drop-shadow-xs">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-extrabold tabular-nums leading-none tracking-tight text-foreground">{score}</span>
        {label ? <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span> : null}
      </div>
    </div>
  )
}

export function TrendPill({ delta }: { delta: number }) {
  const up = delta > 0
  const flat = delta === 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums shadow-2xs transition-transform duration-200 hover:scale-105",
        flat
          ? "bg-muted text-muted-foreground"
          : up
            ? "bg-success/15 text-success border border-success/30"
            : "bg-destructive/15 text-destructive border border-destructive/30",
      )}
    >
      <span aria-hidden>{flat ? "→" : up ? "▲" : "▼"}</span>
      {up ? "+" : ""}
      {delta}
    </span>
  )
}

export { riskLevel }
export type { DomainKey }
