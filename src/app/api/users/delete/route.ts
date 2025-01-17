import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import prisma from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = await verifyToken(token)
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Delete user's data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all job postings and their salaries
      const jobPostings = await tx.jobPosting.findMany({
        where: { authorId: decoded.userId },
        select: { id: true }
      })

      // Delete salaries for all job postings
      if (jobPostings.length > 0) {
        await tx.salary.deleteMany({
          where: {
            jobPostingId: {
              in: jobPostings.map(job => job.id)
            }
          }
        })

        // Delete job postings
        await tx.jobPosting.deleteMany({
          where: {
            authorId: decoded.userId
          }
        })
      }

      // Finally, delete the user
      await tx.user.delete({
        where: {
          id: decoded.userId
        }
      })
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
} 