import { remark } from 'remark'
import html from 'remark-html'

export interface DocSection {
  id: string
  title: string
  content: string
}

export async function getDocContent(type: 'api' | 'schema', sectionId: string): Promise<DocSection | null> {
  try {
    const response = await fetch(`/docs/${type === 'api' ? 'API' : 'SCHEMA'}.md`)
    if (!response.ok) {
      throw new Error(`Failed to load documentation: ${response.statusText}`)
    }

    const markdown = await response.text()
    
    // First, remove the main title (# heading)
    const contentWithoutTitle = markdown.replace(/^#[^#\n]*\n/, '')
    
    // Split into sections, but keep the ## prefix
    const sections = contentWithoutTitle.split('\n## ').filter(Boolean)
    
    // Process each section
    const processedSections = sections.map(section => {
      const lines = section.split('\n')
      const title = lines[0].trim()
      const content = '## ' + section // Add back the ## prefix
      return {
        id: getSectionId(title),
        title,
        content
      }
    })

    // Find the requested section
    const section = processedSections.find(s => s.id === sectionId)
    if (!section) {
      return null
    }

    // Convert markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(section.content)

    return {
      id: section.id,
      title: section.title,
      content: processedContent.toString()
    }
  } catch (error) {
    console.error('Error loading documentation:', error)
    return null
  }
}

export function getSectionId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
} 