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
  console.log('Validating salary period:', {
    period,
    validPeriods: Object.values(SalaryPeriod),
    isValid: Object.values(SalaryPeriod).includes(period as SalaryPeriod)
  })
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
    console.log('Job posting request received')
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)

    if (!payload || typeof payload.userId !== 'string') {
      console.error('Invalid token payload:', payload)
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const data = await request.json()
    console.log('Received job posting data:', {
      ...data,
      // Exclude sensitive fields from logging
      authorId: undefined,
      contactEmail: undefined,
      contactPhone: undefined
    })

    // Validate required fields
    if (!data.title || !data.company || !data.location || !data.type || 
        !data.level || !data.description || !data.contactEmail) {
      console.error('Missing required fields:', {
        title: !data.title,
        company: !data.company,
        location: !data.location,
        type: !data.type,
        level: !data.level,
        description: !data.description,
        contactEmail: !data.contactEmail
      })
      return NextResponse.json(
        { error: 'Missing required fields: title, company, location, type, level, description, and contactEmail are required' },
        { status: 400 }
      )
    }

    // Validate job type
    if (!isValidJobType(data.type)) {
      console.error('Invalid job type:', data.type)
      return NextResponse.json(
        { error: `Invalid job type. Must be one of: ${Object.values(JobType).join(', ')}` },
        { status: 400 }
      )
    }

    // Validate job level
    if (!isValidJobLevel(data.level)) {
      console.error('Invalid job level:', data.level)
      return NextResponse.json(
        { error: `Invalid job level. Must be one of: ${Object.values(JobLevel).join(', ')}` },
        { status: 400 }
      )
    }

    // Validate employment type if provided
    if (data.employmentType && !isValidEmploymentType(data.employmentType)) {
      console.error('Invalid employment type:', data.employmentType)
      return NextResponse.json(
        { error: `Invalid employment type. Must be one of: ${Object.values(EmploymentType).join(', ')}` },
        { status: 400 }
      )
    }

    // Validate workplace type if provided
    if (data.workplaceType && !isValidWorkplaceType(data.workplaceType)) {
      console.error('Invalid workplace type:', data.workplaceType)
      return NextResponse.json(
        { error: `Invalid workplace type. Must be one of: ${Object.values(WorkplaceType).join(', ')}` },
        { status: 400 }
      )
    }

    // Validate salary if provided
    if (data.salary) {
      console.log('Validating salary data:', {
        ...data.salary,
        periodValid: isValidSalaryPeriod(data.salary.period)
      })
      if (!data.salary.min || !data.salary.max || !data.salary.currency || !data.salary.period) {
        console.error('Missing required salary fields')
        return NextResponse.json(
          { error: 'Salary must include min, max, currency, and period' },
          { status: 400 }
        )
      }

      if (isNaN(parseFloat(data.salary.min)) || isNaN(parseFloat(data.salary.max))) {
        console.error('Invalid salary numbers:', {
          min: data.salary.min,
          max: data.salary.max
        })
        return NextResponse.json(
          { error: 'Salary min and max must be valid numbers' },
          { status: 400 }
        )
      }

      if (!isValidSalaryPeriod(data.salary.period)) {
        console.error('Invalid salary period:', {
          received: data.salary.period,
          validValues: Object.values(SalaryPeriod)
        })
        return NextResponse.json(
          { error: `Invalid salary period. Must be one of: ${Object.values(SalaryPeriod).join(', ')}` },
          { status: 400 }
        )
      }

      if (parseFloat(data.salary.min) <= 0 || parseFloat(data.salary.max) <= 0 || 
          parseFloat(data.salary.min) > parseFloat(data.salary.max)) {
        console.error('Invalid salary range:', {
          min: parseFloat(data.salary.min),
          max: parseFloat(data.salary.max)
        })
        return NextResponse.json(
          { error: 'Invalid salary range. Min must be greater than 0 and less than or equal to max.' },
          { status: 400 }
        )
      }
    }

    // Format arrays properly
    const formatArray = (input: string | string[] | undefined): string[] => {
      if (!input) return []
      if (Array.isArray(input)) return input.filter(Boolean)
      return input.split('\n').filter(Boolean)
    }

    console.log('Creating job posting in database')
    // Create job posting with all fields
    const jobPosting = await prisma.jobPosting.create({
      data: {
        title: data.title,
        company: data.company,
        companyDescription: data.companyDescription,
        companyWebsite: data.companyWebsite,
        companySize: data.companySize,
        companyIndustry: data.companyIndustry,
        location: data.location,
        type: data.type as JobType,
        level: data.level as JobLevel,
        employmentType: data.employmentType as EmploymentType,
        workplaceType: data.workplaceType as WorkplaceType,
        description: data.description,
        responsibilities: formatArray(data.responsibilities),
        requirements: formatArray(data.requirements),
        preferredQualifications: formatArray(data.preferredQualifications),
        skills: formatArray(data.skills),
        benefits: formatArray(data.benefits),
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        applicationUrl: data.applicationUrl,
        applicationInstructions: data.applicationInstructions,
        authorId: payload.userId,
        status: 'ACTIVE',
        ...(data.salary && {
          salary: {
            create: {
              min: parseFloat(data.salary.min),
              max: parseFloat(data.salary.max),
              currency: data.salary.currency,
              period: data.salary.period as SalaryPeriod,
              isNegotiable: data.salary.isNegotiable ?? false,
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

    console.log('Job posting created successfully:', {
      id: jobPosting.id,
      title: jobPosting.title,
      company: jobPosting.company
    })
    return NextResponse.json(jobPosting)
  } catch (error) {
    console.error('Create job posting error:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code)
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