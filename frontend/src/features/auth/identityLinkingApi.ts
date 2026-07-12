import { authenticatedFetch } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export type SafeIdentity = { id: string; provider: 'GOOGLE'; email?: string | null; displayName?: string | null; avatarUrl?: string | null; linkedAt: string; lastUsedAt?: string | null; active: boolean }
export type LinkIntentSummary = { id: string; expiresAt: string; provider: 'GOOGLE'; email?: string | null; emailVerified: boolean; displayName?: string | null; avatarUrl?: string | null }
export type UnlinkIntentSummary = { id: string; identityId: string; expiresAt: string; stepUpRequired: boolean; purpose: 'UNLINK_IDENTITY' }

export class IdentityLinkingError extends Error {
  constructor(public code: string, message: string, public status: number) { super(message) }
}

async function command<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('Content-Type', 'application/json')
  const response = await authenticatedFetch(`${API_BASE_URL}${path}`, { ...init, headers })
  const envelope = await response.json().catch(() => ({}))
  if (!response.ok || envelope.success === false) throw new IdentityLinkingError(envelope.meta?.code || `HTTP_${response.status}`, envelope.error?.message || 'Identity request failed', response.status)
  return envelope.data as T
}

export const identityLinkingApi = {
  list: () => command<{ items: SafeIdentity[] }>('/auth/identities', { method: 'GET' }),
  createGoogleIntent: (idToken: string) => command<LinkIntentSummary>('/auth/identities/google/link-intents', { method: 'POST', body: JSON.stringify({ idToken }) }),
  confirmGoogleIntent: (intentId: string) => command<{ intentId: string; stepUpRequired: boolean; purpose: 'LINK_IDENTITY' }>(`/auth/identities/google/link-intents/${intentId}/confirm`, { method: 'POST' }),
  cancelGoogleIntent: (intentId: string) => command<{ cancelled: boolean }>(`/auth/identities/google/link-intents/${intentId}/cancel`, { method: 'POST' }),
  passwordStepUp: (password: string, purpose: 'LINK_IDENTITY' | 'UNLINK_IDENTITY', targetId: string) => command<{ grant: string; expiresAt: string }>('/auth/step-up/password', { method: 'POST', body: JSON.stringify({ password, purpose, targetId }) }),
  completeGoogleIntent: (intentId: string, grant: string) => command<SafeIdentity>(`/auth/identities/google/link-intents/${intentId}/complete`, { method: 'POST', body: JSON.stringify({ grant }) }),
  createUnlinkIntent: (identityId: string) => command<UnlinkIntentSummary>(`/auth/identities/${identityId}/unlink-intents`, { method: 'POST' }),
  completeUnlinkIntent: (intentId: string, grant: string) => command<SafeIdentity>(`/auth/identities/unlink-intents/${intentId}/complete`, { method: 'POST', body: JSON.stringify({ grant }) }),
}
