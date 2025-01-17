'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { createJobPosting } from '@/lib/jobs'
import JobPostingForm from '@/components/JobPostingForm'
import Link from 'next/link'

export default function PostJobPage() {
  const router = useRouter()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Sign in to post a job</h2>
            <p className="mt-2 text-sm text-gray-300">
              You need to be signed in to post job opportunities on ExitBoard
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </Link>
            <div className="flex items-center">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="px-3 text-sm text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            <Link
              href="/auth/signup"
              className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    setError('')

    try {
      await createJobPosting(data)
      router.push('/jobs')
    } catch (err) {
      console.error('Failed to post job:', err)
      setError(err instanceof Error ? err.message : 'Failed to post job')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Post a New Position</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-gray-800/50 rounded-lg p-6">
          <JobPostingForm
            onSubmit={handleSubmit}
            submitButtonText={isSubmitting ? 'Posting...' : 'Post Job'}
          />
        </div>
      </div>
    </div>
  )
} 