'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { removeAuthToken } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface MobileMenuProps {
  navigation: Array<{ name: string; href: string }>
}

export default function MobileMenu({ navigation }: MobileMenuProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user, setUser } = useUser()
  const router = useRouter()

  const handleSignOut = () => {
    removeAuthToken()
    setUser(null)
    router.push('/')
    setIsOpen(false)
  }

  return (
    <div className="sm:hidden">
      <button
        type="button"
        className="relative z-[999999] p-2 text-gray-400 hover:text-white focus:outline-none"
        onClick={() => setIsOpen(true)}
      >
        <span className="sr-only">Open main menu</span>
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[999999]" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-75"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[#0F1218]">
              <nav className="h-full flex flex-col">
                <div className="border-b border-gray-800">
                  <div className="px-4 h-16 flex items-center justify-between">
                    <span className="text-xl font-bold text-white">ExitBoard</span>
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-white focus:outline-none"
                      onClick={() => setIsOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="px-4 py-2">
                    <div className="text-sm font-medium text-gray-400 py-3">MENU</div>
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`block w-full py-3 text-base ${
                          pathname === item.href
                            ? 'text-indigo-400 font-medium'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-800">
                  <div className="px-4 py-4 space-y-3">
                    {user ? (
                      <>
                        <Link
                          href="/account"
                          onClick={() => setIsOpen(false)}
                          className={`block w-full py-3 text-center text-base ${
                            pathname === '/account'
                              ? 'text-indigo-400 font-medium'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          Account
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full py-3 text-center text-base text-white bg-red-600 rounded hover:bg-red-500"
                        >
                          Sign out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/signin"
                          onClick={() => setIsOpen(false)}
                          className="block w-full py-3 text-center text-base text-gray-300 hover:text-white"
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/auth/signup"
                          onClick={() => setIsOpen(false)}
                          className="block w-full py-3 text-center text-base text-white bg-indigo-600 rounded hover:bg-indigo-500"
                        >
                          Sign up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
    </div>
  )
} 