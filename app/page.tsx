"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import Loader from "@/components/ui/loader"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const session = localStorage.getItem("smartrecruit_session")

    if (session) {
      try {
        const parsedSession = JSON.parse(session)
        if (parsedSession.logged_in) {
          router.push("/dashboard")
          return
        }
      } catch (e) {
        // Invalid session, remove it
        localStorage.removeItem("smartrecruit_session")
      }
    }

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return <Loader/>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">SmartRecruit</h1>
          <p className="text-gray-500 mt-2">Interview Tracker App</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
