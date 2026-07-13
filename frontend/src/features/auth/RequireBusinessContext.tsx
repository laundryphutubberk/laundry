import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

import { getAuthSession, hasBusinessContext } from './authSession'

export function RequireBusinessContext({ children }: { children: ReactNode }) {
  const session = getAuthSession()
  if (!session) return <Navigate to="/login" replace />
  if (!hasBusinessContext(session)) return <Navigate to="/onboarding" replace />
  return children
}
