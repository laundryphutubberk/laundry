import { Navigate, createBrowserRouter } from 'react-router-dom'

import { laundryWorkRoutes } from './laundryWorkRoutes'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/workspace/laundry/works" replace />,
  },
  ...laundryWorkRoutes,
])
