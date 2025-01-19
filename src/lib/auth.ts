import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import { UserRole, AccountStatus } from '@prisma/client';
import { webcrypto } from 'crypto'
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  email: string;
  name: string;
  title?: string;
  company?: string;
  role: UserRole;
  createdAt: Date;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-credentials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const user = await response.json();
          return user;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-do-not-use-in-production',
}; 

// Auth utility functions
export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    // Set in localStorage
    localStorage.setItem('token', token)
    
    // Set cookie with proper attributes
    document.cookie = `token=${token}; path=/; max-age=604800; secure; samesite=strict`
  }
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null
  
  // Try localStorage first
  const token = localStorage.getItem('token')
  if (token) return token
  
  // Fallback to cookie
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(c => c.trim().startsWith('token='))
  return tokenCookie ? tokenCookie.split('=')[1].trim() : null
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.removeItem('token')
    
    // Clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict'
  }
}

// Helper function to add auth headers to fetch requests
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// Check if the current session is still valid
async function checkSession() {
  try {
    const response = await fetch('/api/auth/session', {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      // Session is invalid - clear auth and redirect
      removeAuthToken();
      window.location.href = '/auth/signin?error=session-expired';
      throw new Error('Session expired');
    }
    return true;
  } catch (error) {
    removeAuthToken();
    window.location.href = '/auth/signin?error=session-expired';
    throw error;
  }
}

let sessionCheckPromise: Promise<boolean> | null = null;

// Debounced session check to prevent multiple simultaneous checks
async function debouncedSessionCheck() {
  if (!sessionCheckPromise) {
    sessionCheckPromise = checkSession().finally(() => {
      sessionCheckPromise = null;
    });
  }
  return sessionCheckPromise;
}

// Start periodic session check
if (typeof window !== 'undefined') {
  // Check session every 15 seconds
  setInterval(debouncedSessionCheck, 15000);
  
  // Check when tab becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && getAuthToken()) {
      debouncedSessionCheck();
    }
  });

  // Check on route changes
  window.addEventListener('popstate', () => {
    if (getAuthToken()) {
      debouncedSessionCheck();
    }
  });
}

// Update fetchWithAuth to always check session first
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  // Check session before making the request
  try {
    await debouncedSessionCheck();
  } catch (error) {
    // checkSession will handle the redirect
    throw new Error('Session expired');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    window.location.href = '/auth/signin?error=session-expired';
    throw new Error('Session expired');
  }

  return response;
}

// Helper function to convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof window === 'undefined') {
    return Buffer.from(base64, 'base64');
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Client-side decryption function
async function decryptResponse(data: { encrypted: string; iv: string }): Promise<any> {
  const ENCRYPTION_KEY = 'exitboard-encryption-key-2024'

  // Generate key using PBKDF2
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ENCRYPTION_KEY),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  const derivedKey = await window.crypto.subtle.deriveKey(
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
  )

  // Decrypt the data
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToUint8Array(data.iv)
    },
    derivedKey,
    base64ToUint8Array(data.encrypted)
  )

  return JSON.parse(new TextDecoder().decode(decrypted))
}

export async function signIn(data: { 
  email: string; 
  password: { encrypted: string; iv: string }; 
}) {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign in');
  }

  const encryptedData = await response.json();
  return decryptResponse(encryptedData);
}

export async function signUp(data: {
  name: string;
  email: string;
  password: { encrypted: string; iv: string };
  company?: string;
}) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign up');
  }

  return response.json();
}

export async function getCurrentUser() {
  try {
    const response = await fetchWithAuth('/api/auth/me');
    if (!response.ok) {
      removeAuthToken();
      return null;
    }
    return response.json();
  } catch (error) {
    removeAuthToken();
    return null;
  }
}

export async function updateProfile(data: {
  name: string;
  email: string;
  company?: string;
  title?: string;
}) {
  const response = await fetchWithAuth('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }

  return response.json();
}

export async function deleteAccount() {
  const response = await fetchWithAuth('/api/users/delete', {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete account');
  }

  removeAuthToken();
}

export async function verifyAuth(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        status: true,
        tokenInvalidatedAt: true,
      },
    });

    if (!user) {
      return { isValid: false, error: 'User not found' };
    }

    if (user.status === AccountStatus.DEACTIVATED) {
      return { isValid: false, error: 'Account deactivated' };
    }

    if (user.tokenInvalidatedAt) {
      const tokenIssuedAt = new Date((decoded as any).iat * 1000);
      if (tokenIssuedAt < user.tokenInvalidatedAt) {
        return { isValid: false, error: 'Session expired' };
      }
    }

    return { isValid: true, user };
  } catch (error) {
    return { isValid: false, error: 'Invalid token' };
  }
} 