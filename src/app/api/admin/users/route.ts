import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify the token and user status
    const token = authHeader.substring(7);
    const authResult = await verifyAuth(token);

    if (!authResult.isValid || !authResult.user) {
      return new NextResponse(authResult.error || 'Unauthorized', { status: 401 });
    }

    if (authResult.user.role !== UserRole.ADMIN) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        title: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in admin users route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PATCH /api/admin/users/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify the token and user status
    const token = authHeader.substring(7);
    const authResult = await verifyAuth(token);

    if (!authResult.isValid || !authResult.user) {
      return new NextResponse(authResult.error || 'Unauthorized', { status: 401 });
    }

    if (authResult.user.role !== UserRole.ADMIN) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !Object.values(UserRole).includes(role)) {
      return new NextResponse('Invalid role', { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role: role as UserRole },
      select: {
        id: true,
        name: true,
        email: true,
        title: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 