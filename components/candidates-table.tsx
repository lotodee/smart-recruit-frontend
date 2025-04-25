"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ChevronDown, ExternalLink } from "lucide-react"
import { StatusUpdateModal } from "@/components/status-update-modal"
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
  skills?: string[]
  emailHistory?: Array<{
    date: string
    type: string
    recruiterName: string
    status: string
    stage: string
    reason?: string
  }>
}

export function CandidatesTable() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const itemsPerPage = 15

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

      setCandidates(response.data.data || [])
      setTotalPages(Math.ceil((response.data.data?.length || 0) / itemsPerPage))
    } catch (err: any) {
      setError("Failed to load candidates")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [searchQuery])

  const updateCandidateStatus = async (id: string, status: string) => {
    try {
      const response = await api.put(`/candidates/${id}`, { status })

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update status")
      }

      // Update local state
      const updatedCandidates = candidates.map((candidate) =>
        candidate._id === id ? { ...candidate, status } : candidate,
      )
      setCandidates(updatedCandidates)

      // Find the updated candidate
      const updatedCandidate = updatedCandidates.find((c) => c._id === id)

      // If status is Passed or Failed, open the modal
      if (updatedCandidate && (status === "Passed" || status === "Failed")) {
        setSelectedCandidate(updatedCandidate)
        setStatusModalOpen(true)
      }
    } catch (err: any) {
      console.error(err)
      setError("Failed to update status")
    }
  }

  const updateCandidateStage = async (id: string, currentStage: string) => {
    const newStage = currentStage === "Stage 1" ? "Stage 2" : "Stage 1"

    try {
      const response = await api.put(`/candidates/${id}`, { stage: newStage })

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update stage")
      }

      // Update local state
      setCandidates(
        candidates.map((candidate) => (candidate._id === id ? { ...candidate, stage: newStage } : candidate)),
      )
    } catch (err: any) {
      console.error(err)
      setError("Failed to update stage")
    }
  }

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

  // Pagination
  const paginatedCandidates = candidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search candidates by name or email..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Test Link</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-28" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No candidates found
                </TableCell>
              </TableRow>
            ) : (
              paginatedCandidates.map((candidate) => (
                <TableRow key={candidate._id}>
                  <TableCell>
                    <Link href={`/candidates/${candidate._id}`} className="font-medium hover:underline">
                      {candidate.name}
                    </Link>
                  </TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>
                    <a
                      href={candidate.test_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCandidateStage(candidate._id, candidate.stage)}
                    >
                      {candidate.stage}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${getStatusColor(candidate.status)} flex items-center gap-1`}
                        >
                          {candidate.status}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateCandidateStatus(candidate._id, "Pending")}>
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateCandidateStatus(candidate._id, "Passed")}>
                          Passed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateCandidateStatus(candidate._id, "Failed")}>
                          Failed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <Link href={`/candidates/${candidate._id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink isActive={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {selectedCandidate && (
        <StatusUpdateModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          candidate={selectedCandidate}
          onSuccess={fetchCandidates}
        />
      )}
    </div>
  )
}
