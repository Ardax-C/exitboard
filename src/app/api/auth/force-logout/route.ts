import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const adminToken = authHeader.substring(7);
    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET || 'fallback-secret-key') as { userId: string };

    // Verify admin user
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!adminUser || adminUser.role !== UserRole.ADMIN) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get target user ID from request body
    const { userId } = await request.json();
    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Add the token to the blacklist in Redis or database
    // For now, we'll use a simple timestamp-based invalidation
    const timestamp = Date.now();
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenInvalidatedAt: new Date(timestamp)
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Force logout error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 