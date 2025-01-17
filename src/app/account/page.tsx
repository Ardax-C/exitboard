'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { deleteAccount } from '@/lib/auth'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading } = useUser()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

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
      router.push('/')
    } catch (error) {
      console.error('Failed to delete account:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg shadow px-5 py-6 sm:px-6">
          <h1 className="text-2xl font-bold text-white mb-8">Account Settings</h1>
          
          {/* Account Information */}
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-lg font-medium text-white mb-4">Account Information</h2>
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="bg-gray-700/50 px-4 py-5 sm:px-6 rounded-lg">
                  <dt className="text-sm font-medium text-gray-400">Name</dt>
                  <dd className="mt-1 text-lg text-white">{user.name || 'Not set'}</dd>
                </div>
                <div className="bg-gray-700/50 px-4 py-5 sm:px-6 rounded-lg">
                  <dt className="text-sm font-medium text-gray-400">Email</dt>
                  <dd className="mt-1 text-lg text-white">{user.email}</dd>
                </div>
                <div className="bg-gray-700/50 px-4 py-5 sm:px-6 rounded-lg">
                  <dt className="text-sm font-medium text-gray-400">Company</dt>
                  <dd className="mt-1 text-lg text-white">{user.company || 'Not set'}</dd>
                </div>
                <div className="bg-gray-700/50 px-4 py-5 sm:px-6 rounded-lg">
                  <dt className="text-sm font-medium text-gray-400">Title</dt>
                  <dd className="mt-1 text-lg text-white">{user.title || 'Not set'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-gray-700 pt-8">
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
    </div>
  )
} 