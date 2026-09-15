/**
 * API client wrapper for LearnPulse AI Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api"

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
    console.error("Error creating student:", err)
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
    return await res.json()
  } catch (err) {
    console.error("Error assigning intervention:", err)
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
    return await res.json()
  } catch (err) {
    console.error(`Error marking alert reviewed for ${id}:`, err)
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
    console.warn("Copilot API error, using fallback answer:", err)
    return {
      answer: "Ananya Sharma needs attention today for Quadratic Equations (43%). The weakest domain class-wide is Problem Solving (57%).",
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
    return await res.json()
  } catch (err) {
    console.error(`Error accepting intervention for ${id}:`, err)
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
    return await res.json()
  } catch (err) {
    console.error(`Error modifying intervention for ${id}:`, err)
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
    return await res.json()
  } catch (err) {
    console.error(`Error overriding intervention for ${id}:`, err)
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
    const data = await res.json()
    return data.result
  } catch (err) {
    console.error(`Error submitting practice for ${id}:`, err)
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
    const data = await res.json()
    return data.result
  } catch (err) {
    console.error(`Error submitting reassessment for ${id}:`, err)
    return null
  }
}
