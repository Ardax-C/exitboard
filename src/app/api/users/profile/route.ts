import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)

    const { name, email, company, title } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser && existingUser.id !== payload.userId) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name,
        email,
        company,
        title,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    )
  }
} 