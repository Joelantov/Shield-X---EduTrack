import { DOMAINS, GAP_THRESHOLD, type DomainKey } from "@/lib/edutrack-data"

type Props = {
  scores: Record<DomainKey, number>
  compare?: Record<DomainKey, number>
  size?: number
}

export function SkillRadar({ scores, compare, size = 300 }: Props) {
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

  // threshold ring polygon
  const thresholdPoly = DOMAINS.map((_, i) => pointFor(i, GAP_THRESHOLD).join(",")).join(" ")

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-auto w-full max-w-[340px]"
      role="img"
      aria-label="Skill domain radar chart"
    >
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={DOMAINS.map((_, i) => pointFor(i, ring * 100).join(",")).join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}

      {DOMAINS.map((_, i) => {
        const [x, y] = pointFor(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth={1} />
      })}

      {/* benchmark threshold */}
      <polygon
        points={thresholdPoly}
        fill="none"
        stroke="var(--warning)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
        opacity={0.7}
      />

      {compare ? (
        <polygon points={polygon(compare)} fill="var(--muted-foreground)" fillOpacity={0.12} stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="5 3" />
      ) : null}

      <polygon
        points={polygon(scores)}
        fill="var(--chart-1)"
        fillOpacity={0.22}
        stroke="var(--chart-1)"
        strokeWidth={2}
      />

      {DOMAINS.map((d, i) => {
        const [x, y] = pointFor(i, scores[d.key])
        return <circle key={d.key} cx={x} cy={y} r={3.5} fill="var(--chart-1)" />
      })}

      {DOMAINS.map((d, i) => {
        const [x, y] = pointFor(i, 118)
        return (
          <text
            key={d.key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-[10px] font-medium"
          >
            {d.label.length > 12 ? d.label.split(" ")[0] : d.label}
          </text>
        )
      })}
    </svg>
  )
}
