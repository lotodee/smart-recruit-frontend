"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Users } from "lucide-react"

export function DashboardHeader() {
  const router = useRouter()

  const handleLogout = () => {
    // Remove the session from localStorage
    localStorage.removeItem("smartrecruit_session")
    router.push("/")
    router.refresh()
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-xl flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>SmartRecruit</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium hover:underline">
            Dashboard
          </Link>
          <Link href="/candidates" className="text-sm font-medium hover:underline">
            All Candidates
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
