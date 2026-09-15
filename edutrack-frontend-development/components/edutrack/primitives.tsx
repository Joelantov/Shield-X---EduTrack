import type { ReactNode } from "react"
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
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
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
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        meta.tw,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}

const AVATAR_SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
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
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        AVATAR_SIZES[size],
        className,
      )}
      style={{ backgroundColor: student.avatarColor }}
      aria-hidden
    >
      {studentInitials(student)}
    </span>
  )
}

function scoreColor(score: number) {
  if (score < 48) return "bg-destructive"
  if (score < 55) return "bg-warning"
  if (score < 80) return "bg-chart-1"
  return "bg-success"
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
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium tabular-nums">{score}</span>
        </div>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="presentation">
        <div
          className={cn("h-full rounded-full transition-all", scoreColor(score))}
          style={{ width: `${score}%` }}
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
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
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
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold tabular-nums leading-none">{score}</span>
        {label ? <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span> : null}
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
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
        flat
          ? "bg-muted text-muted-foreground"
          : up
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive",
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
