"use client"

import { useMemo } from "react"
import { GitFork, Grid, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { DOMAINS, getStudent, domainAverages, GAP_THRESHOLD, DOMAIN_LABEL } from "@/lib/edutrack-data"
import { Card, ScoreBar } from "@/components/edutrack/primitives"
import { SkillRadar } from "@/components/edutrack/skill-radar"

export default function StudentKnowledgeGraphPage() {
  const { session } = useAuth()
  const student = session?.studentId ? getStudent(session.studentId) : undefined

  if (!student) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-muted-foreground">Please sign in to view your Knowledge Graph.</p>
      </div>
    )
  }

  const classAvgs = domainAverages()
  const classAvgMap = Object.fromEntries(classAvgs.map((d) => [d.key, d.avg]))

  // Strand nodes
  const literacyNodes = DOMAINS.filter((d) => d.strand === "Literacy")
  const numeracyNodes = DOMAINS.filter((d) => d.strand === "Numeracy")

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6 sm:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Skill Dependency Map</span>
          <h1 className="font-display text-2xl font-bold text-foreground">Knowledge Graph & Class Map</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>{student.name}</span>
          <span>•</span>
          <span className="text-foreground">{student.grade} ({student.section || "Sec A"})</span>
          <span>•</span>
          <span className="text-primary font-bold">Roll No: {student.rollNo || "#14"}</span>
        </div>
      </div>

      {/* 1. KNOWLEDGE GRAPH NODE NETWORK */}
      <Card className="p-6 space-y-6 border-primary/20">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <GitFork className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Student Knowledge Graph</h2>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Connected Skill Prerequisites
          </span>
        </div>

        {/* LITERACY STRAND NETWORK */}
        <div className="space-y-4">
          <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wide">
            Literacy Strand Network
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {literacyNodes.map((node, idx) => {
              const score = student.scores[node.key]
              const isGap = score < GAP_THRESHOLD
              return (
                <div key={node.key} className="relative group">
                  <Card className={`p-4 space-y-3 transition-all ${isGap ? "border-destructive/40 bg-destructive/5" : "border-border hover:border-primary/40"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Step {idx + 1}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isGap ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                        {score}% Mastery
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-foreground text-sm">{node.label}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {idx === 0 ? "Foundational sound recognition" : idx === 1 ? "Automatic reading pace" : "Deep text understanding"}
                      </p>
                    </div>

                    <ScoreBar score={score} />

                    {idx < literacyNodes.length - 1 && (
                      <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-6 items-center justify-center rounded-full bg-card border border-border text-primary shadow-xs">
                        <ArrowRight className="size-3" />
                      </div>
                    )}
                  </Card>
                </div>
              )
            })}
          </div>
        </div>

        {/* NUMERACY STRAND NETWORK */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wide">
            Numeracy Strand Network
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {numeracyNodes.map((node, idx) => {
              const score = student.scores[node.key]
              const isGap = score < GAP_THRESHOLD
              return (
                <div key={node.key} className="relative group">
                  <Card className={`p-4 space-y-3 transition-all ${isGap ? "border-destructive/40 bg-destructive/5" : "border-border hover:border-primary/40"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Step {idx + 1}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isGap ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                        {score}% Mastery
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-foreground text-sm">{node.label}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {idx === 0 ? "Place value & quantitative structure" : idx === 1 ? "Operational fluency & arithmetic" : "Multi-step word problem application"}
                      </p>
                    </div>

                    <ScoreBar score={score} />

                    {idx < numeracyNodes.length - 1 && (
                      <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-6 items-center justify-center rounded-full bg-card border border-border text-primary shadow-xs">
                        <ArrowRight className="size-3" />
                      </div>
                    )}
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* 2. CLASS KNOWLEDGE MAP BENCHMARK COMPARISON */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Grid className="size-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Class Knowledge Map Comparison</h3>
            </div>
            <span className="text-xs text-muted-foreground">Your Score vs Class Average</span>
          </div>

          <div className="space-y-4 pt-2">
            {DOMAINS.map((d) => {
              const myScore = student.scores[d.key]
              const classAvg = classAvgMap[d.key] || 60
              const diff = myScore - classAvg

              return (
                <div key={d.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-foreground font-semibold">{d.label}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-muted-foreground">Class Avg: {classAvg}%</span>
                      <strong className="text-foreground font-bold">You: {myScore}%</strong>
                      <span className={diff >= 0 ? "text-success font-bold" : "text-destructive font-bold"}>
                        ({diff >= 0 ? `+${diff}%` : `${diff}%`})
                      </span>
                    </span>
                  </div>
                  <div className="relative">
                    <ScoreBar score={myScore} />
                    {/* Class avg indicator pin */}
                    <span
                      className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 bg-foreground/80 z-10"
                      style={{ left: `${classAvg}%` }}
                      title={`Class Average: ${classAvg}%`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Skill Radar Chart Module */}
        <Card className="p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-display font-bold text-foreground text-sm border-b border-border pb-2">
              Skill Balance Radar
            </h3>
            <div className="mt-4 flex justify-center">
              <SkillRadar scores={student.scores} />
            </div>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground leading-relaxed">
            <strong>Insight:</strong> Balanced profile across literacy strands with a targeted opportunity to build strength in numeracy problem solving.
          </div>
        </Card>
      </div>
    </div>
  )
}
