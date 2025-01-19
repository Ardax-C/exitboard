import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import prisma from '@/lib/prisma';
import { AccountStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new NextResponse('Missing credentials', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    // Check if account is deactivated
    if (user.status === AccountStatus.DEACTIVATED) {
      return new NextResponse('Account has been deactivated', { status: 403 });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    console.error('Verify credentials error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 