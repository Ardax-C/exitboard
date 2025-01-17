import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/server'

const prisma = new PrismaClient()

// Get a single job posting
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: params.id },
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

    if (!jobPosting) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(jobPosting)
  } catch (error) {
    console.error('Get job posting error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// Update a job posting
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if the job posting exists and belongs to the user
    const existingJob = await prisma.jobPosting.findUnique({
      where: { id: params.id },
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      )
    }

    if (existingJob.authorId !== payload.userId) {
      return NextResponse.json(
        { error: 'Not authorized to update this job posting' },
        { status: 403 }
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
      status,
    } = await request.json()

    // Update job posting
    const updatedJob = await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(company && { company }),
        ...(companyDescription && { companyDescription }),
        ...(companyWebsite && { companyWebsite }),
        ...(companySize && { companySize }),
        ...(companyIndustry && { companyIndustry }),
        ...(location && { location }),
        ...(type && { type }),
        ...(level && { level }),
        ...(employmentType && { employmentType }),
        ...(workplaceType && { workplaceType }),
        ...(description && { description }),
        ...(responsibilities && {
          responsibilities: Array.isArray(responsibilities)
            ? responsibilities
            : responsibilities.split('\n').filter(Boolean),
        }),
        ...(requirements && {
          requirements: Array.isArray(requirements)
            ? requirements
            : requirements.split('\n').filter(Boolean),
        }),
        ...(preferredQualifications && {
          preferredQualifications: Array.isArray(preferredQualifications)
            ? preferredQualifications
            : preferredQualifications.split('\n').filter(Boolean),
        }),
        ...(skills && {
          skills: Array.isArray(skills)
            ? skills
            : skills.split('\n').filter(Boolean),
        }),
        ...(benefits && {
          benefits: Array.isArray(benefits)
            ? benefits
            : benefits.split('\n').filter(Boolean),
        }),
        ...(applicationDeadline && { applicationDeadline }),
        ...(startDate && { startDate }),
        ...(contactEmail && { contactEmail }),
        ...(contactPhone && { contactPhone }),
        ...(applicationUrl && { applicationUrl }),
        ...(applicationInstructions && { applicationInstructions }),
        ...(status && { status }),
        ...(salary && {
          salary: {
            upsert: {
              create: {
                min: parseFloat(salary.min),
                max: parseFloat(salary.max),
                currency: salary.currency,
                period: salary.period,
                isNegotiable: salary.isNegotiable,
              },
              update: {
                min: parseFloat(salary.min),
                max: parseFloat(salary.max),
                currency: salary.currency,
                period: salary.period,
                isNegotiable: salary.isNegotiable,
              },
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

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Update job posting error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// Delete a job posting
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if the job posting exists and belongs to the user
    const existingJob = await prisma.jobPosting.findUnique({
      where: { id: params.id },
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      )
    }

    if (existingJob.authorId !== payload.userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this job posting' },
        { status: 403 }
      )
    }

    // Delete the job posting and its associated salary
    await prisma.$transaction([
      prisma.salary.deleteMany({
        where: { jobPostingId: params.id },
      }),
      prisma.jobPosting.delete({
        where: { id: params.id },
      }),
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Delete job posting error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
} 