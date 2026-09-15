// EduTrack mock data + simulated "AI" analysis.
// Frontend-only: no backend, no real ML. All analysis is derived
// deterministically from the mock signals below to feel realistic.

export type RiskLevel = "on-track" | "watch" | "at-risk"

export type DomainKey =
  | "phonics"
  | "fluency"
  | "comprehension"
  | "numberSense"
  | "arithmetic"
  | "problemSolving"

export const DOMAINS: { key: DomainKey; label: string; strand: "Literacy" | "Numeracy" }[] = [
  { key: "phonics", label: "Phonics", strand: "Literacy" },
  { key: "fluency", label: "Reading Fluency", strand: "Literacy" },
  { key: "comprehension", label: "Comprehension", strand: "Literacy" },
  { key: "numberSense", label: "Number Sense", strand: "Numeracy" },
  { key: "arithmetic", label: "Arithmetic", strand: "Numeracy" },
  { key: "problemSolving", label: "Problem Solving", strand: "Numeracy" },
]

export const DOMAIN_LABEL: Record<DomainKey, string> = Object.fromEntries(
  DOMAINS.map((d) => [d.key, d.label]),
) as Record<DomainKey, string>

export type ReasonCategory =
  | "foundational-gap"
  | "attendance"
  | "language"
  | "attention"
  | "practice"
  | "socio-emotional"
  | "enrichment"

export const REASON_META: Record<
  ReasonCategory,
  { label: string; description: string }
> = {
  "foundational-gap": {
    label: "Foundational skill gap",
    description: "Missing prerequisite skills from an earlier grade level.",
  },
  attendance: {
    label: "Attendance & missed instruction",
    description: "Frequent absences correlate with the observed gaps.",
  },
  language: {
    label: "Language barrier (ELL)",
    description: "Emerging English proficiency is slowing comprehension.",
  },
  attention: {
    label: "Attention & focus",
    description: "Short on-task duration is limiting practice retention.",
  },
  practice: {
    label: "Low independent practice",
    description: "Incomplete home practice reduces skill consolidation.",
  },
  "socio-emotional": {
    label: "Socio-emotional factors",
    description: "Low confidence or anxiety is affecting participation.",
  },
  enrichment: {
    label: "Needs enrichment",
    description: "Performing above level — at risk of disengagement.",
  },
}

export type InterventionTier = "Tier 1" | "Tier 2" | "Tier 3"

export type Intervention = {
  id: string
  title: string
  domain: DomainKey
  tier: InterventionTier
  durationWeeks: number
  frequency: string
  summary: string
  steps: string[]
}

export type Signals = {
  attendance: number // %
  engagement: number // % avg on-task
  homeworkCompletion: number // %
  isELL: boolean
  weeksTracked: number
}

export type Student = {
  id: string
  name: string
  gender: "female" | "male"
  avatarUrl: string
  avatarColor: string
  grade: string
  section?: string
  rollNo?: string
  age: number
  guardian: string
  scores: Record<DomainKey, number>
  previousScores: Record<DomainKey, number>
  signals: Signals
  note: string
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function studentInitials(student: Student) {
  return initials(student.name)
}

// ---- Mock roster -----------------------------------------------------------

export const STUDENTS: Student[] = [
  {
    id: "s00",
    name: "Ananya Sharma",
    gender: "female",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.65 0.22 27)",
    grade: "Grade 8",
    section: "Section A",
    rollNo: "#14",
    age: 13,
    guardian: "Priya Sharma",
    scores: { phonics: 75, fluency: 78, comprehension: 81, numberSense: 71, arithmetic: 68, problemSolving: 43 },
    previousScores: { phonics: 76, fluency: 78, comprehension: 80, numberSense: 75, arithmetic: 72, problemSolving: 57 },
    signals: { attendance: 88, engagement: 72, homeworkCompletion: 58, isELL: false, weeksTracked: 12 },
    note: "Demonstrates high skill in algebra/matrices, but currently experiencing a persistent struggle with Quadratic Equations (factorization).",
  },
  {
    id: "s01",
    name: "Aarav Sharma",
    gender: "male",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.62 0.19 25)",
    grade: "Grade 8",
    age: 13,
    guardian: "Meera Sharma",
    scores: { phonics: 42, fluency: 38, comprehension: 45, numberSense: 71, arithmetic: 68, problemSolving: 64 },
    previousScores: { phonics: 48, fluency: 46, comprehension: 52, numberSense: 70, arithmetic: 66, problemSolving: 63 },
    signals: { attendance: 74, engagement: 58, homeworkCompletion: 61, isELL: true, weeksTracked: 12 },
    note: "Recently moved from another district. Speaks Hindi at home.",
  },
  {
    id: "s02",
    name: "Sofia Alvarez",
    gender: "female",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.6 0.16 300)",
    grade: "Grade 8",
    age: 14,
    guardian: "Luis Alvarez",
    scores: { phonics: 88, fluency: 91, comprehension: 86, numberSense: 84, arithmetic: 82, problemSolving: 89 },
    previousScores: { phonics: 82, fluency: 85, comprehension: 80, numberSense: 79, arithmetic: 78, problemSolving: 83 },
    signals: { attendance: 97, engagement: 92, homeworkCompletion: 95, isELL: false, weeksTracked: 12 },
    note: "Consistently ahead of pace. Enjoys reading challenges.",
  },
  {
    id: "s03",
    name: "Liam O'Connor",
    gender: "male",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.58 0.14 240)",
    grade: "Grade 8",
    age: 13,
    guardian: "Erin O'Connor",
    scores: { phonics: 64, fluency: 61, comprehension: 58, numberSense: 41, arithmetic: 37, problemSolving: 44 },
    previousScores: { phonics: 60, fluency: 59, comprehension: 57, numberSense: 45, arithmetic: 43, problemSolving: 48 },
    signals: { attendance: 89, engagement: 67, homeworkCompletion: 55, isELL: false, weeksTracked: 12 },
    note: "Strong reader but freezes during timed math tasks.",
  },
  {
    id: "s04",
    name: "Chen Wei",
    gender: "male",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.6 0.15 160)",
    grade: "Grade 8",
    age: 14,
    guardian: "Hua Chen",
    scores: { phonics: 55, fluency: 49, comprehension: 43, numberSense: 88, arithmetic: 90, problemSolving: 79 },
    previousScores: { phonics: 52, fluency: 48, comprehension: 44, numberSense: 85, arithmetic: 86, problemSolving: 77 },
    signals: { attendance: 93, engagement: 74, homeworkCompletion: 80, isELL: true, weeksTracked: 12 },
    note: "Excellent numeracy; comprehension limited by vocabulary.",
  },
  {
    id: "s05",
    name: "Maya Johnson",
    gender: "female",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.64 0.16 60)",
    grade: "Grade 8",
    age: 13,
    guardian: "Denise Johnson",
    scores: { phonics: 72, fluency: 70, comprehension: 68, numberSense: 66, arithmetic: 63, problemSolving: 60 },
    previousScores: { phonics: 69, fluency: 66, comprehension: 64, numberSense: 62, arithmetic: 60, problemSolving: 58 },
    signals: { attendance: 91, engagement: 81, homeworkCompletion: 78, isELL: false, weeksTracked: 12 },
    note: "Steady, well-rounded progress across strands.",
  },
  {
    id: "s06",
    name: "Noah Williams",
    gender: "male",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.55 0.18 20)",
    grade: "Grade 8",
    age: 14,
    guardian: "Tanya Williams",
    scores: { phonics: 33, fluency: 29, comprehension: 31, numberSense: 39, arithmetic: 35, problemSolving: 30 },
    previousScores: { phonics: 40, fluency: 38, comprehension: 39, numberSense: 44, arithmetic: 42, problemSolving: 38 },
    signals: { attendance: 61, engagement: 44, homeworkCompletion: 33, isELL: false, weeksTracked: 12 },
    note: "Attendance dropped sharply this term. Needs a home check-in.",
  },
  {
    id: "s07",
    name: "Priya Patel",
    gender: "female",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.6 0.17 340)",
    grade: "Grade 8",
    age: 13,
    guardian: "Anil Patel",
    scores: { phonics: 79, fluency: 76, comprehension: 74, numberSense: 55, arithmetic: 51, problemSolving: 58 },
    previousScores: { phonics: 75, fluency: 72, comprehension: 71, numberSense: 57, arithmetic: 54, problemSolving: 60 },
    signals: { attendance: 94, engagement: 85, homeworkCompletion: 88, isELL: false, weeksTracked: 12 },
    note: "Literacy is a strength; arithmetic accuracy slipping.",
  },
  {
    id: "s08",
    name: "Diego Morales",
    gender: "male",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.58 0.15 130)",
    grade: "Grade 8",
    age: 14,
    guardian: "Carmen Morales",
    scores: { phonics: 47, fluency: 44, comprehension: 40, numberSense: 52, arithmetic: 49, problemSolving: 46 },
    previousScores: { phonics: 45, fluency: 43, comprehension: 41, numberSense: 50, arithmetic: 48, problemSolving: 45 },
    signals: { attendance: 84, engagement: 62, homeworkCompletion: 57, isELL: true, weeksTracked: 12 },
    note: "Bilingual learner; benefits from visual supports.",
  },
  {
    id: "s09",
    name: "Emma Schmidt",
    gender: "female",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.62 0.14 280)",
    grade: "Grade 8",
    age: 13,
    guardian: "Klaus Schmidt",
    scores: { phonics: 85, fluency: 88, comprehension: 90, numberSense: 77, arithmetic: 74, problemSolving: 80 },
    previousScores: { phonics: 80, fluency: 83, comprehension: 85, numberSense: 74, arithmetic: 72, problemSolving: 76 },
    signals: { attendance: 96, engagement: 90, homeworkCompletion: 92, isELL: false, weeksTracked: 12 },
    note: "High achiever. Ready for enrichment tasks.",
  },
  {
    id: "s10",
    name: "Kwame Mensah",
    gender: "male",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.58 0.16 45)",
    grade: "Grade 8",
    age: 14,
    guardian: "Ama Mensah",
    scores: { phonics: 51, fluency: 48, comprehension: 53, numberSense: 47, arithmetic: 43, problemSolving: 41 },
    previousScores: { phonics: 50, fluency: 49, comprehension: 52, numberSense: 49, arithmetic: 46, problemSolving: 44 },
    signals: { attendance: 88, engagement: 55, homeworkCompletion: 49, isELL: false, weeksTracked: 12 },
    note: "Loses focus in the afternoon block. Short attention span.",
  },
  {
    id: "s11",
    name: "Hana Suzuki",
    gender: "female",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.62 0.15 350)",
    grade: "Grade 8",
    age: 13,
    guardian: "Yuki Suzuki",
    scores: { phonics: 68, fluency: 65, comprehension: 62, numberSense: 72, arithmetic: 70, problemSolving: 67 },
    previousScores: { phonics: 66, fluency: 64, comprehension: 61, numberSense: 69, arithmetic: 67, problemSolving: 65 },
    signals: { attendance: 92, engagement: 79, homeworkCompletion: 82, isELL: true, weeksTracked: 12 },
    note: "Quiet in class; comprehension improving steadily.",
  },
  {
    id: "s12",
    name: "Oliver Brown",
    gender: "male",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80",
    avatarColor: "oklch(0.55 0.13 220)",
    grade: "Grade 8",
    age: 14,
    guardian: "Sarah Brown",
    scores: { phonics: 44, fluency: 40, comprehension: 38, numberSense: 43, arithmetic: 39, problemSolving: 36 },
    previousScores: { phonics: 43, fluency: 41, comprehension: 40, numberSense: 42, arithmetic: 40, problemSolving: 38 },
    signals: { attendance: 79, engagement: 51, homeworkCompletion: 44, isELL: false, weeksTracked: 12 },
    note: "Low confidence; reluctant to attempt new tasks.",
  },
]

// ---- Scoring + risk --------------------------------------------------------

export const GAP_THRESHOLD = 55
export const STRONG_THRESHOLD = 80

export function overallScore(student: Student): number {
  const vals = DOMAINS.map((d) => student.scores[d.key])
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export function previousOverall(student: Student): number {
  const vals = DOMAINS.map((d) => student.previousScores[d.key])
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export function trendDelta(student: Student): number {
  return overallScore(student) - previousOverall(student)
}

export function riskLevel(student: Student): RiskLevel {
  const overall = overallScore(student)
  const lowDomains = DOMAINS.filter((d) => student.scores[d.key] < GAP_THRESHOLD).length
  if (overall < 50 || lowDomains >= 3 || student.signals.attendance < 65) return "at-risk"
  if (overall < 68 || lowDomains >= 1 || student.signals.attendance < 82) return "watch"
  return "on-track"
}

export const RISK_META: Record<
  RiskLevel,
  { label: string; tw: string; dot: string; ring: string }
> = {
  "at-risk": {
    label: "At Risk",
    tw: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
    ring: "text-destructive",
  },
  watch: {
    label: "Watch",
    tw: "bg-warning/15 text-warning-foreground border-warning/30",
    dot: "bg-warning",
    ring: "text-warning",
  },
  "on-track": {
    label: "On Track",
    tw: "bg-success/10 text-success border-success/20",
    dot: "bg-success",
    ring: "text-success",
  },
}

// ---- Simulated AI analysis -------------------------------------------------

export type DetectedGap = {
  domain: DomainKey
  score: number
  delta: number
  severity: "moderate" | "significant" | "critical"
}

export type ProbableReason = {
  category: ReasonCategory
  confidence: number // 0-100
  evidence: string
}

export type AiAnalysis = {
  summary: string
  gaps: DetectedGap[]
  strengths: DomainKey[]
  reasons: ProbableReason[]
  recommendedInterventionIds: string[]
  confidence: number
}

function severityFor(score: number): DetectedGap["severity"] {
  if (score < 38) return "critical"
  if (score < 48) return "significant"
  return "moderate"
}

export function analyzeStudent(student: Student): AiAnalysis {
  const gaps: DetectedGap[] = DOMAINS.filter((d) => student.scores[d.key] < GAP_THRESHOLD)
    .map((d) => ({
      domain: d.key,
      score: student.scores[d.key],
      delta: student.scores[d.key] - student.previousScores[d.key],
      severity: severityFor(student.scores[d.key]),
    }))
    .sort((a, b) => a.score - b.score)

  const strengths = DOMAINS.filter((d) => student.scores[d.key] >= STRONG_THRESHOLD).map((d) => d.key)

  const reasons: ProbableReason[] = []
  const { signals } = student

  if (signals.attendance < 80) {
    reasons.push({
      category: "attendance",
      confidence: Math.min(95, Math.round((80 - signals.attendance) * 3 + 45)),
      evidence: `Attendance at ${signals.attendance}% — below the 80% instructional threshold.`,
    })
  }
  if (signals.isELL && (student.scores.comprehension < 60 || student.scores.fluency < 60)) {
    reasons.push({
      category: "language",
      confidence: 78,
      evidence: "Literacy scores trail numeracy for an emerging English learner.",
    })
  }
  if (signals.engagement < 65) {
    reasons.push({
      category: "attention",
      confidence: Math.round(60 + (65 - signals.engagement)),
      evidence: `Average on-task engagement of ${signals.engagement}% limits practice retention.`,
    })
  }
  if (signals.homeworkCompletion < 60) {
    reasons.push({
      category: "practice",
      confidence: Math.round(55 + (60 - signals.homeworkCompletion)),
      evidence: `Home practice completion at ${signals.homeworkCompletion}% slows consolidation.`,
    })
  }
  if (gaps.length >= 2 && trendDelta(student) <= 0) {
    reasons.push({
      category: "foundational-gap",
      confidence: 72,
      evidence: `${gaps.length} domains below benchmark with a flat or declining trend.`,
    })
  }
  if (trendDelta(student) < -2 && signals.engagement < 70) {
    reasons.push({
      category: "socio-emotional",
      confidence: 58,
      evidence: "Declining scores paired with lower participation may signal low confidence.",
    })
  }
  if (gaps.length === 0 && overallScore(student) >= STRONG_THRESHOLD) {
    reasons.push({
      category: "enrichment",
      confidence: 84,
      evidence: "Consistently above benchmark — ready for extension work.",
    })
  }

  reasons.sort((a, b) => b.confidence - a.confidence)

  const recommendedInterventionIds = pickInterventions(gaps, reasons, student)

  const confidence = Math.round(
    Math.min(96, 62 + gaps.length * 5 + Math.min(reasons.length, 3) * 4 + (signals.weeksTracked >= 10 ? 6 : 0)),
  )

  const summary = buildSummary(student, gaps, strengths, reasons)

  return { summary, gaps, strengths, reasons, recommendedInterventionIds, confidence }
}

function buildSummary(
  student: Student,
  gaps: DetectedGap[],
  strengths: DomainKey[],
  reasons: ProbableReason[],
): string {
  const first = student.name.split(" ")[0]
  if (gaps.length === 0) {
    return `${first} is performing at or above benchmark across all six domains. The model recommends enrichment to sustain engagement rather than remediation.`
  }
  const gapLabels = gaps.slice(0, 2).map((g) => DOMAIN_LABEL[g.domain].toLowerCase())
  const reasonLabel = reasons[0] ? REASON_META[reasons[0].category].label.toLowerCase() : "foundational gaps"
  const strengthText =
    strengths.length > 0 ? ` Strengths in ${DOMAIN_LABEL[strengths[0]].toLowerCase()} can be leveraged as a bridge.` : ""
  return `${first} shows a widening gap in ${gapLabels.join(" and ")}. The most likely driver is ${reasonLabel}.${strengthText} A targeted, short-cycle intervention is recommended.`
}

function pickInterventions(gaps: DetectedGap[], reasons: ProbableReason[], student: Student): string[] {
  const ids = new Set<string>()
  for (const gap of gaps.slice(0, 3)) {
    const tier: InterventionTier =
      gap.severity === "critical" ? "Tier 3" : gap.severity === "significant" ? "Tier 2" : "Tier 1"
    const match = INTERVENTIONS.find((i) => i.domain === gap.domain && i.tier === tier)
    const fallback = INTERVENTIONS.find((i) => i.domain === gap.domain)
    if (match) ids.add(match.id)
    else if (fallback) ids.add(fallback.id)
  }
  if (reasons.some((r) => r.category === "enrichment")) ids.add("iv-enrich")
  if (reasons.some((r) => r.category === "attendance")) ids.add("iv-attendance")
  return [...ids]
}

// ---- Intervention library --------------------------------------------------

export const INTERVENTIONS: Intervention[] = [
  {
    id: "iv-phon-1",
    title: "Daily Sound-Blending Warm-up",
    domain: "phonics",
    tier: "Tier 1",
    durationWeeks: 4,
    frequency: "10 min daily",
    summary: "Whole-class phoneme blending routine to reinforce letter-sound mapping.",
    steps: [
      "Open each lesson with 5 CVC blending cards.",
      "Use choral response, then partner practice.",
      "Track accuracy weekly with a quick 10-word check.",
    ],
  },
  {
    id: "iv-phon-2",
    title: "Small-Group Phonics Reteach",
    domain: "phonics",
    tier: "Tier 2",
    durationWeeks: 6,
    frequency: "20 min · 3x/week",
    summary: "Pull-out group targeting specific grapheme-phoneme gaps.",
    steps: [
      "Diagnose the 3 weakest sound patterns.",
      "Use multisensory (say-tap-write) drills.",
      "Re-assess every two weeks and regroup.",
    ],
  },
  {
    id: "iv-flu-1",
    title: "Paired Repeated Reading",
    domain: "fluency",
    tier: "Tier 1",
    durationWeeks: 4,
    frequency: "15 min · 4x/week",
    summary: "Partner re-reading of leveled passages to build automaticity.",
    steps: [
      "Match students to a passage at 95% accuracy.",
      "Read 3 times with a timed words-per-minute log.",
      "Celebrate WPM growth on a personal chart.",
    ],
  },
  {
    id: "iv-flu-2",
    title: "Fluency Intervention Block",
    domain: "fluency",
    tier: "Tier 2",
    durationWeeks: 6,
    frequency: "20 min · 3x/week",
    summary: "Structured small-group fluency practice with modeling.",
    steps: [
      "Teacher models expressive reading.",
      "Echo and choral reading of the passage.",
      "Independent timed read with feedback.",
    ],
  },
  {
    id: "iv-comp-1",
    title: "Vocabulary Preview Routine",
    domain: "comprehension",
    tier: "Tier 1",
    durationWeeks: 4,
    frequency: "10 min daily",
    summary: "Front-load key vocabulary with visuals before each text.",
    steps: [
      "Pre-teach 3-5 words with images.",
      "Use sentence frames for oral practice.",
      "Revisit words in an exit ticket.",
    ],
  },
  {
    id: "iv-comp-2",
    title: "Guided Comprehension Group (ELL-friendly)",
    domain: "comprehension",
    tier: "Tier 2",
    durationWeeks: 6,
    frequency: "25 min · 3x/week",
    summary: "Scaffolded questioning with visual supports and think-alouds.",
    steps: [
      "Preview with picture walk and prediction.",
      "Model retell using a story map.",
      "Practice question stems with sentence frames.",
    ],
  },
  {
    id: "iv-num-1",
    title: "Number Talks",
    domain: "numberSense",
    tier: "Tier 1",
    durationWeeks: 4,
    frequency: "10 min daily",
    summary: "Short mental-math discussions to build flexible number sense.",
    steps: [
      "Pose one dot/ten-frame image daily.",
      "Students share strategies aloud.",
      "Record strategies on an anchor chart.",
    ],
  },
  {
    id: "iv-num-2",
    title: "Concrete-Pictorial-Abstract Group",
    domain: "numberSense",
    tier: "Tier 2",
    durationWeeks: 6,
    frequency: "20 min · 3x/week",
    summary: "Manipulative-based rebuild of place value and quantity.",
    steps: [
      "Start with base-ten blocks (concrete).",
      "Bridge to drawings (pictorial).",
      "Move to numerals once secure (abstract).",
    ],
  },
  {
    id: "iv-arith-2",
    title: "Fact Fluency Intervention",
    domain: "arithmetic",
    tier: "Tier 2",
    durationWeeks: 6,
    frequency: "15 min · 4x/week",
    summary: "Systematic practice of addition/subtraction facts within 20.",
    steps: [
      "Assess known vs. unknown facts.",
      "Practice a small set with strategy cues.",
      "Use low-stakes daily fluency games.",
    ],
  },
  {
    id: "iv-arith-3",
    title: "Intensive 1:1 Math Support",
    domain: "arithmetic",
    tier: "Tier 3",
    durationWeeks: 8,
    frequency: "20 min · daily",
    summary: "One-to-one, high-frequency rebuild of core arithmetic.",
    steps: [
      "Diagnose exact breakdown point.",
      "Rebuild with manipulatives and think-alouds.",
      "Progress-monitor daily with 2-minute probes.",
    ],
  },
  {
    id: "iv-ps-2",
    title: "Problem-Solving Strategy Group",
    domain: "problemSolving",
    tier: "Tier 2",
    durationWeeks: 6,
    frequency: "25 min · 2x/week",
    summary: "Explicit teaching of a read-plan-solve-check routine.",
    steps: [
      "Model the 4-step routine with a think-aloud.",
      "Use word-problem sorts by structure.",
      "Fade support toward independent work.",
    ],
  },
  {
    id: "iv-attendance",
    title: "Attendance & Family Check-in",
    domain: "comprehension",
    tier: "Tier 2",
    durationWeeks: 8,
    frequency: "Weekly",
    summary: "Wrap-around plan to reduce absences and recover missed instruction.",
    steps: [
      "Schedule a supportive family conference.",
      "Set a simple attendance goal and reward.",
      "Provide catch-up packets for missed days.",
    ],
  },
  {
    id: "iv-enrich",
    title: "Enrichment & Extension Pathway",
    domain: "comprehension",
    tier: "Tier 1",
    durationWeeks: 6,
    frequency: "Flexible",
    summary: "Challenge tasks and choice projects to sustain high achievers.",
    steps: [
      "Offer above-level reading and open tasks.",
      "Introduce a passion-based mini research project.",
      "Pair as a peer mentor for review activities.",
    ],
  },
]

export const INTERVENTION_BY_ID: Record<string, Intervention> = Object.fromEntries(
  INTERVENTIONS.map((i) => [i.id, i]),
)

// ---- Class-level aggregates ------------------------------------------------

export function classStats() {
  const total = STUDENTS.length
  const byRisk = { "on-track": 0, watch: 0, "at-risk": 0 } as Record<RiskLevel, number>
  for (const s of STUDENTS) byRisk[riskLevel(s)]++
  const avgOverall = Math.round(STUDENTS.reduce((a, s) => a + overallScore(s), 0) / total)
  const avgAttendance = Math.round(STUDENTS.reduce((a, s) => a + s.signals.attendance, 0) / total)
  const improving = STUDENTS.filter((s) => trendDelta(s) > 1).length
  return { total, byRisk, avgOverall, avgAttendance, improving }
}

export function domainAverages(): { key: DomainKey; label: string; avg: number }[] {
  return DOMAINS.map((d) => ({
    key: d.key,
    label: d.label,
    avg: Math.round(STUDENTS.reduce((a, s) => a + s.scores[d.key], 0) / STUDENTS.length),
  }))
}

export function getStudent(id: string): Student | undefined {
  return STUDENTS.find((s) => s.id === id)
}

export function addStudentToStore(newStudentData: Partial<Student>): Student {
  const id = newStudentData.id || `s${String(STUDENTS.length + 1).padStart(2, "0")}_${Date.now().toString().slice(-4)}`
  const name = newStudentData.name || "New Student"
  const femaleNames = ["ananya", "sofia", "maya", "priya", "emma", "diya", "ria", "sarah", "tanya", "aanya", "aisha", "neha", "chloe", "olivia", "isabella", "mia"]
  const firstNameLower = name.split(" ")[0].toLowerCase()
  const gender: "female" | "male" = newStudentData.gender || (femaleNames.some(fn => firstNameLower.includes(fn)) || name.endsWith("a") || name.endsWith("i") ? "female" : "male")

  const femaleAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=250&auto=format&fit=crop&q=80"
  ]

  const maleAvatars = [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=250&auto=format&fit=crop&q=80"
  ]

  const avatarPool = gender === "female" ? femaleAvatars : maleAvatars
  const avatarUrl = newStudentData.avatarUrl || avatarPool[STUDENTS.length % avatarPool.length]

  const scores = newStudentData.scores || {
    phonics: 70,
    fluency: 70,
    comprehension: 70,
    numberSense: 70,
    arithmetic: 70,
    problemSolving: 70,
  }
  const previousScores = newStudentData.previousScores || {
    phonics: Math.max(30, scores.phonics - 4),
    fluency: Math.max(30, scores.fluency - 3),
    comprehension: Math.max(30, scores.comprehension - 5),
    numberSense: Math.max(30, scores.numberSense - 2),
    arithmetic: Math.max(30, scores.arithmetic - 4),
    problemSolving: Math.max(30, scores.problemSolving - 6),
  }

  const colors = [
    "oklch(0.65 0.22 27)",
    "oklch(0.6 0.16 300)",
    "oklch(0.58 0.14 240)",
    "oklch(0.62 0.18 160)",
    "oklch(0.64 0.2 60)",
  ]

  const newStudent: Student = {
    id,
    name,
    gender,
    avatarUrl,
    avatarColor: colors[STUDENTS.length % colors.length],
    grade: newStudentData.grade || "Grade 8",
    section: newStudentData.section || "Section A",
    rollNo: newStudentData.rollNo || `#${String(STUDENTS.length + 1).padStart(2, "0")}`,
    age: newStudentData.age || 13,
    guardian: newStudentData.guardian || "Parent / Guardian",
    scores,
    previousScores,
    signals: newStudentData.signals
      ? { ...newStudentData.signals }
      : {
          attendance: 90,
          engagement: 75,
          homeworkCompletion: 80,
          isELL: false,
          weeksTracked: 1,
        },
    note: newStudentData.note || "Newly enrolled student. Baseline assessment complete.",
  }

  const idx = STUDENTS.findIndex((s) => s.id === id || s.name.toLowerCase() === newStudent.name.toLowerCase())
  if (idx >= 0) {
    STUDENTS[idx] = newStudent
  } else {
    STUDENTS.push(newStudent)
  }

  return newStudent
}

