'use client'

import { useState, useEffect } from 'react'

// Use a constant key for encryption/decryption
const ENCRYPTION_KEY = 'exitboard-encryption-key-2024'

export interface User {
  id: string
  name: string | null
  email: string
  company: string | null
  title: string | null
}

interface AuthState {
  user: User | null
  loading: boolean
}

// Helper function to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(new Uint8Array(buffer)).toString('base64');
}

// Encryption helper function for requests
async function encryptRequest(data: string) {
  try {
    // Derive key using PBKDF2
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(ENCRYPTION_KEY),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

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
      ['encrypt']
    );

    // Generate IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      derivedKey,
      new TextEncoder().encode(data)
    );

    return {
      encrypted: arrayBufferToBase64(encrypted),
      iv: arrayBufferToBase64(iv.buffer)
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

// Decryption helper function for responses
async function decryptResponse(encrypted: string, iv: string) {
  try {
    // Derive key using PBKDF2
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(ENCRYPTION_KEY),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

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
    );

    // Decrypt the data
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: base64ToArrayBuffer(iv)
      },
      derivedKey,
      base64ToArrayBuffer(encrypted)
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setAuthState({ user: null, loading: false })
          return
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const user = await response.json()
          setAuthState({ user, loading: false })
        } else {
          localStorage.removeItem('token')
          setAuthState({ user: null, loading: false })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setAuthState({ user: null, loading: false })
      }
    }

    fetchUser()
  }, [])

  return authState
}

export async function signIn(data: { email: string; password: string }) {
  // Encrypt password before sending
  const encryptedPassword = await encryptRequest(data.password);
  
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: data.email,
      password: encryptedPassword
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign in');
  }

  const { encrypted, iv } = await response.json();
  const decrypted = await decryptResponse(encrypted, iv);
  
  if (decrypted.token) {
    setAuthToken(decrypted.token);
  }
  
  return decrypted;
}

export async function signUp(data: {
  name: string;
  email: string;
  password: string;
  company?: string;
}) {
  // Encrypt password before sending
  const encryptedPassword = await encryptRequest(data.password);
  
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      password: encryptedPassword
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign up');
  }

  const { encrypted, iv } = await response.json();
  const decrypted = await decryptResponse(encrypted, iv);
  
  if (decrypted.token) {
    setAuthToken(decrypted.token);
  }
  
  return decrypted;
}

export function setAuthToken(token: string) {
  localStorage.setItem('token', token)
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function removeAuthToken() {
  localStorage.removeItem('token')
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getAuthToken()
  if (!token) return null

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      removeAuthToken()
      return null
    }

    return response.json()
  } catch (error) {
    removeAuthToken()
    return null
  }
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const response = await fetch('/api/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      return response.json()
    }
    return null
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

export async function deleteAccount(): Promise<void> {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch('/api/users/delete', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Failed to delete account')
  }

  localStorage.removeItem('token')
}

interface UpdateProfileData {
  name: string
  email: string
  company?: string
  title?: string
}

export async function updateProfile(data: UpdateProfileData): Promise<User> {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update profile')
  }

  return response.json()
} 