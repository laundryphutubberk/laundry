import { saveAuthSession, type AuthSession } from './authSession'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  password: string
  displayName?: string
  role?: 'LAUNDRY_OWNER' | 'LAUNDRY_MANAGER' | 'LAUNDRY_STAFF' | 'RESORT_OWNER' | 'RESORT_STAFF'
  workspaceType?: 'LAUNDRY' | 'RESORT'
  resortId?: number
}

async function submitAuth(path: string, input: LoginInput | RegisterInput, fallbackMessage: string): Promise<AuthSession> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const envelope = await response.json().catch(() => ({}))

  if (!response.ok || envelope.success === false) {
    throw new Error(envelope.error?.message || response.statusText || fallbackMessage)
  }

  const session = envelope.data as AuthSession
  saveAuthSession(session)

  return session
}

export async function login(input: LoginInput): Promise<AuthSession> {
  return submitAuth('/auth/login', input, 'Login failed')
}

export async function register(input: RegisterInput): Promise<AuthSession> {
  return submitAuth('/auth/register', input, 'Registration failed')
}
