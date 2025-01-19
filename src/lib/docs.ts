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
    const sections = markdown.split(/^## /m)
    const section = sections.find(s => getSectionId(s.split('\n')[0]) === sectionId)

    if (!section) {
      return null
    }

    const title = section.split('\n')[0].trim()
    const content = await remark()
      .use(html)
      .process('## ' + section)

    return {
      id: sectionId,
      title,
      content: content.toString()
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