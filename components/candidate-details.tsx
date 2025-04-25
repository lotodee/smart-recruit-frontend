"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ExternalLink, Mail } from "lucide-react"
import { StatusUpdateModal } from "@/components/status-update-modal"
import api from "@/lib/axios"

type EmailHistory = {
  _id: string
  date: string
  type: string
  recruiterName: string
  status: string
  stage: string
  reason?: string
}

type Candidate = {
  _id: string
  name: string
  email: string
  test_link: string
  stage: string
  status: string
  timestamp: string
  notes?: string
  skills?: string[]
  failureReason?: string
  emailHistory?: EmailHistory[]
}

export function CandidateDetails({ id }: { id: string }) {
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusModalOpen, setStatusModalOpen] = useState(false)

  const fetchCandidate = async () => {
    try {
      setLoading(true)

      const response = await api.get(`/candidates/${id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to load candidate details")
      }

      setCandidate(response.data.data)
    } catch (err: any) {
      setError("Failed to load candidate details")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidate()
  }, [id])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "passed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/candidates">
            <Button variant="ghost" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Candidates
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">{error || "Candidate not found"}</p>
            <Button className="mt-4" asChild>
              <Link href="/candidates">View All Candidates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/candidates">
          <Button variant="ghost" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Candidates
          </Button>
        </Link>
        {/* <Button variant="outline" className="gap-1" onClick={() => setStatusModalOpen(true)}>
          <Mail className="h-4 w-4" />
          Send Status Email
        </Button> */}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{candidate.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-1">
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p>{candidate.email}</p>
          </div>

          <div className="grid gap-1">
            <p className="text-sm font-medium text-gray-500">Test Link</p>
            <p>
              <a
                href={candidate.test_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>{candidate.test_link}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="grid gap-1">
            <p className="text-sm font-medium text-gray-500">Added On</p>
            <p>{new Date(candidate.timestamp).toLocaleString()}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Current Stage</p>
              <Badge variant="outline" className="text-sm py-1 px-3">
                {candidate.stage}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
              <Badge className={`text-sm py-1 px-3 ${getStatusColor(candidate.status)}`}>{candidate.status}</Badge>
            </div>
          </div>

          {candidate.skills && candidate.skills.length > 0 && (
            <div className="grid gap-1">
              <p className="text-sm font-medium text-gray-500">Skills</p>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* {candidate.failureReason && (
            <div className="grid gap-1">
              <p className="text-sm font-medium text-gray-500">Failure Reason</p>
              <p className="p-3 bg-red-50 text-red-800 rounded-md">{candidate.failureReason}</p>
            </div>
          )} */}

          {candidate.notes && (
            <div className="grid gap-1">
              <p className="text-sm font-medium text-gray-500">Notes</p>
              <p className="whitespace-pre-wrap">{candidate.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {candidate.emailHistory && candidate.emailHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Email History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {candidate.emailHistory.map((email, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between mb-2">
                    <p className="font-medium">
                      {email.stage} - {email.status} Update
                    </p>
                    <p className="text-sm text-gray-500">{new Date(email.date).toLocaleString()}</p>
                  </div>
                  <p className="text-sm">Sent by: {email.recruiterName}</p>
                  {email.reason && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                      <p className="font-medium">Reason:</p>
                      <p>{email.reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <StatusUpdateModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        candidate={candidate}
        onSuccess={fetchCandidate}
      />
    </div>
  )
}
