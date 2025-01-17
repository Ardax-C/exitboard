import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/server'

const prisma = new PrismaClient()

export async function GET(request: Request) {
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

    const jobPostings = await prisma.jobPosting.findMany({
      where: {
        authorId: payload.userId,
      },
      include: {
        salary: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(jobPostings)
  } catch (error) {
    console.error('Get my job listings error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
} 