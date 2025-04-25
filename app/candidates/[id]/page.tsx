"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { CandidateDetails } from "@/components/candidate-details"
import { use } from "react"
import Loader from "@/components/ui/loader"
export default function CandidateDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
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
    return <Loader/>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <CandidateDetails id={id} />
      </main>
    </div>
  )
}
