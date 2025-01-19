'use client'

import { useState, useEffect } from 'react'
import { Tab } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface DocSection {
  id: string
  title: string
  content: string
}

export default function DocsPage() {
  const [sections] = useState({
    'API Documentation': [
      { title: 'Authentication', id: 'authentication' },
      { title: 'User Management', id: 'user-management' },
      { title: 'Admin Routes', id: 'admin-routes' },
      { title: 'Job Posts', id: 'job-posts' },
      { title: 'Data Types', id: 'data-types' },
      { title: 'Security', id: 'security' },
    ],
    'Schema Documentation': [
      { title: 'User Model', id: 'user-model' },
      { title: 'JobPost Model', id: 'jobpost-model' },
      { title: 'Application Model', id: 'application-model' },
      { title: 'Relationships', id: 'relationships' },
      { title: 'Enums', id: 'enums' },
    ],
  })

  const [selectedTab, setSelectedTab] = useState(0)
  const [loadedContent, setLoadedContent] = useState<Record<string, DocSection>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  async function loadContent(sectionId: string, type: 'api' | 'schema') {
    if (loadedContent[sectionId] || loading[sectionId]) return

    setLoading(prev => ({ ...prev, [sectionId]: true }))

    try {
      const response = await fetch(`/api/docs?type=${type}&section=${sectionId}`)
      if (!response.ok) throw new Error('Failed to load content')

      const content = await response.json()
      setLoadedContent(prev => ({ ...prev, [sectionId]: content }))
    } catch (error) {
      console.error('Error loading documentation:', error)
    } finally {
      setLoading(prev => ({ ...prev, [sectionId]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            API Documentation
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            Complete documentation for the ExitBoard API and database schema
          </p>
        </div>

        <div className="mt-12">
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex space-x-4 rounded-xl bg-gray-800/50 p-1">
              {Object.keys(sections).map((category) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white/60 ring-offset-2 ring-offset-gray-900 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    )
                  }
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-8">
              {Object.entries(sections).map(([category, items], idx) => (
                <Tab.Panel
                  key={idx}
                  className="rounded-xl bg-gray-800/50 p-6"
                >
                  <div className="space-y-8">
                    {items.map((item) => (
                      <details
                        key={item.id}
                        className="group"
                        onToggle={(e) => {
                          if ((e.target as HTMLDetailsElement).open) {
                            loadContent(
                              item.id,
                              idx === 0 ? 'api' : 'schema'
                            )
                          }
                        }}
                      >
                        <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-700/50 px-4 py-3 hover:bg-gray-700">
                          <h3 className="text-lg font-medium text-white">
                            {item.title}
                          </h3>
                          <ChevronDownIcon 
                            className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" 
                          />
                        </summary>
                        <div className="mt-4 px-4 prose prose-invert max-w-none">
                          {loading[item.id] ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                          ) : loadedContent[item.id] ? (
                            <div dangerouslySetInnerHTML={{ 
                              __html: loadedContent[item.id].content 
                            }} />
                          ) : (
                            <p className="text-gray-400">
                              Click to load documentation
                            </p>
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  )
} 