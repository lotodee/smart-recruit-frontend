"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { NewCandidateForm } from "@/components/new-candidate-form"
import { RecentCandidatesTable } from "@/components/recent-candidates-table"
import { useRef } from "react";
import Loader from "@/components/ui/loader"
export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [formUpdateSuccess, setFormUpdateSuccess] = useState(false);


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
        <h1 className="text-3xl font-bold mb-2">Welcome to SmartRecruit</h1>
        <p className="text-gray-500 mb-8">
          Manage your interview candidates efficiently
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">Add New Candidate</h2>
            <NewCandidateForm onSuccessChange={(val) => setFormUpdateSuccess(val)} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Candidates</h2>
            <RecentCandidatesTable formUpdateSuccess = {formUpdateSuccess} />
          </div>
        </div>
      </main>
    </div>
  );
}
