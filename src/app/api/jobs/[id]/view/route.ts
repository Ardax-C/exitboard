import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the visitor ID from the request body
    const { visitorId } = await request.json()
    
    if (!visitorId) {
      return NextResponse.json(
        { error: 'Visitor ID is required' },
        { status: 400 }
      )
    }

    // First check if the view already exists
    const existingView = await prisma.jobView.findUnique({
      where: {
        jobId_visitorId: {
          jobId: params.id,
          visitorId: visitorId
        }
      }
    })

    // If the view doesn't exist, create it and increment the count
    if (!existingView) {
      await prisma.$transaction([
        prisma.jobView.create({
          data: {
            jobId: params.id,
            visitorId: visitorId
          }
        }),
        prisma.jobPosting.update({
          where: { id: params.id },
          data: {
            viewsCount: {
              increment: 1
            },
            lastActivityAt: new Date()
          }
        })
      ])
    }

    // Return the updated job posting
    const updatedJob = await prisma.jobPosting.findUnique({
      where: { id: params.id }
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Error tracking job view:', error)
    return NextResponse.json(
      { error: 'Failed to track job view' },
      { status: 500 }
    )
  }
} 