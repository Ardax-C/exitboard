import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/server'
import prisma from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)

    if (!payload || typeof payload.userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Delete all job postings and their associated salaries first
    const userJobPostings = await prisma.jobPosting.findMany({
      where: { authorId: payload.userId },
      select: { id: true }
    })

    // Delete salaries and job postings in a transaction
    await prisma.$transaction([
      prisma.salary.deleteMany({
        where: {
          jobPostingId: {
            in: userJobPostings.map(post => post.id)
          }
        }
      }),
      prisma.jobPosting.deleteMany({
        where: { authorId: payload.userId }
      }),
      prisma.user.delete({
        where: { id: payload.userId }
      })
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
} 