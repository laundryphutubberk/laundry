import type { WorkspaceType } from '../api/laundryWorkApi'

export type LaundryImagePolicyInput = {
  workspaceType?: WorkspaceType
  role?: string
  workStatus?: string
  loading?: boolean
}

export type LaundryImagePolicy = {
  canView: boolean
  canRegister: boolean
  canEditCaption: boolean
  canSetCover: boolean
  canSoftDelete: boolean
  reason?: string
}

export function getLaundryImagePolicy({ workspaceType, role, workStatus, loading = false }: LaundryImagePolicyInput): LaundryImagePolicy {
  if (loading) {
    return { canView: true, canRegister: false, canEditCaption: false, canSetCover: false, canSoftDelete: false, reason: 'Laundry Image runtime is loading.' }
  }

  const canMutateWorkspace = workspaceType === 'LAUNDRY'
  const canMutateRole = ['LAUNDRY_OWNER', 'LAUNDRY_MANAGER', 'LAUNDRY_STAFF'].includes(role || '')
  const terminal = ['CLOSED', 'CANCELLED'].includes(workStatus || '')
  const canMutate = canMutateWorkspace && canMutateRole && !terminal

  return {
    canView: Boolean(workspaceType),
    canRegister: canMutate,
    canEditCaption: canMutate,
    canSetCover: canMutate,
    canSoftDelete: canMutate,
    reason: canMutate
      ? undefined
      : terminal
        ? 'Terminal Laundry Work cannot change image evidence.'
        : !canMutateWorkspace
          ? 'Laundry workspace is required to change image evidence.'
          : 'Laundry staff permission is required to change image evidence.',
  }
}
