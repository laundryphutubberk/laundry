import type { LaundryWorkWorkspaceScope } from './laundryWork.store'

export type LaundryWorkPolicyInput = {
  work?: {
    id?: string | number
    currentStatus?: string
    resortId?: number
  } | null
  workspaceScope: LaundryWorkWorkspaceScope
  loading?: boolean
  error?: string | null
}

export type LaundryWorkPolicyAction = {
  label: string
  disabled?: boolean
  reasonCode?: string
}

export type LaundryWorkPolicyActionModel = {
  work: {
    back: LaundryWorkPolicyAction
    saveDraft?: LaundryWorkPolicyAction
    continue?: LaundryWorkPolicyAction
  }
  issue: {
    createIssue?: LaundryWorkPolicyAction
  }
  image: {
    uploadImage?: LaundryWorkPolicyAction
    viewAll?: LaundryWorkPolicyAction
  }
}

function isTerminalStatus(status?: string) {
  return status === 'CLOSED' || status === 'CANCELLED'
}

function hasWorkspaceAccess(input: LaundryWorkPolicyInput) {
  const { work, workspaceScope } = input

  if (workspaceScope.workspaceType === 'RESORT') {
    return Boolean(work?.resortId && workspaceScope.resortId && work.resortId === workspaceScope.resortId)
  }

  return workspaceScope.workspaceType === 'LAUNDRY'
}

export function getLaundryWorkActionModel(input: LaundryWorkPolicyInput): LaundryWorkPolicyActionModel {
  const disabledByLoading = Boolean(input.loading)
  const disabledByError = Boolean(input.error)
  const missingWork = !input.work?.id
  const terminalWork = isTerminalStatus(input.work?.currentStatus)
  const workspaceAllowed = hasWorkspaceAccess(input)
  const mutationDisabled = disabledByLoading || disabledByError || missingWork || terminalWork || !workspaceAllowed

  const mutationReason = !workspaceAllowed
    ? 'RESORT_SCOPE_MISMATCH'
    : missingWork
      ? 'MISSING_WORK_ID'
      : terminalWork
        ? 'TERMINAL_WORK'
        : disabledByError
          ? 'BACKEND_CONTRACT_REQUIRED'
          : undefined

  return {
    work: {
      back: { label: 'ย้อนกลับ', disabled: disabledByLoading },
      saveDraft: { label: 'บันทึกชั่วคราว', disabled: mutationDisabled, reasonCode: mutationReason },
      continue: { label: 'ดำเนินการขั้นตอนถัดไป', disabled: mutationDisabled, reasonCode: mutationReason },
    },
    issue: {
      createIssue: { label: 'เพิ่มปัญหา', disabled: mutationDisabled, reasonCode: mutationReason },
    },
    image: {
      uploadImage: { label: 'เพิ่มรูป', disabled: mutationDisabled, reasonCode: mutationReason },
      viewAll: { label: 'ดูทั้งหมด', disabled: disabledByLoading || missingWork },
    },
  }
}
