"use client"

import { useState } from "react"
import { Sparkles, Send, Bot, User, HelpCircle, BookOpen } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getStudent } from "@/lib/edutrack-data"
import { askCopilot } from "@/lib/api"
import { Card } from "@/components/edutrack/primitives"
import { cn } from "@/lib/utils"

export default function StudentCopilotPage() {
  const { session } = useAuth()
  const student = session?.studentId ? getStudent(session.studentId) : undefined

  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string; source?: string }>>([
    {
      role: "assistant",
      text: `Hi ${student?.name.split(" ")[0] || "there"}! I'm **EduTrack AI**, your personal study buddy. Ask me to explain any math problem, give you study tips, or review your weak topics!`,
    },
  ])
  const [inputQuery, setInputQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const studentSuggestions = [
    "Explain Quadratic Equations factoring simply step-by-step",
    "How can I raise my Problem Solving grade?",
    "Give me 3 daily practice tips for reading comprehension",
    "What should I study today based on my current scores?",
  ]

  if (!student) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-muted-foreground">Please sign in to chat with your AI Copilot.</p>
      </div>
    )
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim()
    if (!text) return

    setChatMessages((prev) => [...prev, { role: "user", text }])
    if (!textToSend) setInputQuery("")
    setIsLoading(true)

    const res = await askCopilot(`${text} (Student Context: Name=${student.name}, Grade=${student.grade}, Note=${student.note})`)
    
    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: res?.answer || "I am here to help you study! Let's focus on practicing step-by-step problems today.",
        source: res?.source,
      },
    ])
    setIsLoading(false)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-4 sm:px-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Personal AI Tutor</span>
          <h1 className="font-display text-2xl font-bold text-foreground">Ask EduTrack AI Copilot</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>{student.name}</span>
          <span>•</span>
          <span className="text-foreground">{student.grade} ({student.section || "Sec A"})</span>
          <span>•</span>
          <span className="text-primary font-bold">Roll No: {student.rollNo || "#14"}</span>
        </div>
      </div>

      {/* CHAT PANEL CARD */}
      <Card className="flex flex-col h-[650px] overflow-hidden border-primary/30 shadow-lg">
        {/* Top Chat Bar */}
        <div className="flex items-center justify-between border-b border-border bg-primary/10 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="size-5 animate-pulse" />
            </span>
            <div>
              <h2 className="font-display font-bold text-sm text-foreground">EduTrack AI Study Buddy</h2>
              <p className="text-[11px] text-muted-foreground">Powered by Gemini AI • Always ready to help</p>
            </div>
          </div>
          <span className="rounded-full bg-success/20 px-2.5 py-0.5 text-[11px] font-bold text-success">
            Online
          </span>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-card/40">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-3 max-w-[88%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-xs",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground border border-border"
                )}
              >
                {msg.role === "user" ? <User className="size-4" /> : <Bot className="size-4 text-primary" />}
              </div>

              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs space-y-1",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                    : "bg-secondary/90 text-foreground rounded-tl-none border border-border/80"
                )}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                {msg.source && (
                  <span className="block text-[10px] opacity-70 italic pt-1">
                    Source: {msg.source === "gemini_api" ? "Gemini AI Live Tutor" : "EduTrack Knowledge Engine"}
                  </span>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic pl-2">
              <Sparkles className="size-4 animate-spin text-primary" />
              EduTrack AI is generating your explanation...
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="border-t border-border bg-muted/40 p-2 overflow-x-auto flex gap-2 no-scrollbar">
          {studentSuggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(s)}
              className="whitespace-nowrap rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/40 shrink-0"
            >
              ✨ {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center gap-2 border-t border-border bg-card p-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about your subjects, topics, or study goals..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </form>
      </Card>
    </div>
  )
}
