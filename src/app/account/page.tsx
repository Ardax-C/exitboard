'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tab } from '@headlessui/react'
import { PencilIcon, TrashIcon, UserCircleIcon, BriefcaseIcon } from '@heroicons/react/24/outline'
import { useUser } from '@/contexts/UserContext'
import { removeAuthToken } from '@/lib/auth'
import Link from 'next/link'

interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  createdAt: string
  status: 'ACTIVE' | 'DRAFT' | 'CLOSED'
}

interface ProfileFormData {
  name: string
  email: string
  company: string
  title: string
}

export default function AccountPage() {
  const { user, loading, setUser } = useUser()
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState(0)

  const tabs = [
    { 
      name: 'Profile', 
      icon: UserCircleIcon,
      content: <ProfileSection user={user} /> 
    },
    { 
      name: 'My Job Listings', 
      icon: BriefcaseIcon,
      content: <JobListingsSection /> 
    },
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [loading, user, router])

  const handleSignOut = () => {
    removeAuthToken()
    setUser(null)
    router.push('/')
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Account Settings</h1>
              <p className="mt-1 text-sm text-gray-400">
                Manage your profile and job listings
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900"
            >
              Sign out
            </button>
          </div>

          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-800/50 p-1">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `w-full rounded-lg py-3 px-4 text-sm font-medium leading-5 text-white
                    ring-white ring-opacity-60 ring-offset-2 ring-offset-gray-900 focus:outline-none focus:ring-2
                    flex items-center justify-center space-x-2
                    ${
                      selected
                        ? 'bg-indigo-600 shadow'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }`
                  }
                >
                  <tab.icon className="h-5 w-5" aria-hidden="true" />
                  <span>{tab.name}</span>
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-6">
              {tabs.map((tab, idx) => (
                <Tab.Panel
                  key={idx}
                  className="rounded-xl bg-gray-800/50 p-6 ring-white ring-opacity-60 ring-offset-2 ring-offset-gray-900 focus:outline-none focus:ring-2"
                >
                  {tab.content}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  )
}

function ProfileSection({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    title: user?.title || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsEditing(false)
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Profile Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 focus:outline-none"
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={!isEditing}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

function JobListingsSection() {
  const router = useRouter()
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchJobPostings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/jobs/my-listings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setJobPostings(data)
      }
    } catch (error) {
      console.error('Error fetching job postings:', error)
      setError('Failed to load job postings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobPostings()
  }, [])

  const handleEdit = (jobId: string) => {
    router.push(`/jobs/${jobId}/edit`)
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove the deleted job from the state
        setJobPostings(jobPostings.filter(job => job.id !== jobId))
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete job posting')
      }
    } catch (error) {
      console.error('Error deleting job posting:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete job posting')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">My Job Listings</h2>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {jobPostings.length === 0 ? (
        <div className="text-center py-12">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-300">No job postings</h3>
          <p className="mt-1 text-sm text-gray-400">Get started by creating a new job posting.</p>
          <div className="mt-6">
            <Link
              href="/post"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
              Post a Job
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobPostings.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/75 transition-colors"
            >
              <div>
                <h3 className="text-lg font-medium text-white">{job.title}</h3>
                <div className="mt-1 text-sm text-gray-400">
                  <span>{job.company}</span>
                  <span className="mx-2">•</span>
                  <span>{job.location}</span>
                  <span className="mx-2">•</span>
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{job.status.toLowerCase()}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(job.id)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Edit job posting"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleDelete(job.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete job posting"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 