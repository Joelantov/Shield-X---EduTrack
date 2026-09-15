import type { ReactNode } from "react"
import { StudentTopbar } from "@/components/edutrack/student-topbar"
import { RequireRole } from "@/components/edutrack/require-role"

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="student">
      <div className="flex min-h-svh flex-col bg-background">
        <StudentTopbar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </RequireRole>
  )
}
