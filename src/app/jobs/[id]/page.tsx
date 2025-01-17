'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { JobPosting, getJobPosting } from '@/lib/jobs'
import { useUser } from '@/contexts/UserContext'
import { BuildingOfficeIcon, CalendarIcon, CurrencyDollarIcon, MapPinIcon } from '@heroicons/react/24/outline'

export default function JobPostingPage() {
  const { id } = useParams()
  const { user } = useUser()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const jobData = await getJobPosting(id as string)
        setJob(jobData)
        setError('')
      } catch (error) {
        console.error('Failed to fetch job:', error)
        setError('Failed to load job posting')
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            {error || 'Job posting not found'}
          </h2>
          <p className="text-gray-400">
            The job posting you're looking for might have been removed or is temporarily unavailable.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <p className="text-lg text-gray-300">{job.company}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
                      {job.type.replace('_', ' ').toLowerCase()}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-purple-400/10 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-inset ring-purple-400/30">
                      {job.level.toLowerCase()}
                    </span>
                    {job.employmentType && (
                      <span className="inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-400/30">
                        {job.employmentType.toLowerCase()}
                      </span>
                    )}
                    {job.workplaceType && (
                      <span className="inline-flex items-center rounded-md bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-400/30">
                        {job.workplaceType.replace('_', ' ').toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" />
                    <span>{job.location}</span>
                  </div>
                  {job.applicationDeadline && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      <span>Apply by {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              {job.salary && (
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <CurrencyDollarIcon className="h-5 w-5" />
                    <span>Salary Range</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">per {job.salary.period.toLowerCase()}</p>
                  {job.salary.isNegotiable && (
                    <p className="text-sm text-indigo-400 mt-1">Salary negotiable</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="p-8 border-b border-gray-700 bg-gray-800/30">
            <div className="flex items-center gap-2 mb-4">
              <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">About {job.company}</h2>
            </div>
            {job.companyDescription && (
              <div className="prose prose-invert max-w-none mb-6">
                <p className="text-gray-300">{job.companyDescription}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {job.companyWebsite && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Website</h3>
                  <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                    {job.companyWebsite}
                  </a>
                </div>
              )}
              {job.companySize && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Company Size</h3>
                  <p className="text-white">{job.companySize}</p>
                </div>
              )}
              {job.companyIndustry && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Industry</h3>
                  <p className="text-white">{job.companyIndustry}</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Details */}
          <div className="p-8 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-6">Job Details</h2>
            
            {/* Overview */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-300 mb-3">Overview</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {/* Key Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-md font-medium text-gray-300 mb-3">Key Responsibilities</h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 mr-3"></span>
                      <span className="text-gray-300">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Qualifications */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-300 mb-3">Required Qualifications</h3>
              <ul className="space-y-2">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 mr-3"></span>
                    <span className="text-gray-300">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preferred Qualifications */}
            {job.preferredQualifications && job.preferredQualifications.length > 0 && (
              <div className="mb-8">
                <h3 className="text-md font-medium text-gray-300 mb-3">Preferred Qualifications</h3>
                <ul className="space-y-2">
                  {job.preferredQualifications.map((qualification, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-green-500 mt-2 mr-3"></span>
                      <span className="text-gray-300">{qualification}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-md font-medium text-gray-300 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-sm font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="p-8 border-b border-gray-700 bg-gray-800/30">
              <h2 className="text-lg font-semibold text-white mb-4">Benefits & Perks</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 mr-3"></span>
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Information */}
          <div className="p-8 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-6">Additional Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {job.startDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Expected Start Date</h3>
                  <p className="text-white">{new Date(job.startDate).toLocaleDateString()}</p>
                </div>
              )}
              {job.applicationDeadline && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Application Deadline</h3>
                  <p className="text-white">{new Date(job.applicationDeadline).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Application Instructions */}
          <div className="p-8">
            <h2 className="text-lg font-semibold text-white mb-6">How to Apply</h2>
            {job.applicationInstructions && (
              <div className="prose prose-invert max-w-none mb-6">
                <p className="text-gray-300 whitespace-pre-wrap">{job.applicationInstructions}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Contact Email</h3>
                <a href={`mailto:${job.contactEmail}`} className="text-indigo-400 hover:text-indigo-300">
                  {job.contactEmail}
                </a>
              </div>
              {job.contactPhone && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Contact Phone</h3>
                  <p className="text-white">{job.contactPhone}</p>
                </div>
              )}
              {job.applicationUrl && (
                <div className="sm:col-span-2">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Application URL</h3>
                  <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                    {job.applicationUrl}
                  </a>
                </div>
              )}
            </div>

            {/* Apply Button */}
            <div className="flex justify-center gap-4">
              {job.applicationUrl ? (
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply on Company Website
                </a>
              ) : (
                <a
                  href={`mailto:${job.contactEmail}?subject=Application for ${job.title} position`}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply via Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 