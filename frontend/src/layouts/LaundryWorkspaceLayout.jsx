import { Outlet } from 'react-router-dom'

import { LaundryWorkspaceShell } from '../features/laundry-works/components/LaundryWorkspaceShell'

export function LaundryWorkspaceLayout() {
  return (
    <LaundryWorkspaceShell>
      <Outlet />
    </LaundryWorkspaceShell>
  )
}
