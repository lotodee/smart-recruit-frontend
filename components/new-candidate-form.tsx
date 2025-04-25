"use client"

import type React from "react"

import { useState, forwardRef, type KeyboardEvent, useImperativeHandle, useEffect } from "react";
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/axios"

// Common tech skills for suggestions
const commonSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "Express",
  "MongoDB",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "GraphQL",
  "REST API",
  "HTML",
  "CSS",
  "Sass",
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Git",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Djanjo",
  "Python",
  "Google Cloud",
  "CI/CD",
  "Jest",
  "Mocha",
  "Cypress",
  "Testing Library",
  "Webpack",
  "Babel",
  "Next.js",
  "Gatsby",
  "Redux",
  "MobX",
  "MERN",
  "React Query",
]

const candidateSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  test_link: z.string().url("Valid URL is required"),
})

type CandidateFormValues = z.infer<typeof candidateSchema>

export const NewCandidateForm =({onSuccessChange}:{onSuccessChange:(success:boolean)=>void}) =>{
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [filteredSkills, setFilteredSkills] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: "",
      email: "",
      test_link: ""

    },
  })

 
useEffect(() => {
  onSuccessChange(success)
}, [success])

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSkillInput(value)

    if (value.trim()) {
      const filtered = commonSkills.filter(
        (skill) => skill.toLowerCase().includes(value.toLowerCase()) && !skills.includes(skill),
      )
      setFilteredSkills(filtered)
      setShowSuggestions(true)
    } else {
      setFilteredSkills([])
      setShowSuggestions(false)
    }
  }

  const addSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill)) {
      setSkills([...skills, skill])
      setSkillInput("")
      setFilteredSkills([])
      setShowSuggestions(false)
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault()
      addSkill(skillInput)
    }
  }

  const selectSuggestion = (skill: string) => {
    addSkill(skill)
  }

  async function onSubmit(data: CandidateFormValues) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    // if (data.skills.length < 0) {

    // }
    try {
      // Insert new candidate via API with skills
      const response = await api.post("/candidates", {
        ...data,
        skills,
      })

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to add candidate")
      }
      
      setSuccess(true)
      reset()
      setSkills([])
      router.refresh()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to add candidate. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>Candidate added successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="test_link">Test Link</Label>
            <Input
              id="test_link"
              placeholder="https://example.com/test"
              {...register("test_link")}
              className={errors.test_link ? "border-red-500" : ""}
            />
            {errors.test_link && (
              <p className="text-sm text-red-500">{errors.test_link.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <div className="relative">
              <Input
                id="skills"
                placeholder="Add skills (e.g., React, Node.js)"
                value={skillInput}
                onChange={handleSkillInputChange}
                onKeyDown={handleSkillKeyDown}
                onFocus={() => skillInput.trim() && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && filteredSkills.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectSuggestion(skill)}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              )}
              {/* {errors.test_link && (
                <p className="text-sm mt-2 text-red-500">
                  {errors.skills.message}
                </p>
              )} */}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 py-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {skill}</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Candidate"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}