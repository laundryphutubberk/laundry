export function canManageItemCatalog(role?: string, workspaceType?: string) {
  return workspaceType === 'LAUNDRY' && ['LAUNDRY_OWNER', 'LAUNDRY_MANAGER'].includes(role || '')
}
