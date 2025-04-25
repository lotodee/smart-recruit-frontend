"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ExternalLink } from "lucide-react"
import api from "@/lib/axios"

type Candidate = {
  _id: string
  name: string
  email: string
  test_link: string
  stage: string
  status: string
  timestamp: string
  notes?: string
}

export function RecentCandidatesTable({formUpdateSuccess}:{formUpdateSuccess:boolean}) {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true)

        let endpoint = "/candidates"

        // Use search endpoint if query provided
        if (searchQuery) {
          endpoint = `/candidates/search/${searchQuery}`
        }

        const response = await api.get(endpoint)

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to load candidates")
        }

        // Get first 5 candidates for recent view
        setCandidates(response.data.data.slice(0, 5) || [])
      } catch (err: any) {
        setError("Failed to load candidates")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [searchQuery,formUpdateSuccess])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "passed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search candidates..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </Card>
          ))
        ) : candidates.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">No candidates found</Card>
        ) : (
          candidates.map((candidate) => (
            <Card key={candidate._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <Link href={`/candidates/${candidate._id}`} className="text-lg font-medium hover:underline">
                    {candidate.name}
                  </Link>
                  <Badge className={getStatusColor(candidate.status)}>{candidate.status}</Badge>
                </div>
                <p className="text-sm text-gray-500">{candidate.email}</p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{candidate.stage}</Badge>
                  <a
                    href={candidate.test_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
                  >
                    <span>Test</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={() => router.push("/candidates")}>
          View All Candidates
        </Button>
      </div>
    </div>
  )
}
