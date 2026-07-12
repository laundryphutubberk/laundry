import { clearAuthSession, getAuthToken, saveAuthSession, type AuthSession } from './authSession'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export type LoginInput = {
  email: string
  password: string
  rememberDevice?: boolean
  deviceLabel?: string
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
    credentials: 'include',
  })

  const envelope = await response.json().catch(() => ({}))

  if (!response.ok || envelope.success === false) {
    throw new Error(envelope.error?.message || response.statusText || fallbackMessage)
  }

  const session = envelope.data as AuthSession
  saveAuthSession(session)

  return session
}

export async function refreshSession(): Promise<AuthSession | null> {
  const response = await fetch(`${API_BASE_URL}/auth/session/refresh`, { method: 'POST', credentials: 'include' })
  if (!response.ok) {
    clearAuthSession()
    if (window.location.pathname.startsWith('/workspace/')) {
      const returnTo = `${window.location.pathname}${window.location.search}`
      window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`)
    }
    return null
  }
  const envelope = await response.json().catch(() => ({}))
  const session = envelope.data as AuthSession
  saveAuthSession(session)
  return session
}

export async function logoutCurrentDevice() {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
  } finally {
    clearAuthSession()
  }
}

let refreshPromise: Promise<AuthSession | null> | null = null
export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  const token = getAuthToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const request = () => fetch(input, { ...init, headers, credentials: 'include' })
  const response = await request()
  if (response.status !== 401) return response
  refreshPromise ||= refreshSession().finally(() => { refreshPromise = null })
  const session = await refreshPromise
  if (!session) return response
  headers.set('Authorization', `Bearer ${session.token}`)
  return request()
}

export async function login(input: LoginInput): Promise<AuthSession> {
  return submitAuth('/auth/login', input, 'Login failed')
}

export async function register(input: RegisterInput): Promise<AuthSession> {
  return submitAuth('/auth/register', input, 'Registration failed')
}
