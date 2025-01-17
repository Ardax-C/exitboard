'use client'

import { useState, useEffect } from 'react'

interface JobPostingFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  submitButtonText?: string
}

export default function JobPostingForm({
  initialData,
  onSubmit,
  submitButtonText = 'Post Job'
}: JobPostingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    companyDescription: '',
    companyWebsite: '',
    companySize: '',
    companyIndustry: '',
    location: '',
    type: 'FULL_TIME',
    level: 'MID_LEVEL',
    employmentType: 'PERMANENT',
    workplaceType: 'ONSITE',
    description: '',
    responsibilities: '',
    requirements: '',
    preferredQualifications: '',
    skills: '',
    benefits: '',
    salary: {
      min: '',
      max: '',
      currency: 'USD',
      period: 'YEARLY',
      isNegotiable: false
    },
    applicationDeadline: '',
    startDate: '',
    contactEmail: '',
    contactPhone: '',
    applicationUrl: '',
    applicationInstructions: '',
    status: 'ACTIVE'
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        responsibilities: Array.isArray(initialData.responsibilities)
          ? initialData.responsibilities.join('\n')
          : initialData.responsibilities || '',
        requirements: Array.isArray(initialData.requirements)
          ? initialData.requirements.join('\n')
          : initialData.requirements || '',
        preferredQualifications: Array.isArray(initialData.preferredQualifications)
          ? initialData.preferredQualifications.join('\n')
          : initialData.preferredQualifications || '',
        skills: Array.isArray(initialData.skills)
          ? initialData.skills.join('\n')
          : initialData.skills || '',
        benefits: Array.isArray(initialData.benefits)
          ? initialData.benefits.join('\n')
          : initialData.benefits || '',
        salary: initialData.salary || {
          min: '',
          max: '',
          currency: 'USD',
          period: 'YEARLY',
          isNegotiable: false
        }
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const processedData = {
      ...formData,
      responsibilities: formData.responsibilities.split('\n').filter(Boolean),
      requirements: formData.requirements.split('\n').filter(Boolean),
      preferredQualifications: formData.preferredQualifications.split('\n').filter(Boolean),
      skills: formData.skills.split('\n').filter(Boolean),
      benefits: formData.benefits.split('\n').filter(Boolean),
      salary: {
        ...formData.salary,
        min: parseFloat(formData.salary.min as string),
        max: parseFloat(formData.salary.max as string)
      }
    }

    onSubmit(processedData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.startsWith('salary.')) {
      const salaryField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        salary: {
          ...prev.salary,
          [salaryField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Basic Information</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Company Name</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Job Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Experience Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            >
              <option value="ENTRY_LEVEL">Entry Level</option>
              <option value="MID_LEVEL">Mid Level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
              <option value="MANAGER">Manager</option>
              <option value="EXECUTIVE">Executive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Employment Type</label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            >
              <option value="PERMANENT">Permanent</option>
              <option value="TEMPORARY">Temporary</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Workplace Type</label>
            <select
              name="workplaceType"
              value={formData.workplaceType}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            >
              <option value="ONSITE">On-site</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Company Information</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300">Company Description</label>
            <textarea
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Company Website</label>
            <input
              type="url"
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Company Size</label>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            >
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1001+">1001+ employees</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Industry</label>
            <input
              type="text"
              name="companyIndustry"
              value={formData.companyIndustry}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Job Details</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Job Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            <p className="mt-2 text-sm text-gray-400">
              Provide a detailed description of the role and its context within your organization.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Responsibilities</label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              required
              rows={6}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            <p className="mt-2 text-sm text-gray-400">
              List the key responsibilities, one per line.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Requirements</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              required
              rows={6}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            <p className="mt-2 text-sm text-gray-400">
              List the required qualifications and experience, one per line.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Preferred Qualifications</label>
            <textarea
              name="preferredQualifications"
              value={formData.preferredQualifications}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            <p className="mt-2 text-sm text-gray-400">
              List any preferred qualifications, one per line.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Skills</label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            <p className="mt-2 text-sm text-gray-400">
              List required skills and technologies, one per line.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Benefits</label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            <p className="mt-2 text-sm text-gray-400">
              List the benefits and perks, one per line.
            </p>
          </div>
        </div>
      </div>

      {/* Salary Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Salary Information</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Minimum Salary</label>
            <input
              type="number"
              name="salary.min"
              value={formData.salary.min}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Maximum Salary</label>
            <input
              type="number"
              name="salary.max"
              value={formData.salary.max}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Currency</label>
            <select
              name="salary.currency"
              value={formData.salary.currency}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Pay Period</label>
            <select
              name="salary.period"
              value={formData.salary.period}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            >
              <option value="HOURLY">Hourly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Application Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Application Details</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Application Deadline</label>
            <input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Contact Phone</label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Application URL</label>
            <input
              type="url"
              name="applicationUrl"
              value={formData.applicationUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300">Application Instructions</label>
            <textarea
              name="applicationInstructions"
              value={formData.applicationInstructions}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Posting Status</h2>
        <div>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  )
} 