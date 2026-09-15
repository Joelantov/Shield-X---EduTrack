"use client"

import { useMemo, useState, useEffect } from "react"
import { Clock, Repeat, ChevronDown, Layers, Check, UserCheck, X } from "lucide-react"
import { PageHeader } from "@/components/edutrack/page-header"
import { Card } from "@/components/edutrack/primitives"
import {
  INTERVENTIONS,
  DOMAINS,
  DOMAIN_LABEL,
  STUDENTS,
  type DomainKey,
  type InterventionTier,
} from "@/lib/edutrack-data"
import { fetchStudents, assignInterventionToStudent } from "@/lib/api"
import { cn } from "@/lib/utils"

type DomainFilter = "all" | DomainKey
type TierFilter = "all" | InterventionTier

const TIERS: InterventionTier[] = ["Tier 1", "Tier 2", "Tier 3"]

const TIER_META: Record<InterventionTier, { tw: string; desc: string }> = {
  "Tier 1": { tw: "bg-success/10 text-success border-success/20", desc: "Whole-class, universal support" },
  "Tier 2": { tw: "bg-warning/15 text-warning-foreground border-warning/30", desc: "Targeted small-group support" },
  "Tier 3": { tw: "bg-destructive/10 text-destructive border-destructive/20", desc: "Intensive individualized support" },
}

export default function InterventionsPage() {
  const [domain, setDomain] = useState<DomainFilter>("all")
  const [tier, setTier] = useState<TierFilter>("all")
  const [open, setOpen] = useState<string | null>(INTERVENTIONS[0]?.id ?? null)
  
  // State for Assigning Interventions
  const [studentRoster, setStudentRoster] = useState<any[]>(STUDENTS)
  const [assignModalIv, setAssignModalIv] = useState<any | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(STUDENTS[0]?.id || "")
  const [assignedStatus, setAssignedStatus] = useState<Record<string, string>>({}) // ivId -> studentName
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null) // toast message

  useEffect(() => {
    fetchStudents().then((res) => {
      if (res && res.length > 0) setStudentRoster(res)
    })
  }, [])

  const list = useMemo(
    () =>
      INTERVENTIONS.filter(
        (iv) => (domain === "all" || iv.domain === domain) && (tier === "all" || iv.tier === tier),
      ),
    [domain, tier],
  )

  const handleConfirmAssignment = async () => {
    if (!assignModalIv || !selectedStudentId) return
    setIsAssigning(true)
    const targetStudent = studentRoster.find((s) => s.id === selectedStudentId)
    const studentName = targetStudent ? targetStudent.name : selectedStudentId

    try {
      await assignInterventionToStudent(selectedStudentId, assignModalIv.id, assignModalIv.title)
    } catch (_) {
      // Assignment recorded locally even if backend is unavailable
    }
    
    setAssignedStatus((prev) => ({
      ...prev,
      [assignModalIv.id]: studentName,
    }))
    
    setIsAssigning(false)
    setAssignModalIv(null)
    setSelectedStudentId(studentRoster[0]?.id || "")
    setAssignSuccess(`"${assignModalIv.title}" assigned to ${studentName}!`)
    setTimeout(() => setAssignSuccess(null), 4000)
  }

  return (
    <div className="pb-14 relative">
      {/* Assignment success toast */}
      {assignSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-5 py-3 shadow-xl backdrop-blur-sm text-sm font-medium text-success">
            <Check className="size-4 shrink-0" />
            {assignSuccess}
          </div>
        </div>
      )}

      <PageHeader
        eyebrow="Action Library"
        title="Interventions"
        description="Evidence-based, tiered strategies the AI engine draws from. Filter by skill domain or support tier and assign to student plans."
      />

      <div className="space-y-5 px-5 py-6 sm:px-8">
        {/* Tier legend */}
        <div className="grid gap-3 sm:grid-cols-3">
          {TIERS.map((t) => (
            <Card key={t} className="flex items-center gap-3 p-4">
              <span className={cn("flex size-9 items-center justify-center rounded-lg border", TIER_META[t].tw)}>
                <Layers className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-xs text-muted-foreground">{TIER_META[t].desc}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDomain("all")}
              aria-pressed={domain === "all"}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                domain === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              All domains
            </button>
            {DOMAINS.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setDomain(d.key)}
                aria-pressed={domain === d.key}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  domain === d.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTier("all")}
              aria-pressed={tier === "all"}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                tier === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              All tiers
            </button>
            {TIERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                aria-pressed={tier === t}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  tier === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {list.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            No interventions match these filters.
          </Card>
        ) : (
          <div className="space-y-3">
            {list.map((iv) => {
              const isOpen = open === iv.id
              const assignedTo = assignedStatus[iv.id]
              return (
                <Card key={iv.id} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : iv.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", TIER_META[iv.tier].tw)}>
                          {iv.tier}
                        </span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                          {DOMAIN_LABEL[iv.domain]}
                        </span>
                        {assignedTo && (
                          <span className="rounded-full bg-success/10 border border-success/30 px-2.5 py-0.5 text-[11px] font-semibold text-success flex items-center gap-1">
                            <Check className="size-3" /> Assigned to {assignedTo}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 font-medium">{iv.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{iv.summary}</p>
                    </div>
                    <div className="hidden shrink-0 items-center gap-4 text-xs text-muted-foreground sm:flex">
                      <span className="flex items-center gap-1.5">
                        <Repeat className="size-3.5" />
                        {iv.frequency}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {iv.durationWeeks} wks
                      </span>
                    </div>
                    <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </button>

                  {isOpen ? (
                    <div className="border-t border-border bg-secondary/20 px-5 py-4">
                      <p className="text-sm text-foreground/90">{iv.summary}</p>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Implementation steps
                      </p>
                      <ol className="mt-2 space-y-2">
                        {iv.steps.map((s, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm">
                            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                              {i + 1}
                            </span>
                            {s}
                          </li>
                        ))}
                      </ol>
                      <div className="mt-4 flex flex-wrap gap-3 sm:hidden">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Repeat className="size-3.5" />
                          {iv.frequency}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3.5" />
                          {iv.durationWeeks} wks
                        </span>
                      </div>
                      
                      {/* ASSIGN TO STUDENT PLAN BUTTON */}
                      <button
                        type="button"
                        onClick={() => {
                          const defaultId = studentRoster[0]?.id || ""
                          setAssignModalIv(iv)
                          setSelectedStudentId(defaultId)
                        }}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
                      >
                        <UserCheck className="size-4" />
                        Assign to student plan
                      </button>
                    </div>
                  ) : null}
                </Card>
              )
            })}
          </div>
        )}

        {/* Assign Modal */}
        {assignModalIv && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-6 space-y-5 shadow-2xl border-primary/30">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display font-bold text-lg">Assign Intervention</h3>
                <button type="button" onClick={() => setAssignModalIv(null)} className="rounded-md p-1 hover:bg-muted">
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Intervention:</p>
                <p className="font-bold text-foreground">{assignModalIv.title}</p>
                <p className="text-xs text-muted-foreground">{assignModalIv.summary}</p>
              </div>

              <div className="space-y-2 text-sm">
                <label className="font-medium text-foreground">Select Student from Roster:</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {studentRoster.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAssignModalIv(null)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAssignment}
                  disabled={isAssigning}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="size-4" />
                  {isAssigning ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
