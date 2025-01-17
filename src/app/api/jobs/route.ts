import { NextResponse } from 'next/server'
import { JobType, JobLevel, PostingStatus, Prisma, EmploymentType, WorkplaceType, SalaryPeriod } from '@prisma/client'
import { verifyToken } from '@/lib/auth/server'
import prisma from '@/lib/prisma'

// Validate job type
function isValidJobType(type: string): type is JobType {
  return Object.values(JobType).includes(type as JobType)
}

// Validate job level
function isValidJobLevel(level: string): level is JobLevel {
  return Object.values(JobLevel).includes(level as JobLevel)
}

// Validate employment type
function isValidEmploymentType(type: string | undefined): type is EmploymentType {
  return type === undefined || Object.values(EmploymentType).includes(type as EmploymentType)
}

// Validate workplace type
function isValidWorkplaceType(type: string | undefined): type is WorkplaceType {
  return type === undefined || Object.values(WorkplaceType).includes(type as WorkplaceType)
}

// Validate salary period
function isValidSalaryPeriod(period: string): period is SalaryPeriod {
  return Object.values(SalaryPeriod).includes(period as SalaryPeriod)
}

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
        { error: 'Missing required fields: title, company, location, type, level, description, and contactEmail are required' },
        { status: 400 }
      )
    }

    // Validate job type
    if (!isValidJobType(type)) {
      return NextResponse.json(
        { error: `Invalid job type. Must be one of: ${Object.values(JobType).join(', ')}` },
        { status: 400 }
      )
    }

    // Validate job level
    if (!isValidJobLevel(level)) {
      return NextResponse.json(
        { error: `Invalid job level. Must be one of: ${Object.values(JobLevel).join(', ')}` },
        { status: 400 }
      )
    }

    // Validate employment type if provided
    if (employmentType && !isValidEmploymentType(employmentType)) {
      return NextResponse.json(
        { error: `Invalid employment type. Must be one of: ${Object.values(EmploymentType).join(', ')}` },
        { status: 400 }
      )
    }

    // Validate workplace type if provided
    if (workplaceType && !isValidWorkplaceType(workplaceType)) {
      return NextResponse.json(
        { error: `Invalid workplace type. Must be one of: ${Object.values(WorkplaceType).join(', ')}` },
        { status: 400 }
      )
    }

    // Validate salary if provided
    if (salary) {
      if (!salary.min || !salary.max || !salary.currency || !salary.period) {
        return NextResponse.json(
          { error: 'Salary must include min, max, currency, and period' },
          { status: 400 }
        )
      }

      if (isNaN(parseFloat(salary.min)) || isNaN(parseFloat(salary.max))) {
        return NextResponse.json(
          { error: 'Salary min and max must be valid numbers' },
          { status: 400 }
        )
      }

      if (!isValidSalaryPeriod(salary.period)) {
        return NextResponse.json(
          { error: `Invalid salary period. Must be one of: ${Object.values(SalaryPeriod).join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Validate dates if provided
    if (applicationDeadline && isNaN(Date.parse(applicationDeadline))) {
      return NextResponse.json(
        { error: 'Invalid application deadline date' },
        { status: 400 }
      )
    }

    if (startDate && isNaN(Date.parse(startDate))) {
      return NextResponse.json(
        { error: 'Invalid start date' },
        { status: 400 }
      )
    }

    // Ensure arrays are properly formatted
    const formatArray = (input: string | string[] | undefined): string[] => {
      if (!input) return []
      if (Array.isArray(input)) return input.filter(Boolean)
      return input.split('\n').filter(Boolean)
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
        responsibilities: formatArray(responsibilities),
        requirements: formatArray(requirements),
        preferredQualifications: formatArray(preferredQualifications),
        skills: formatArray(skills),
        benefits: formatArray(benefits),
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A job posting with these details already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Database error occurred while creating job posting' },
      { status: 500 }
    )
  }
} 