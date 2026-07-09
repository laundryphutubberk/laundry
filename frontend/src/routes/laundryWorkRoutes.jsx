import { Navigate } from 'react-router-dom'

import { LaundryWorkspaceLayout } from '../layouts/LaundryWorkspaceLayout'
import { LaundryWorkListPage } from '../features/laundry-works/pages/LaundryWorkListPage'
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
        element: <LaundryWorkListPage />,
      },
      {
        path: 'works/:workId',
        element: <LaundryWorkDetailPage />,
      },
    ],
  },
]
