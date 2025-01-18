import { Fragment, useState } from 'react'
import { Menu, Transition, Dialog } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { getStatusLabel, getStatusColor } from '@/lib/jobs'

interface JobStatusManagerProps {
  status: string
  isArchived: boolean
  onUpdateStatus: (status: string, reason?: string) => void
  onToggleArchive: () => void
}

export default function JobStatusManager({
  status,
  isArchived,
  onUpdateStatus,
  onToggleArchive
}: JobStatusManagerProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const statusColor = getStatusColor(status)
  const statusLabel = getStatusLabel(status)

  const statusOptions = [
    { value: 'ACTIVE', label: 'Set as Active' },
    { value: 'PAUSED', label: 'Pause Listing' },
    { value: 'FILLED', label: 'Mark as Filled' },
    { value: 'EXPIRED', label: 'Mark as Expired' }
  ]

  const handleCancel = () => {
    onUpdateStatus('CANCELLED', cancelReason)
    setIsCancelDialogOpen(false)
    setCancelReason('')
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium 
              ${statusColor === 'gray' ? 'bg-gray-400/10 text-gray-400 ring-gray-400/20' :
              statusColor === 'green' ? 'bg-green-500/10 text-green-400 ring-green-500/20' :
              statusColor === 'yellow' ? 'bg-yellow-400/10 text-yellow-500 ring-yellow-400/20' :
              statusColor === 'blue' ? 'bg-blue-400/10 text-blue-400 ring-blue-400/20' :
              'bg-red-400/10 text-red-400 ring-red-400/20'}
              ring-1 ring-inset`}
          >
            {statusLabel}
          </span>
          {isArchived && (
            <span className="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20">
              Archived
            </span>
          )}
        </div>

        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="flex items-center rounded-full bg-gray-800/50 p-1 text-gray-400 hover:text-gray-300">
            <span className="sr-only">Open options</span>
            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {/* Status options */}
                {statusOptions.map((option) => (
                  <Menu.Item key={option.value}>
                    {({ active }) => (
                      <button
                        onClick={() => onUpdateStatus(option.value)}
                        className={`${
                          active ? 'bg-gray-700 text-white' : 'text-gray-300'
                        } group flex w-full items-center px-4 py-2 text-sm`}
                        disabled={status === option.value}
                      >
                        {option.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}

                {/* Cancel option */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsCancelDialogOpen(true)}
                      className={`${
                        active ? 'bg-gray-700 text-white' : 'text-gray-300'
                      } group flex w-full items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 border-t border-gray-700`}
                      disabled={status === 'CANCELLED'}
                    >
                      Cancel Listing
                    </button>
                  )}
                </Menu.Item>

                {/* Archive toggle */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onToggleArchive}
                      className={`${
                        active ? 'bg-gray-700 text-white' : 'text-gray-300'
                      } group flex w-full items-center px-4 py-2 text-sm border-t border-gray-700`}
                    >
                      {isArchived ? 'Unarchive Listing' : 'Archive Listing'}
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* Cancel Dialog */}
      <Transition show={isCancelDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[999999]" onClose={() => setIsCancelDialogOpen(false)}>
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
                      onClick={() => setIsCancelDialogOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-white mb-4">
                        Cancel Job Listing
                      </Dialog.Title>
                      <p className="text-sm text-gray-400 mb-4">
                        This will cancel the job listing and automatically archive it. This action cannot be undone.
                      </p>
                      <div className="mt-2">
                        <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-300 mb-2">
                          Reason for cancellation (optional)
                        </label>
                        <textarea
                          id="cancel-reason"
                          rows={3}
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                          placeholder="e.g., Position filled through other means, Budget changes, etc."
                        />
                      </div>
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
                          onClick={handleCancel}
                        >
                          Cancel Listing
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-600 hover:bg-gray-600 sm:mt-0 sm:w-auto"
                          onClick={() => setIsCancelDialogOpen(false)}
                        >
                          Keep Active
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
} 