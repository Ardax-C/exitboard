import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { webcrypto } from 'crypto'
import { AccountStatus } from '@prisma/client'

// Use a constant key for encryption/decryption
const ENCRYPTION_KEY = 'exitboard-encryption-key-2024'

// Helper function to convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = Buffer.from(base64, 'base64');
  return new Uint8Array(binaryString);
}

// Decryption helper function for requests
async function decryptRequest(encrypted: { encrypted: string; iv: string }): Promise<string> {
  // Derive key using PBKDF2
  const keyMaterial = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ENCRYPTION_KEY),
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
    ['decrypt']
  );

  // Decrypt the data
  const decrypted = await webcrypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToUint8Array(encrypted.iv)
    },
    derivedKey,
    base64ToUint8Array(encrypted.encrypted)
  );

  return new TextDecoder().decode(decrypted);
}

// Encryption helper function
async function encryptResponse(data: any) {
  // Convert string to Uint8Array
  function stringToUint8Array(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  // Convert ArrayBuffer to base64
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    return Buffer.from(new Uint8Array(buffer)).toString('base64');
  }

  // Derive key using PBKDF2
  const keyMaterial = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ENCRYPTION_KEY),
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

  // Encrypt the data
  const dataToEncrypt = stringToUint8Array(JSON.stringify(data));
  const encrypted = await webcrypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    derivedKey,
    dataToEncrypt
  );

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer)
  };
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input without revealing which field is missing
    if (!email || !password || !password.encrypted || !password.iv) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Decrypt password
    const decryptedPassword = await decryptRequest(password)

    // Find user - don't log email attempts
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        name: true,
        email: true,
        company: true,
        title: true,
        role: true,
        status: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if account is deactivated
    if (user.status === AccountStatus.DEACTIVATED) {
      return NextResponse.json(
        { error: 'Account has been deactivated' },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(decryptedPassword, user.password)

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
    const encryptedResponse = await encryptResponse({
      user: userWithoutPassword,
      token
    })

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