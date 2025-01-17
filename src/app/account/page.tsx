'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { deleteAccount, updateProfile, removeAuthToken } from '@/lib/auth'
import { getMyJobPostings, deleteJobPosting, JobPosting, updateJobStatus } from '@/lib/jobs'
import Link from 'next/link'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import JobStatusManager from '@/components/JobStatusManager'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading, setUser } = useUser()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError, setJobsError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    company: '',
    title: '',
  })
  const [profileError, setProfileError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email,
        company: user.company || '',
        title: user.title || '',
      })
    }
  }, [user])

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true)
        const jobs = await getMyJobPostings()
        setJobPostings(jobs)
        setJobsError('')
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
        setJobsError('Failed to load your job postings')
      } finally {
        setJobsLoading(false)
      }
    }

    if (user) {
      fetchJobs()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/signin')
    return null
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      setError('')
      await deleteAccount()
      removeAuthToken()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Failed to delete account:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return
    }

    try {
      await deleteJobPosting(jobId)
      setJobPostings(jobs => jobs.filter(job => job.id !== jobId))
    } catch (error) {
      console.error('Failed to delete job:', error)
      setJobsError('Failed to delete job posting')
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      setProfileError('')
      const updatedUser = await updateProfile(profileData)
      setUser(updatedUser)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setProfileError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Account Information */}
        <div className="bg-gray-800/50 rounded-lg shadow px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Account Information</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setProfileData({
                      name: user.name || '',
                      email: user.email,
                      company: user.company || '',
                      title: user.title || '',
                    })
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {profileError && (
            <div className="rounded-md bg-red-500/10 p-4 mb-4">
              <p className="text-sm text-red-400">{profileError}</p>
            </div>
          )}

          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="bg-gray-700/50 px-4 py-5 sm:px-6 rounded-lg">
              <dt className="text-sm font-medium text-gray-400">Name</dt>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-0 bg-gray-600 py-2 px-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                  required
                />
              ) : (
                <dd className="mt-1 text-lg text-white">{user.name || 'Not set'}</dd>
              )}
            </div>
            <div className="bg-gray-700/50 px-4 py-5 sm:px-6 rounded-lg">
              <dt className="text-sm font-medium text-gray-400">Email</dt>
              {isEditing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-0 bg-gray-600 py-2 px-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                  required
                />
              ) : (
                <dd className="mt-1 text-lg text-white">{user.email}</dd>
              )}
            </div>
            <div className="bg-gray-700/50 px-4 py-5 sm:px-6 rounded-lg">
              <dt className="text-sm font-medium text-gray-400">Company</dt>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.company}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                  className="mt-1 block w-full rounded-md border-0 bg-gray-600 py-2 px-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                />
              ) : (
                <dd className="mt-1 text-lg text-white">{user.company || 'Not set'}</dd>
              )}
            </div>
            <div className="bg-gray-700/50 px-4 py-5 sm:px-6 rounded-lg">
              <dt className="text-sm font-medium text-gray-400">Title</dt>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.title}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-0 bg-gray-600 py-2 px-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                />
              ) : (
                <dd className="mt-1 text-lg text-white">{user.title || 'Not set'}</dd>
              )}
            </div>
          </dl>
        </div>

        {/* Job Postings */}
        <div className="bg-gray-800/50 rounded-lg shadow px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Your Job Postings</h2>
            <Link
              href="/post"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Post a New Job
            </Link>
          </div>

          {jobsError && (
            <div className="rounded-md bg-red-500/10 p-4 mb-4">
              <p className="text-sm text-red-400">{jobsError}</p>
            </div>
          )}

          {jobsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
            </div>
          ) : jobPostings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">You haven't posted any jobs yet.</p>
              <Link
                href="/post"
                className="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobPostings.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-white truncate">{job.title}</h3>
                    <div className="mt-1 flex items-center gap-4">
                      <p className="text-sm text-gray-300">{job.company}</p>
                      <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
                        {job.type.replace('_', ' ').toLowerCase()}
                      </span>
                      <span className="text-sm text-gray-400">{job.location}</span>
                      <span className="text-sm text-gray-400">
                        {job.applicationsCount} application{job.applicationsCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm text-gray-400">
                        {job.viewsCount || 0} view{job.viewsCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-4">
                    <JobStatusManager
                      status={job.status}
                      isArchived={job.isArchived}
                      onUpdateStatus={async (newStatus) => {
                        try {
                          await updateJobStatus(job.id, newStatus)
                          // Update the job in the local state
                          setJobPostings(jobs =>
                            jobs.map(j =>
                              j.id === job.id
                                ? { ...j, status: newStatus, lastActivityAt: new Date().toISOString() }
                                : j
                            )
                          )
                        } catch (error) {
                          console.error('Failed to update job status:', error)
                          setJobsError('Failed to update job status')
                        }
                      }}
                      onToggleArchive={async () => {
                        try {
                          const newIsArchived = !job.isArchived;
                          const newStatus = newIsArchived ? 'PAUSED' : 'ACTIVE';
                          await updateJobStatus(job.id, newStatus, newIsArchived);
                          // Update the job in the local state
                          setJobPostings(jobs =>
                            jobs.map(j =>
                              j.id === job.id
                                ? { 
                                    ...j, 
                                    status: newStatus,
                                    isArchived: newIsArchived, 
                                    lastActivityAt: new Date().toISOString() 
                                  }
                                : j
                            )
                          );
                        } catch (error) {
                          console.error('Failed to toggle archive status:', error);
                          setJobsError('Failed to update archive status');
                        }
                      }}
                    />
                    <Link
                      href={`/jobs/${job.id}/edit`}
                      className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-600"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-800/50 rounded-lg shadow px-5 py-6 sm:px-6">
          <h2 className="text-lg font-medium text-red-500 mb-4">Danger Zone</h2>
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-400">Delete Account</h3>
            <p className="mt-1 text-sm text-gray-400">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 