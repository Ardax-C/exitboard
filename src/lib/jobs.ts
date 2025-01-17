import { getAuthToken } from './auth'

export interface JobPosting {
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
  employmentType?: string
  workplaceType?: string
  description: string
  responsibilities?: string[]
  requirements: string[]
  preferredQualifications?: string[]
  skills?: string[]
  benefits?: string[]
  salary?: {
    min: number
    max: number
    currency: string
    period: string
    isNegotiable?: boolean
  }
  applicationDeadline?: string
  startDate?: string
  contactEmail: string
  contactPhone?: string
  applicationUrl?: string
  applicationInstructions?: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface JobFilter {
  type?: string
  level?: string
  location?: string
  query?: string
}

export async function createJobPosting(data: Omit<JobPosting, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create job posting')
  }

  return response.json()
}

export async function getJobPostings(filters: JobFilter = {}) {
  const params = new URLSearchParams()
  if (filters.type) params.append('type', filters.type)
  if (filters.level) params.append('level', filters.level)
  if (filters.location) params.append('location', filters.location)
  if (filters.query) params.append('q', filters.query)

  const response = await fetch(`/api/jobs?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch job postings')
  }

  return response.json()
}

export async function getJobPosting(id: string) {
  const response = await fetch(`/api/jobs/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch job posting')
  }

  return response.json()
}

export async function updateJobPosting(
  id: string,
  data: Partial<Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>>
) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`/api/jobs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update job posting')
  }

  return response.json()
}

export async function getMyJobPostings() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch('/api/jobs/my-listings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch job postings')
  }

  return response.json()
}

export async function deleteJobPosting(id: string) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`/api/jobs/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete job posting')
  }
} 