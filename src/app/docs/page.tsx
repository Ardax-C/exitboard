'use client'

import { useState } from 'react'
import { Tab } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { remark } from 'remark'
import html from 'remark-html'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface DocSection {
  id: string
  title: string
  content: string
}

function getSectionId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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
  const [error, setError] = useState<string | null>(null)

  async function loadContent(sectionId: string, type: 'api' | 'schema') {
    if (loadedContent[sectionId] || loading[sectionId]) return

    setLoading(prev => ({ ...prev, [sectionId]: true }))
    setError(null)

    try {
      console.log(`Fetching ${type} documentation...`)
      const url = `/docs/${type === 'api' ? 'API' : 'SCHEMA'}.md`
      console.log('URL:', url)
      
      const response = await fetch(url)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Failed to load documentation: ${response.statusText}`)
      }

      const markdown = await response.text()
      console.log('Markdown loaded, length:', markdown.length)
      
      // Remove the main title
      const contentWithoutTitle = markdown.replace(/^#[^#\n]*\n/, '')
      
      // Split into sections
      const sections = contentWithoutTitle.split('\n## ').filter(Boolean)
      console.log('Found sections:', sections.length)
      
      // Process sections
      const processedSections = sections.map(section => {
        const lines = section.split('\n')
        const title = lines[0].trim()
        const content = '## ' + section
        const id = getSectionId(title)
        console.log('Processing section:', { title, id })
        return { id, title, content }
      })

      // Find the requested section
      const section = processedSections.find(s => s.id === sectionId)
      if (!section) {
        console.error('Section not found:', sectionId)
        console.log('Available sections:', processedSections.map(s => s.id))
        throw new Error(`Section "${sectionId}" not found`)
      }

      // Convert markdown to HTML
      const processedContent = await remark()
        .use(html)
        .process(section.content)

      setLoadedContent(prev => ({
        ...prev,
        [sectionId]: {
          id: section.id,
          title: section.title,
          content: processedContent.toString()
        }
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error loading documentation:', error)
      setError(errorMessage)
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

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

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