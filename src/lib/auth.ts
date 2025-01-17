'use client'

import { useState, useEffect } from 'react'

interface User {
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
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to sign in')
  }

  return response.json()
}

export async function signUp(data: {
  name: string
  email: string
  password: string
  company?: string
}) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to sign up')
  }

  return response.json()
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