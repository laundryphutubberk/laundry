import { Navigate } from 'react-router-dom'

import { LaundryWorkspaceLayout } from '../layouts/LaundryWorkspaceLayout'
import { LaundryWorkCreatePage } from '../features/laundry-works/pages/LaundryWorkCreatePage'
import { LaundryWorkListPage } from '../features/laundry-works/pages/LaundryWorkListPage'
import { LaundryWorkDetailPage } from '../features/laundry-works/pages/LaundryWorkDetailPage'
import { ResortListPage } from '../features/resorts/ResortListPage'
import { IdentityManagementPage } from '../features/auth/IdentityManagementPage'
import { RequireBusinessContext } from '../features/auth/RequireBusinessContext'

export const laundryWorkRoutes = [
  {
    path: '/workspace/laundry',
    element: <RequireBusinessContext><LaundryWorkspaceLayout /></RequireBusinessContext>,
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
      {
        path: 'security',
        element: <IdentityManagementPage />,
      },
    ],
  },
]
