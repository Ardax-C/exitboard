import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { webcrypto } from 'crypto'

// Encryption helper function
async function encryptResponse(data: any, key: string) {
  // Convert string to ArrayBuffer
  function stringToArrayBuffer(str: string) {
    return new TextEncoder().encode(str).buffer;
  }

  // Convert ArrayBuffer to base64
  function arrayBufferToBase64(buffer: ArrayBuffer) {
    return Buffer.from(buffer).toString('base64');
  }

  // Derive key using PBKDF2
  const keyMaterial = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const derivedKey = await webcrypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('exitboard-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Generate IV
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const authTag = webcrypto.getRandomValues(new Uint8Array(16));

  // Encrypt the data
  const encrypted = await webcrypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      additionalData: authTag
    },
    derivedKey,
    stringToArrayBuffer(JSON.stringify(data))
  );

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
    authTag: arrayBufferToBase64(authTag)
  };
}

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

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user

    // Encrypt sensitive response data
    const encryptedResponse = await encryptResponse(
      {
        user: userWithoutPassword,
        token
      },
      process.env.JWT_SECRET || 'fallback-secret-key'
    )

    return NextResponse.json(encryptedResponse)
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