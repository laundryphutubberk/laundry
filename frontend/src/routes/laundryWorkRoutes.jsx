import { Navigate } from 'react-router-dom'

import { LaundryWorkspaceLayout } from '../layouts/LaundryWorkspaceLayout'
import { LaundryWorkCreatePage } from '../features/laundry-works/pages/LaundryWorkCreatePage'
import { LaundryWorkListPage } from '../features/laundry-works/pages/LaundryWorkListPage'
import { LaundryWorkDetailPage } from '../features/laundry-works/pages/LaundryWorkDetailPage'
import { ResortListPage } from '../features/resorts/ResortListPage'

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
        path: 'works/new',
        element: <LaundryWorkCreatePage />,
      },
      {
        path: 'works/:workId',
        element: <LaundryWorkDetailPage />,
      },
      {
        path: 'resorts',
        element: <ResortListPage />,
      },
    ],
  },
]
