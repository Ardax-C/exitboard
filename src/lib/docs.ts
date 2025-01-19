import { remark } from 'remark'
import html from 'remark-html'
import { readFileSync } from 'fs'
import { join } from 'path'

const docsDirectory = join(process.cwd(), 'docs')

export interface DocSection {
  id: string
  title: string
  content: string
}

export async function getDocContent(type: 'api' | 'schema', sectionId: string): Promise<DocSection | null> {
  try {
    const fileName = type === 'api' ? 'API.md' : 'SCHEMA.md'
    const fullPath = join(docsDirectory, fileName)
    const fileContents = readFileSync(fullPath, 'utf8')

    // Split the content into sections based on ## headers
    const sections = fileContents.split('\n## ')
    
    // Find the matching section
    const section = sections.find(s => {
      const title = s.split('\n')[0].trim()
      return getSectionId(title) === sectionId
    })

    if (!section) {
      return null
    }

    const title = section.split('\n')[0].trim()
    const content = section.split('\n').slice(1).join('\n')

    // Convert markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(content)

    return {
      id: sectionId,
      title,
      content: processedContent.toString(),
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
    .replace(/(^-|-$)/g, '')
} 