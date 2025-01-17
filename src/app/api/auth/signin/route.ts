import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input without revealing which field is missing
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Find user - don't log email attempts
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        name: true,
        email: true,
        company: true,
        title: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    )

    // Return user data (excluding password) and token
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    // Don't expose internal errors
    if (error instanceof Error) {
      console.error('Signin error:', {
        name: error.name,
        // Don't log the full error message as it might contain sensitive data
      })
    }
    
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
} 