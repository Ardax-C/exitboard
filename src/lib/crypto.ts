import { webcrypto } from 'crypto'

// Use a constant key for encryption/decryption
const ENCRYPTION_KEY = 'exitboard-encryption-key-2024'

// Helper function to convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof window === 'undefined') {
    return Buffer.from(new Uint8Array(buffer)).toString('base64')
  }
  const bytes = new Uint8Array(buffer)
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
  return btoa(binary)
}

// Client-side encryption function
export async function encryptData(data: string): Promise<{ encrypted: string; iv: string }> {
  // Generate key using PBKDF2
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    stringToUint8Array(ENCRYPTION_KEY),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: stringToUint8Array('exitboard-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )

  // Generate IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  // Encrypt the data
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    derivedKey,
    stringToUint8Array(data)
  )

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer)
  }
} 