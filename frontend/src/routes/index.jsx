import { Navigate, createBrowserRouter } from 'react-router-dom'

import { LoginPage } from '../features/auth/LoginPage'
import { laundryWorkRoutes } from './laundryWorkRoutes'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  ...laundryWorkRoutes,
])
