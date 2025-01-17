import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { name, email, password, company } = await request.json()

    // Validate input without revealing specific missing fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required information' },
        { status: 400 }
      )
    }

    // Check if user already exists - don't reveal if the email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Unable to create account' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        company,
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        title: true,
      }
    })

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      user,
      token,
    })
  } catch (error) {
    // Don't expose internal errors
    if (error instanceof Error) {
      console.error('Signup error:', {
        name: error.name,
        // Don't log the full error message as it might contain sensitive data
      })
    }

    // Generic error message that doesn't reveal system details
    return NextResponse.json(
      { error: 'Unable to create account' },
      { status: 500 }
    )
  }
} 