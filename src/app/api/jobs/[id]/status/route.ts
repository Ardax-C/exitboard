import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import prisma from '@/lib/prisma'
import { PostingStatus } from '@prisma/client'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)

    const { status, isArchived, reason } = await request.json()

    // Validate status is a valid PostingStatus
    if (status && !Object.values(PostingStatus).includes(status as PostingStatus)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    // Validate the job exists and belongs to the user
    const job = await prisma.jobPosting.findUnique({
      where: { id: params.id },
      select: { authorId: true }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 })
    }

    if (job.authorId !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Determine the status and archive state
    let newStatus = status
    let newIsArchived = isArchived

    // If archiving, set status to PAUSED
    if (isArchived === true) {
      newStatus = PostingStatus.PAUSED
    }
    // If unarchiving and current status is PAUSED, set to ACTIVE
    else if (isArchived === false && !status) {
      newStatus = PostingStatus.ACTIVE
    }

    // If cancelling, force archive
    if (status === PostingStatus.CANCELLED) {
      newIsArchived = true
    }

    // Update the job posting
    const updatedJob = await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        status: newStatus as PostingStatus,
        isArchived: newIsArchived,
        lastActivityAt: new Date(),
        ...(status === PostingStatus.CANCELLED && reason ? { cancelReason: reason } : {})
      }
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Error updating job status:', error)
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    )
  }
} 