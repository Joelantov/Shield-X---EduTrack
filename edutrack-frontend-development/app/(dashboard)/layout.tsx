import type { ReactNode } from "react"
import { Sidebar } from "@/components/edutrack/sidebar"
import { RequireRole } from "@/components/edutrack/require-role"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="teacher">
      <div className="flex min-h-svh flex-col bg-background lg:flex-row">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </RequireRole>
  )
}
