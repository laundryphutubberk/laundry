import { Navigate } from 'react-router-dom'

import { LaundryWorkspaceLayout } from '../layouts/LaundryWorkspaceLayout'
import { LaundryWorkDetailPage } from '../features/laundry-works/pages/LaundryWorkDetailPage'

export const laundryWorkRoutes = [
  {
    path: '/workspace/laundry',
    element: <LaundryWorkspaceLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="works" replace />,
      },
      {
        path: 'works',
        element: <LaundryWorkDetailPage />,
      },
      {
        path: 'works/:workId',
        element: <LaundryWorkDetailPage />,
      },
    ],
  },
  {
    path: '/laundry/works/:workId',
    element: <Navigate to="/workspace/laundry/works/:workId" replace />,
  },
]
