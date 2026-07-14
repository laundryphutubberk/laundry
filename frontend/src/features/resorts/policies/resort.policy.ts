const MANAGEMENT_ROLES = new Set(['LAUNDRY_OWNER', 'LAUNDRY_MANAGER'])

export function canManageResorts(role?: string | null, workspaceType?: string | null) {
  return workspaceType === 'LAUNDRY' && MANAGEMENT_ROLES.has(role || '')
}
