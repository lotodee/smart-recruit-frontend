"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { CandidatesTable } from "@/components/candidates-table"

export default function CandidatesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const session = localStorage.getItem("smartrecruit_session")

    if (!session) {
      router.push("/")
      return
    }

    try {
      const parsedSession = JSON.parse(session)
      if (!parsedSession.logged_in) {
        router.push("/")
        return
      }
    } catch (e) {
      // Invalid session, remove it
      localStorage.removeItem("smartrecruit_session")
      router.push("/")
      return
    }

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">All Candidates</h1>
        <p className="text-gray-500 mb-8">View and manage all interview candidates</p>

        <CandidatesTable />
      </main>
    </div>
  )
}
