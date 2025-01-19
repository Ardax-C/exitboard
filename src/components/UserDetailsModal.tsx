import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface User {
  id: string;
  email: string;
  name: string;
  title: string;
  role: string;
  createdAt: string;
}

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onRoleChange: (newRole: string) => void;
}

export default function UserDetailsModal({ user, isOpen, onClose, onRoleChange }: UserDetailsModalProps) {
  if (!user) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-gray-800 text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className="mt-3 sm:mt-5">
                    <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-white mb-8">
                      User Details
                    </Dialog.Title>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Name</h3>
                        <p className="mt-1 text-sm text-white">{user.name}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</h3>
                        <p className="mt-1 text-sm text-white">{user.email}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Title</h3>
                        <p className="mt-1 text-sm text-white">{user.title || 'Not specified'}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Role</h3>
                        <div className="mt-1">
                          <select
                            value={user.role}
                            onChange={(e) => onRoleChange(e.target.value)}
                            className="block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-gray-500 sm:text-sm sm:leading-6"
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</h3>
                        <p className="mt-1 text-sm text-white">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:col-start-2"
                    onClick={onClose}
                  >
                    Deactivate User
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-600 hover:bg-gray-600 sm:col-start-1 sm:mt-0"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 