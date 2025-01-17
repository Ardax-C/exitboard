'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import JobPostingForm from '@/components/JobPostingForm'

interface JobPosting {
  id: string
  title: string
  company: string
  companyDescription?: string
  companyWebsite?: string
  companySize?: string
  companyIndustry?: string
  location: string
  type: string
  level: string
  employmentType: string
  workplaceType: string
  description: string
  responsibilities: string[]
  requirements: string[]
  preferredQualifications?: string[]
  skills: string[]
  benefits: string[]
  salary?: {
    min: number
    max: number
    currency: string
    period: string
    isNegotiable: boolean
  }
  applicationDeadline?: string
  startDate?: string
  contactEmail: string
  contactPhone?: string
  applicationUrl?: string
  applicationInstructions?: string
  status: 'ACTIVE' | 'DRAFT' | 'CLOSED'
}

export default function EditJobPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading } = useUser()
  const [jobData, setJobData] = useState<JobPosting | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }

    const fetchJobData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/jobs/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch job data')
        }

        const data = await response.json()
        setJobData(data)
      } catch (error) {
        console.error('Error fetching job data:', error)
        setError('Failed to load job data')
      }
    }

    fetchJobData()
  }, [loading, user, router, params.id])

  const handleSubmit = async (formData: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update job posting')
      }

      router.push('/account')
    } catch (error) {
      console.error('Error updating job posting:', error)
      setError(error instanceof Error ? error.message : 'Failed to update job posting')
    }
  }

  if (loading || !jobData) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse text-center text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Edit Job Posting</h1>
          
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <JobPostingForm 
            initialData={jobData}
            onSubmit={handleSubmit}
            submitButtonText="Update Job Posting"
          />
        </div>
      </div>
    </div>
  )
} 