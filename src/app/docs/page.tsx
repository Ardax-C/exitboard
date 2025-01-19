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
  icon?: string
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
      { title: 'Authentication', id: 'authentication', icon: '🔐' },
      { title: 'User Management', id: 'user-management', icon: '👤' },
      { title: 'Admin Routes', id: 'admin-routes', icon: '⚡' },
      { title: 'Job Posts', id: 'job-posts', icon: '📝' },
      { title: 'Data Types', id: 'data-types', icon: '🔧' },
      { title: 'Security', id: 'security', icon: '🛡️' },
    ],
    'Schema Documentation': [
      { title: 'User Model', id: 'user-model', icon: '👤' },
      { title: 'JobPost Model', id: 'jobpost-model', icon: '📄' },
      { title: 'Application Model', id: 'application-model', icon: '📨' },
      { title: 'Relationships', id: 'relationships', icon: '🔗' },
      { title: 'Enums', id: 'enums', icon: '📋' },
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
        } as DocSection
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-block">
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 sm:text-5xl mb-2">
              API Documentation
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
          </div>
          <p className="mt-6 text-lg text-gray-300">
            Complete documentation for the ExitBoard API and database schema
          </p>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-12">
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex space-x-4 rounded-xl bg-gray-800/50 p-1.5 backdrop-blur-sm border border-gray-700/50">
              {Object.keys(sections).map((category) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-3 text-sm font-medium leading-5 transition-all duration-200',
                      'ring-white/60 ring-offset-2 ring-offset-gray-900 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
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
                  className="rounded-xl bg-gray-800/50 p-6 backdrop-blur-sm border border-gray-700/50"
                >
                  <div className="space-y-6">
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
                        <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-700/50 px-6 py-4 hover:bg-gray-700 transition-colors duration-200 border border-gray-600/50">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl" role="img" aria-label={item.title}>
                              {item.icon}
                            </span>
                            <h3 className="text-lg font-medium text-white">
                              {item.title}
                            </h3>
                          </div>
                          <ChevronDownIcon 
                            className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform duration-200" 
                          />
                        </summary>
                        <div className="mt-4 px-6">
                          <div className="prose prose-invert 
                            prose-h2:text-[#66D9EF] prose-h2:font-semibold
                            prose-h3:text-[#A6E22E] prose-h3:font-medium
                            prose-p:text-gray-300
                            prose-strong:text-[#F92672] prose-strong:font-semibold
                            prose-code:text-[#E6DB74] prose-code:bg-gray-800/75 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:border prose-code:border-gray-700/50
                            prose-pre:bg-[#272822] prose-pre:border prose-pre:border-gray-700/50 prose-pre:shadow-lg
                            prose-a:text-[#66D9EF] hover:prose-a:text-[#66D9EF]/80
                            prose-ul:text-gray-300 prose-li:text-gray-300
                            max-w-none
                            [&_pre_code]:text-gray-300
                            [&_pre_.language-typescript]:text-[#FD971F]
                            [&_.language-typescript_.string]:text-[#E6DB74]
                            [&_.language-typescript_.keyword]:text-[#F92672]
                            [&_.language-typescript_.function]:text-[#A6E22E]
                            [&_.language-typescript_.number]:text-[#AE81FF]
                            [&_.language-typescript_.operator]:text-[#F92672]
                            [&_.language-typescript_.punctuation]:text-gray-500
                            [&_.language-typescript_.property]:text-[#66D9EF]
                            [&_.language-typescript_.comment]:text-gray-500">
                            {loading[item.id] ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-r-transparent"></div>
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