'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { removeAuthToken } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import MobileMenu from './MobileMenu'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'Post a Job', href: '/post' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navigation() {
  const pathname = usePathname()
  const { user, setUser } = useUser()
  const router = useRouter()

  const handleSignOut = () => {
    removeAuthToken()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-white">
                ExitBoard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    pathname === item.href
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white',
                    'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-4">
              {user ? (
                <>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className={classNames(
                        pathname === '/admin'
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'rounded-md px-3 py-2 text-sm font-medium'
                      )}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className={classNames(
                      pathname === '/account'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium'
                    )}
                  >
                    Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-300 hover:bg-red-600 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-indigo-600 text-white hover:bg-indigo-500 rounded-md px-3 py-2 text-sm font-medium"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
          <MobileMenu navigation={navigation} />
        </div>
      </div>
    </nav>
  )
} 