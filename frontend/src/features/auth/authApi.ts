import { saveAuthSession, type AuthSession } from './authSession'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export type LoginInput = {
  email: string
  password: string
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const envelope = await response.json().catch(() => ({}))

  if (!response.ok || envelope.success === false) {
    throw new Error(envelope.error?.message || response.statusText || 'Login failed')
  }

  const session = envelope.data as AuthSession
  saveAuthSession(session)

  return session
}
