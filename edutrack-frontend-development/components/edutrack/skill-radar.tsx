"use client"

import { useState } from "react"
import { DOMAINS, GAP_THRESHOLD, type DomainKey } from "@/lib/edutrack-data"

type Props = {
  scores: Record<DomainKey, number>
  compare?: Record<DomainKey, number>
  size?: number
}

export function SkillRadar({ scores, compare, size = 320 }: Props) {
  const [hoveredDomain, setHoveredDomain] = useState<{ label: string; score: number } | null>(null)

  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 46
  const axes = DOMAINS.length
  const rings = [0.25, 0.5, 0.75, 1]

  const pointFor = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / axes - Math.PI / 2
    const r = (value / 100) * radius
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const
  }

  const polygon = (data: Record<DomainKey, number>) =>
    DOMAINS.map((d, i) => pointFor(i, data[d.key]).join(",")).join(" ")

  const thresholdPoly = DOMAINS.map((_, i) => pointFor(i, GAP_THRESHOLD).join(",")).join(" ")

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full max-w-[340px] drop-shadow-md transition-all duration-500"
        role="img"
        aria-label="Skill domain radar chart"
      >
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity="0.15" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Concentric Grid Rings */}
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={DOMAINS.map((_, i) => pointFor(i, ring * 100).join(",")).join(" ")}
            fill="none"
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray={ring === 1 ? "none" : "2 2"}
            opacity={0.6}
          />
        ))}

        {/* Radar Radial Axes */}
        {DOMAINS.map((_, i) => {
          const [x, y] = pointFor(i, 100)
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth={1} opacity={0.6} />
        })}

        {/* Benchmark Threshold Poly */}
        <polygon
          points={thresholdPoly}
          fill="none"
          stroke="var(--warning)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.75}
        />

        {/* Comparison Polygon (if present) */}
        {compare ? (
          <polygon
            points={polygon(compare)}
            fill="var(--muted-foreground)"
            fillOpacity={0.12}
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            strokeDasharray="5 3"
          />
        ) : null}

        {/* Animated Main Polygon */}
        <polygon
          points={polygon(scores)}
          fill="url(#radarFill)"
          stroke="var(--primary)"
          strokeWidth={2.5}
          className="transition-all duration-700 ease-out"
          filter="url(#glow)"
        />

        {/* Animated Vertex Points & Interactive Targets */}
        {DOMAINS.map((d, i) => {
          const [x, y] = pointFor(i, scores[d.key])
          const isHovered = hoveredDomain?.label === d.label
          return (
            <g key={d.key} className="cursor-pointer" onMouseEnter={() => setHoveredDomain({ label: d.label, score: scores[d.key] })} onMouseLeave={() => setHoveredDomain(null)}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 7 : 4.5}
                fill="var(--primary)"
                stroke="var(--background)"
                strokeWidth={2}
                className="transition-all duration-300 ease-out animate-pulse"
              />
            </g>
          )
        })}

        {/* Domain Labels */}
        {DOMAINS.map((d, i) => {
          const [x, y] = pointFor(i, 118)
          const isHovered = hoveredDomain?.label === d.label
          return (
            <text
              key={d.key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-[10px] font-bold transition-colors duration-200 ${
                isHovered ? "fill-primary text-xs font-extrabold" : "fill-muted-foreground"
              }`}
            >
              {d.label.length > 12 ? d.label.split(" ")[0] : d.label}
            </text>
          )
        })}
      </svg>

      {/* Interactive Tooltip Badge */}
      <div className="h-6 mt-1 flex items-center justify-center">
        {hoveredDomain ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-0.5 text-xs font-bold text-primary animate-in fade-in duration-200">
            {hoveredDomain.label}: <strong className="text-foreground">{hoveredDomain.score}%</strong>
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground italic">Hover vertices to inspect score</span>
        )}
      </div>
    </div>
  )
}
