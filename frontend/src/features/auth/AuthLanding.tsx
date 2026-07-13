import { Navigate } from 'react-router-dom'

import { getAuthenticatedDestination, getAuthSession } from './authSession'

export function AuthLanding() {
  const session = getAuthSession()
  return <Navigate to={session ? getAuthenticatedDestination(session) : '/login'} replace />
}
