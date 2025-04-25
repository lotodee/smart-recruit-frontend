"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import api from "@/lib/axios"

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  candidate: {
    _id: string
    name: string
    email: string
    status: string
    stage: string
  }
  onSuccess: () => void
}

export function StatusUpdateModal({ isOpen, onClose, candidate, onSuccess }: StatusUpdateModalProps) {
  const [step, setStep] = useState<"confirm" | "reason" | "recruiter">("confirm")
  const [reason, setReason] = useState("")
  const [recruiterName, setRecruiterName] = useState("")
  const [recruiterEmail, setRecruiterEmail] =  useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null)

  const handleClose = () => {
    // Reset state
    setStep("confirm")
    setReason("")
    setRecruiterName("")
    setError(null)
    setSuccess(false)
    setEmailPreviewUrl(null)
    onClose()
  }

  const handleConfirm = () => {
    if (candidate.status === "Failed") {
      setStep("reason")
    } else {
      setStep("recruiter")
    }
  }

  const handleDecline = () => {
    handleClose()
  }

  const handleReasonSubmit = () => {
    if (!reason.trim() && candidate.status === "Failed") {
      setError("Please provide a reason for the failure")
      return
    }
    setStep("recruiter")
  }

  const handleSendEmail = async () => {
    if (!recruiterName.trim()) {
      setError("Please provide your name")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post(`/candidates/${candidate._id}/send-email`, {
        recruiterName,
        recruiterEmail,
        reason: candidate.status === "Failed" ? reason : undefined,
      })
      console.log("the response of email", response);
      if (response.data.success) {
        setSuccess(true)
        setEmailPreviewUrl(response.data.emailPreview)
        setTimeout(() => {
          handleClose()
          onSuccess()
        }, 3000)
      } else {
        throw new Error(response.data.message || "Failed to send email")
      }
    } catch (err: any) {
      console.log(err)
      setError(err.response?.data?.message || err.message || "Failed to send email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Send Status Update Email</DialogTitle>
              <DialogDescription>
                Would you like to send an email notification to {candidate.name}{" "}
                about their {candidate.status.toLowerCase()} status?
              </DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={handleDecline}>
                No, Don't Send
              </Button>
              <Button onClick={handleConfirm}>Yes, Continue</Button>
            </DialogFooter>
          </>
        )}

        {step === "reason" && (
          <>
            <DialogHeader>
              <DialogTitle>Provide Failure Reason</DialogTitle>
              <DialogDescription>
                Please provide a reason why the candidate failed. This will be
                included in the email.
              </DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Failure</Label>
                <Textarea
                  id="reason"
                  placeholder="Please explain why the candidate failed..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={handleDecline}>
                Cancel
              </Button>
              <Button onClick={handleReasonSubmit}>Continue</Button>
            </DialogFooter>
          </>
        )}

        {step === "recruiter" && (
          <>
            <DialogHeader>
              <DialogTitle>Provide Recruiter Information</DialogTitle>
              <DialogDescription>
                Please provide your name to be included in the email as the
                recruiter.
              </DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Email sent successfully!
                  {emailPreviewUrl && (
                    <div className="mt-2">
                      <a
                        href={emailPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Email Preview
                      </a>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recruiterName">Recruiter Name</Label>
                <Input
                  id="recruiterName"
                  placeholder="John Doe"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recruiterEmail">Recruiter Email</Label>
                <Input
                  id="recruiterEmail"
                  placeholder="recruiter@email.com"
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button
                variant="outline"
                onClick={handleDecline}
                disabled={isLoading || success}
              >
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={isLoading || success}>
                {isLoading ? "Sending..." : "Send Email"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
