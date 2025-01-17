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

    // Encrypt sensitive response data
    const encryptedResponse = await encryptResponse(
      {
        user,
        token
      },
      process.env.JWT_SECRET || 'fallback-secret-key'
    )

    return NextResponse.json(encryptedResponse)
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