import { Navigate } from 'react-router-dom'

import { getAuthSession } from './authSession'

export function AuthLanding() {
  return <Navigate to={getAuthSession() ? '/workspace/laundry/works' : '/login'} replace />
}
