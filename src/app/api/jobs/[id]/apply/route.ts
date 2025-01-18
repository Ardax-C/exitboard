import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Increment the applications count and update lastActivityAt
    const updatedJob = await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        applicationsCount: {
          increment: 1
        },
        lastActivityAt: new Date()
      }
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Error incrementing applications count:', error)
    return NextResponse.json(
      { error: 'Failed to record application' },
      { status: 500 }
    )
  }
} 