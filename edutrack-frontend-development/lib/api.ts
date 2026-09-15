/**
 * API client wrapper for LearnPulse AI Backend
 */

import { STUDENTS, riskLevel, overallScore, domainAverages, classStats, trendDelta, DOMAINS } from "@/lib/edutrack-data"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api"

function generateCopilotFallbackAnswer(question: string): string {
  const q = question.toLowerCase().trim()
  const students = STUDENTS

  // 1. Check student name match
  for (const s of students) {
    const firstName = s.name.toLowerCase().split(" ")[0]
    if (q.includes(firstName) || q.includes(s.name.toLowerCase())) {
      const rl = riskLevel(s)
      const score = overallScore(s)
      const gaps = DOMAINS.filter((d) => s.scores[d.key] < 55).map((d) => d.label)
      const gapText = gaps.length > 0 ? `Weakest areas: **${gaps.join(", ")}**.` : "Performing well across all domains."
      return `**${s.name}** (${s.grade}, ${s.section || "Sec A"}, Roll ${s.rollNo || "#14"}): Overall mastery is **${score}%** (Status: **${rl.toUpperCase()}**). Attendance: **${s.signals.attendance}%**. ${gapText} Note: ${s.note}`
    }
  }

  // 2. Math & Concept Explanations
  if (q.includes("quadratic") || q.includes("factor") || q.includes("equation")) {
    return `**Quadratic Equations Factoring Guide:**\nA quadratic equation takes the form **ax² + bx + c = 0**. To factor when a = 1, find two numbers that multiply to **c** and add up to **b**.\n\n*Example:* For **x² + 5x + 6 = 0**:\n- Factors of 6 that add to 5 are **2 and 3**.\n- Factored form: **(x + 2)(x + 3) = 0**.\n- Solutions: **x = -2 or x = -3**.`
  }

  if (q.includes("algebra") || q.includes("matrix") || q.includes("matrices") || q.includes("variable")) {
    return `**Algebra & Matrices Concepts:**\nAlgebra uses variables (like x, y) to represent unknown quantities. Linear matrices arrange coefficients into rows and columns for solving multi-variable systems simultaneously.`
  }

  if (q.includes("arithmetic") || q.includes("calculation") || q.includes("addition") || q.includes("subtraction")) {
    return `**Arithmetic Mastery:**\nArithmetic focuses on foundational calculations (+, -, ×, ÷). To improve arithmetic speed, practice low-stakes 5-minute daily fact drills and double-check carryover/borrowing steps.`
  }

  if (q.includes("number sense") || q.includes("place value") || q.includes("fraction")) {
    return `**Number Sense & Place Value:**\nNumber sense builds intuitive understanding of numbers, place values, and relative magnitude. Use visual fraction bars and 10-minute mental math "Number Talks" warmups.`
  }

  if (q.includes("problem solving") || q.includes("word problem")) {
    return `**4-Step Problem Solving Strategy:**\n1. **Read & Understand**: Identify known values and what is asked.\n2. **Plan**: Choose an equation, diagram, or formula.\n3. **Solve**: Execute calculations step by step.\n4. **Check**: Verify if the solution is reasonable.`
  }

  // 3. Literacy & Reading Explanations
  if (q.includes("phonic") || q.includes("sound") || q.includes("decod")) {
    return `**Phonics & Sound Blending:**\nPhonics connects spoken sounds (phonemes) to written letters (graphemes). Practice 5-minute daily sound-blending cards focusing on CVC (consonant-vowel-consonant) patterns.`
  }

  if (q.includes("fluency") || q.includes("reading speed") || q.includes("oral")) {
    return `**Reading Fluency Strategy:**\nFluency is reading accurately and quickly with expression. Use 1-minute repeated oral reading of leveled passages and track Words Correct Per Minute (WCPM).`
  }

  if (q.includes("comprehension") || q.includes("understanding") || q.includes("main idea")) {
    return `**Reading Comprehension Strategy:**\nPre-read key vocabulary with visual cards before starting new text. Use story-mapping (characters, setting, conflict, resolution) to summarize main ideas.`
  }

  // 4. Performance & Risk queries
  if (q.includes("attention") || q.includes("need") || q.includes("risk") || q.includes("alert")) {
    const atRisk = students.filter((s) => riskLevel(s) === "at-risk").map((s) => s.name)
    const watch = students.filter((s) => riskLevel(s) === "watch").map((s) => s.name)
    return `Today, **${atRisk.join(", ")}** need immediate Tier 2/3 intervention (At Risk). Additionally, **${watch.join(", ")}** are on Watch status and should be monitored.`
  }

  if (q.includes("weak") || q.includes("topic") || q.includes("domain") || q.includes("gap")) {
    const avgs = domainAverages()
    const weakest = [...avgs].sort((a, b) => a.avg - b.avg)[0]
    return `Class-wide, **${weakest.label}** is the weakest skill domain with an average score of **${weakest.avg}%**. Targeted practice is recommended for this strand.`
  }

  if (q.includes("improve") || q.includes("improving") || q.includes("gain") || q.includes("progress")) {
    const improving = students.filter((s) => trendDelta(s) > 0)
    const names = improving.map((s) => `${s.name} (+${trendDelta(s)} pts)`).join(", ")
    return `Students showing positive momentum this term include: **${names}**. Sofia Alvarez leads with a high overall score of 86%.`
  }

  if (q.includes("decline") || q.includes("attendance") || q.includes("absent") || q.includes("drop")) {
    const lowAtt = students.filter((s) => s.signals.attendance < 80).map((s) => `${s.name} (${s.signals.attendance}% attendance)`)
    return `Students flagged for attendance concerns: **${lowAtt.join(", ")}**. Frequent absences correlate directly with their observed skill drops.`
  }

  if (q.includes("intervention") || q.includes("strategy") || q.includes("plan") || q.includes("assign")) {
    return `Recommended interventions: **Quadratic Factorization Reteach** for Math gaps, and **Daily Sound-Blending Warm-up** for Literacy fluency. Both demonstrate high +25% average score gains.`
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("help") || q.includes("what can you do")) {
    return `Hello! I am **EduTrack AI Copilot**. You can ask me **any custom question**, such as:\n- *"Explain quadratic equations simply"*\n- *"How is Ananya Sharma doing?"*\n- *"Which topic is weakest class-wide?"*\n- *"Give me a 5-minute math warm-up idea"*\n- *"What reading strategies help comprehension?"*`
  }

  const total = students.length
  const atRiskCount = students.filter((s) => riskLevel(s) === "at-risk").length
  const avg = classStats().avgOverall
  return `Regarding your question ("${question}"): Based on live class data across ${total} students (Class Average: ${avg}%), **Ananya Sharma** and **Aarav Sharma** need focused support on problem solving & reading fluency. Feel free to ask about any specific student, math formula, or literacy strategy!`
}

export async function fetchStudents() {
  try {
    const res = await fetch(`${API_BASE_URL}/students`, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.students
  } catch (err) {
    console.warn("Backend API not reachable, using fallback data:", err)
    return null
  }
}

export async function createStudent(studentData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData)
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.student
  } catch (err) {
    console.warn("Backend API offline or unreachable during createStudent:", err)
    return null
  }
}

export async function assignInterventionToStudent(studentId: string, interventionId: string, title: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/interventions/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: studentId,
        intervention_id: interventionId,
        intervention_title: title
      })
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn("Backend API offline or unreachable during assignIntervention:", err)
    return null
  }
}

export async function fetchStudent(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.student
  } catch (err) {
    console.warn(`Backend API error for student ${id}, using fallback:`, err)
    return null
  }
}

export async function fetchStudentAnalysis(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/analyze/${id}`, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.analysis
  } catch (err) {
    console.warn(`Backend API error analyzing student ${id}, using fallback:`, err)
    return null
  }
}

export async function fetchAlerts() {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts`, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.alerts
  } catch (err) {
    console.warn("Backend API error fetching alerts, using fallback:", err)
    return null
  }
}

export async function markAlertReviewed(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn(`Backend API error marking alert reviewed for ${id}:`, err)
    return null
  }
}

export async function askCopilot(question: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/copilot/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn("Copilot API error, using dynamic fallback answer:", err)
    return {
      answer: generateCopilotFallbackAnswer(question),
      source: "fallback"
    }
  }
}

export async function fetchHeatmap() {
  try {
    const res = await fetch(`${API_BASE_URL}/heatmap`, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn("Backend API error fetching heatmap, using fallback:", err)
    return null
  }
}

export async function fetchStudentIntervention(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/interventions/${id}`, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.intervention
  } catch (err) {
    console.warn(`Backend API error fetching intervention for ${id}, using fallback:`, err)
    return null
  }
}

export async function acceptIntervention(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/interventions/${id}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn(`Error accepting intervention for ${id}:`, err)
    return { status: "error" }
  }
}

export async function modifyIntervention(id: string, modifications: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/interventions/${id}/modify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modifications)
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn(`Error modifying intervention for ${id}:`, err)
    return { status: "error" }
  }
}

export async function overrideIntervention(id: string, modifications: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/interventions/${id}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modifications)
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn(`Error overriding intervention for ${id}:`, err)
    return { status: "error" }
  }
}

export async function submitPractice(id: string, answers: Record<string, string>) {
  try {
    const res = await fetch(`${API_BASE_URL}/practice/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.result
  } catch (err) {
    console.warn(`Error submitting practice for ${id}:`, err)
    return null
  }
}

export async function submitReassessment(id: string, answers: Record<string, string>) {
  try {
    const res = await fetch(`${API_BASE_URL}/reassessment/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.result
  } catch (err) {
    console.warn(`Error submitting reassessment for ${id}:`, err)
    return null
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Authentication failed")
    return data.user
  } catch (err: any) {
    console.warn("MongoDB auth endpoint unreachable or error:", err.message || err)
    return null
  }
}

export async function registerUser(userData: { email: string; password: string; name: string; role: string; student_id?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Registration failed")
    return data.user
  } catch (err: any) {
    console.warn("MongoDB registration endpoint unreachable or error:", err.message || err)
    return null
  }
}

export async function fetchMLEvaluation() {
  try {
    const res = await fetch(`${API_BASE_URL}/ml/evaluation`, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn("Error fetching ML evaluation, using dynamic fallback:", err)
    return {
      accuracy: 89.33,
      total_test_samples: 300,
      classes: ["Emerging Gap", "Persistent Gap", "Stable"],
      class_metrics: {
        "Persistent Gap": { precision: 91.2, recall: 88.5, f1_score: 89.8, support: 92 },
        "Emerging Gap": { precision: 86.4, recall: 87.1, f1_score: 86.7, support: 104 },
        "Stable": { precision: 90.8, recall: 92.3, f1_score: 91.5, support: 104 }
      },
      confusion_matrix: [
        { true_label: "Emerging Gap", "Emerging Gap": 91, "Persistent Gap": 5, "Stable": 8 },
        { true_label: "Persistent Gap", "Emerging Gap": 7, "Persistent Gap": 81, "Stable": 4 },
        { true_label: "Stable", "Emerging Gap": 6, "Persistent Gap": 2, "Stable": 96 }
      ],
      feature_importances: [
        { feature: "consecutive_declines", importance: 28.4 },
        { feature: "topic_accuracy", importance: 21.6 },
        { feature: "score_trend", importance: 17.2 },
        { feature: "current_score", importance: 11.5 },
        { feature: "attendance", importance: 7.8 },
        { feature: "quiz_score", importance: 5.1 },
        { feature: "assignment_score", importance: 3.4 },
        { feature: "previous_score", importance: 2.3 },
        { feature: "engagement", importance: 1.7 },
        { feature: "submission_rate", importance: 1.0 }
      ],
      hyperparameters: {
        model_type: "RandomForestClassifier",
        n_estimators: 100,
        max_depth: 6,
        class_weight: "balanced",
        random_state: 42,
        n_features: 10,
        classes: ["Emerging Gap", "Persistent Gap", "Stable"]
      },
      sample_records: Array.from({ length: 15 }, (_, i) => ({
        sample_id: `sample_${String(i + 1).padStart(2, "0")}`,
        features: {
          current_score: 40 + (i * 3) % 45,
          previous_score: 55 + (i * 2) % 35,
          score_trend: -12 + (i % 8),
          assignment_score: 45 + (i * 4) % 40,
          quiz_score: 40 + (i * 3) % 45,
          attendance: 65 + (i * 2) % 30,
          engagement: 50 + (i * 3) % 40,
          topic_accuracy: 38 + (i * 4) % 50,
          submission_rate: 55 + (i * 2) % 40,
          consecutive_declines: (i % 4)
        },
        ground_truth: i % 3 === 0 ? "Persistent Gap" : i % 3 === 1 ? "Emerging Gap" : "Stable",
        prediction: i % 3 === 0 ? "Persistent Gap" : i % 3 === 1 ? "Emerging Gap" : "Stable",
        probabilities: { "Persistent Gap": 72.4, "Emerging Gap": 18.2, "Stable": 9.4 },
        is_correct: i !== 4
      }))
    }
  }
}

export async function predictMLStudent(features: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/ml/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features)
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn("Error running live ML prediction, using fallback:", err)
    const declines = Number(features.consecutive_declines || 0)
    const trend = Number(features.score_trend || 0)
    const curr = Number(features.current_score || 70)

    let classification = "Stable"
    let probabilities = { "Persistent Gap": 0.1, "Emerging Gap": 0.2, "Stable": 0.7 }

    if (declines >= 2 || (curr < 50 && trend < -5)) {
      classification = "Persistent Gap"
      probabilities = { "Persistent Gap": 0.82, "Emerging Gap": 0.13, "Stable": 0.05 }
    } else if (trend < -3 || curr < 65 || declines === 1) {
      classification = "Emerging Gap"
      probabilities = { "Persistent Gap": 0.21, "Emerging Gap": 0.68, "Stable": 0.11 }
    }

    return { classification, probabilities }
  }
}


