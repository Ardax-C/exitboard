'use client'

import dynamic from 'next/dynamic'

// Import Navigation component with no SSR
const Navigation = dynamic(() => import('./Navigation'), { ssr: false })

export default function ClientNavigation() {
  return <Navigation />
} 