'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { JobFilter } from '@/lib/jobs'

interface FilterDialogProps {
  isOpen: boolean
  onClose: () => void
  filters: JobFilter
  onApplyFilters: (filters: JobFilter) => void
}

const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']
const jobLevels = ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']
const workplaceTypes = ['ON_SITE', 'REMOTE', 'HYBRID']

export default function FilterDialog({ isOpen, onClose, filters, onApplyFilters }: FilterDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    onApplyFilters({
      type: formData.get('type') as string || '',
      level: formData.get('level') as string || '',
      location: formData.get('location') as string || '',
    })
    onClose()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-300 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-white mb-6">
                      Filter Jobs
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Job Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Job Type
                        </label>
                        <select
                          name="type"
                          defaultValue={filters.type}
                          className="block w-full rounded-md border-0 bg-gray-700 py-2 px-3 text-white shadow-sm focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">All Types</option>
                          {jobTypes.map((type) => (
                            <option key={type} value={type}>
                              {type.replace('_', ' ').toLowerCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Experience Level */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Experience Level
                        </label>
                        <select
                          name="level"
                          defaultValue={filters.level}
                          className="block w-full rounded-md border-0 bg-gray-700 py-2 px-3 text-white shadow-sm focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">All Levels</option>
                          {jobLevels.map((level) => (
                            <option key={level} value={level}>
                              {level.toLowerCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Workplace Type
                        </label>
                        <select
                          name="location"
                          defaultValue={filters.location}
                          className="block w-full rounded-md border-0 bg-gray-700 py-2 px-3 text-white shadow-sm focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">All Types</option>
                          {workplaceTypes.map((type) => (
                            <option key={type} value={type}>
                              {type.replace('_', ' ').toLowerCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-8 flex justify-end gap-3">
                        <button
                          type="button"
                          className="rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-600"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 