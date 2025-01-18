'use client'

import React, { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { JobPosting, JobFilter, getJobPostings } from '@/lib/jobs'
import FilterDialog from '@/components/FilterDialog'
import Link from 'next/link'

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<JobFilter>({
    type: '',
    level: '',
    location: '',
  })
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const jobs = await getJobPostings({
          ...filters,
          query: searchQuery,
        })
        setJobPostings(jobs)
        setError('')
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
        setError('Failed to load job postings')
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchJobs, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, filters])

  const handleApplyFilters = (newFilters: JobFilter) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Available Positions</h1>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 bg-gray-800 py-3 pl-10 pr-3 text-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder="Search positions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-none">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <FunnelIcon className="h-5 w-5" aria-hidden="true" />
              Filters
              {(filters.type || filters.level || filters.location) && (
                <span className="ml-1 flex h-2 w-2 rounded-full bg-white" />
              )}
            </button>
          </div>
        </div>

        {/* Active filters */}
        {(filters.type || filters.level || filters.location) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.type && (
              <span className="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30">
                Type: {filters.type.replace('_', ' ').toLowerCase()}
              </span>
            )}
            {filters.level && (
              <span className="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30">
                Level: {filters.level.toLowerCase()}
              </span>
            )}
            {filters.location && (
              <span className="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30">
                Location: {filters.location}
              </span>
            )}
            <button
              type="button"
              onClick={() => setFilters({ type: '', level: '', location: '' })}
              className="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 hover:bg-gray-400/20"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-md bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mt-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          </div>
        )}

        {/* Job listings */}
        {!loading && (
          <div className="mt-8 space-y-4">
            {jobPostings.length === 0 ? (
              <div className="text-center text-gray-400">
                No job postings found
              </div>
            ) : (
              jobPostings.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block rounded-lg bg-gray-800 p-6 shadow-sm hover:bg-gray-800/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">{job.title}</h2>
                    <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
                      {job.type.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-300">{job.company}</p>
                    <p className="mt-1 text-sm text-gray-400">{job.location}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  {job.salary && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400">
                        {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} / {job.salary.period.toLowerCase()}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-4">
                    <span className="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400">
                      {job.viewsCount || 0} views
                    </span>
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Filter Dialog */}
        <FilterDialog
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onApplyFilters={handleApplyFilters}
        />
      </div>
    </div>
  )
} 