import { createBrowserRouter } from 'react-router-dom'

import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { laundryWorkRoutes } from './laundryWorkRoutes'
import { AuthLanding } from '../features/auth/AuthLanding'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLanding />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  ...laundryWorkRoutes,
])
