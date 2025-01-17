import React from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import ClientNavigation from '@/components/ClientNavigation'
import { UserProvider } from '@/contexts/UserContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ExitBoard - Professional Job Board',
  description: 'Find your next career opportunity or post job listings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-900">
      <body className={`${inter.className} h-full text-gray-100`}>
        <UserProvider>
          <div className="min-h-full">
            <ClientNavigation />
            <main>{children}</main>
          </div>
        </UserProvider>
      </body>
    </html>
  )
} 