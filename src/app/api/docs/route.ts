import { NextResponse } from 'next/server'
import { getDocContent } from '@/lib/docs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as 'api' | 'schema'
  const sectionId = searchParams.get('section')

  if (!type || !sectionId) {
    return new NextResponse('Missing required parameters', { status: 400 })
  }

  const content = await getDocContent(type, sectionId)
  if (!content) {
    return new NextResponse('Section not found', { status: 404 })
  }

  return NextResponse.json(content)
} 