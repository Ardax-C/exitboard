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
    level: 'MID',
    employmentType: 'PERMANENT',
    workplaceType: 'ON_SITE',
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
    console.log('Form submission started')
    
    const processedData = {
      ...formData,
      responsibilities: formData.responsibilities.split('\n').filter(Boolean),
      requirements: formData.requirements.split('\n').filter(Boolean),
      preferredQualifications: formData.preferredQualifications.split('\n').filter(Boolean),
      skills: formData.skills.split('\n').filter(Boolean),
      benefits: formData.benefits.split('\n').filter(Boolean),
      salary: {
        ...formData.salary,
        min: formData.salary.min ? parseFloat(formData.salary.min as string) : 0,
        max: formData.salary.max ? parseFloat(formData.salary.max as string) : 0
      },
      status: 'ACTIVE'
    }

    console.log('Processed form data:', processedData)

    // Validate required fields
    if (!processedData.title || !processedData.company || !processedData.location || 
        !processedData.type || !processedData.level || !processedData.description || 
        !processedData.contactEmail) {
      console.error('Missing required fields:', {
        title: !processedData.title,
        company: !processedData.company,
        location: !processedData.location,
        type: !processedData.type,
        level: !processedData.level,
        description: !processedData.description,
        contactEmail: !processedData.contactEmail
      })
      return
    }

    // Validate salary if provided
    if (processedData.salary.min || processedData.salary.max) {
      console.log('Validating salary:', processedData.salary)
      if (processedData.salary.min <= 0 || processedData.salary.max <= 0 || 
          processedData.salary.min > processedData.salary.max) {
        console.error('Invalid salary range:', {
          min: processedData.salary.min,
          max: processedData.salary.max
        })
        return
      }
    }

    console.log('Form validation passed, submitting data')
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

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300">Company Description</label>
            <textarea
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              rows={3}
              placeholder="Tell us about your company..."
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
              placeholder="e.g., San Francisco, CA or Remote"
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
              <option value="ENTRY">Entry Level</option>
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid Level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
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
              <option value="SEASONAL">Seasonal</option>
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
              <option value="ON_SITE">On-site</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Job Description</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Overview</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Key Responsibilities (one per line)
            </label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows={4}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Required Qualifications (one per line)
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={4}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Preferred Qualifications (one per line)
            </label>
            <textarea
              name="preferredQualifications"
              value={formData.preferredQualifications}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Required Skills (one per line)
            </label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              rows={4}
              required
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      {/* Compensation & Benefits */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Compensation & Benefits</h2>
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
              <option value="JPY">JPY</option>
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
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="salary.isNegotiable"
                checked={formData.salary.isNegotiable}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  salary: { ...prev.salary, isNegotiable: e.target.checked }
                }))}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="text-sm font-medium text-gray-300">
                Salary is negotiable
              </label>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300">
              Benefits & Perks (one per line)
            </label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              rows={4}
              required
              placeholder="e.g., Health insurance&#10;401(k) matching&#10;Flexible work hours"
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
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
            <label className="block text-sm font-medium text-gray-300">Expected Start Date</label>
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
            <label className="block text-sm font-medium text-gray-300">Contact Phone (optional)</label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300">Application URL (optional)</label>
            <input
              type="url"
              name="applicationUrl"
              value={formData.applicationUrl}
              onChange={handleChange}
              placeholder="https://..."
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
              required
              placeholder="Provide any specific instructions for applicants..."
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={formData.title === ''}
          className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  )
} 