export type AuthSessionActor = {
  userId?: number | string
  role?: string
  workspaceType?: 'LAUNDRY' | 'RESORT'
  resortId?: number
  active?: boolean
}

export type AuthSessionUser = {
  id: number | string
  email: string
  displayName?: string | null
  role: string
  workspaceType: 'LAUNDRY' | 'RESORT'
  resortId?: number | null
  active: boolean
}

export type AuthSession = {
  token: string
  actor: AuthSessionActor
  user: AuthSessionUser
}

const TOKEN_KEY = 'laundry.auth.token'
const SESSION_KEY = 'laundry.auth.session'

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(TOKEN_KEY, session.token)
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(SESSION_KEY)
}

export function getAuthToken() {
  return window.localStorage.getItem(TOKEN_KEY) || undefined
}

export function hasUnexpiredAuthToken() {
  const token = getAuthToken()
  if (!token) return false

  try {
    const encodedPayload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')
    const payload = JSON.parse(window.atob(paddedPayload)) as { exp?: number }
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now()
  } catch (_error) {
    return false
  }
}

export function getAuthSession(): AuthSession | null {
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthSession
  } catch (_error) {
    clearAuthSession()
    return null
  }
}

export function getWorkspaceContext() {
  const session = getAuthSession()
  const token = getAuthToken()

  return {
    token,
    actorId: session?.actor?.userId || session?.user?.id,
    actorRole: session?.actor?.role || session?.user?.role,
    workspaceType: session?.actor?.workspaceType || session?.user?.workspaceType,
    resortId: session?.actor?.resortId || session?.user?.resortId || undefined,
  }
}
