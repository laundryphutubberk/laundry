export type LaundryIssuePolicyInput = {
  workspaceType?: 'LAUNDRY' | 'RESORT'
  role?: string
  workStatus?: string
  loading?: boolean
}

export type LaundryIssuePolicy = {
  canCreate: boolean
  canUpdate: boolean
  canResolve: boolean
  reason?: string
}

export function getLaundryIssuePolicy({ workspaceType, role, workStatus, loading = false }: LaundryIssuePolicyInput): LaundryIssuePolicy {
  if (loading) {
    return { canCreate: false, canUpdate: false, canResolve: false, reason: 'Issue runtime is loading.' }
  }

  if (workspaceType !== 'LAUNDRY') {
    return { canCreate: false, canUpdate: false, canResolve: false, reason: 'Laundry workspace is required.' }
  }

  if (!['LAUNDRY_OWNER', 'LAUNDRY_MANAGER', 'LAUNDRY_STAFF'].includes(role || '')) {
    return { canCreate: false, canUpdate: false, canResolve: false, reason: 'Laundry staff permission is required.' }
  }

  if (['CLOSED', 'CANCELLED'].includes(workStatus || '')) {
    return { canCreate: false, canUpdate: false, canResolve: false, reason: 'Terminal Laundry Work cannot be changed.' }
  }

  return { canCreate: true, canUpdate: true, canResolve: true }
}
