import { NextResponse } from 'next/server'
import { JobType, JobLevel, PostingStatus, Prisma } from '@prisma/client'
import { verifyToken } from '@/lib/auth/server'
import prisma from '@/lib/prisma'

// Get all job postings with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as JobType | null
    const level = searchParams.get('level') as JobLevel | null
    const location = searchParams.get('location')
    const query = searchParams.get('query')

    const where = {
      status: 'ACTIVE' as PostingStatus,
      ...(type && { type }),
      ...(level && { level }),
      ...(location && { location: { contains: location, mode: 'insensitive' as const } }),
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' as const } },
          { company: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
        ],
      }),
    }

    const jobPostings = await prisma.jobPosting.findMany({
      where,
      include: {
        salary: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(jobPostings)
  } catch (error) {
    console.error('Get job postings error:', error)
    return NextResponse.json(
      { error: 'Database error occurred while fetching job postings' },
      { status: 500 }
    )
  }
}

// Create a new job posting
export async function POST(request: Request) {
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

    const {
      title,
      company,
      companyDescription,
      companyWebsite,
      companySize,
      companyIndustry,
      location,
      type,
      level,
      employmentType,
      workplaceType,
      description,
      responsibilities,
      requirements,
      preferredQualifications,
      skills,
      benefits,
      salary,
      applicationDeadline,
      startDate,
      contactEmail,
      contactPhone,
      applicationUrl,
      applicationInstructions,
    } = await request.json()

    // Validate required fields
    if (!title || !company || !location || !type || !level || !description || !contactEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create job posting with all fields
    const jobPosting = await prisma.jobPosting.create({
      data: {
        title,
        company,
        companyDescription,
        companyWebsite,
        companySize,
        companyIndustry,
        location,
        type,
        level,
        employmentType,
        workplaceType,
        description,
        responsibilities: Array.isArray(responsibilities) 
          ? responsibilities 
          : responsibilities?.split('\n').filter(Boolean) || [],
        requirements: Array.isArray(requirements)
          ? requirements
          : requirements.split('\n').filter(Boolean),
        preferredQualifications: Array.isArray(preferredQualifications)
          ? preferredQualifications
          : preferredQualifications?.split('\n').filter(Boolean) || [],
        skills: Array.isArray(skills)
          ? skills
          : skills?.split('\n').filter(Boolean) || [],
        benefits: Array.isArray(benefits)
          ? benefits
          : benefits?.split('\n').filter(Boolean) || [],
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        contactEmail,
        contactPhone,
        applicationUrl,
        applicationInstructions,
        authorId: payload.userId,
        ...(salary && {
          salary: {
            create: {
              min: parseFloat(salary.min),
              max: parseFloat(salary.max),
              currency: salary.currency,
              period: salary.period,
              isNegotiable: salary.isNegotiable,
            },
          },
        }),
      },
      include: {
        salary: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(jobPosting)
  } catch (error) {
    console.error('Create job posting error:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A job posting with these details already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Database error occurred while creating job posting' },
      { status: 500 }
    )
  }
} 