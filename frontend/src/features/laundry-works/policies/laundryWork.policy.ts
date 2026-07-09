import type { LaundryWorkDetailDTO, WorkspaceType } from '../api/laundryWorkApi'

export type LaundryWorkWorkspaceScope = {
  workspaceType: WorkspaceType
  resortId?: string | number
  role?: string
}

export type LaundryWorkPolicyInput = {
  workId?: string | number
  detail?: LaundryWorkDetailDTO | null
  workspaceScope: LaundryWorkWorkspaceScope
  loading?: boolean
  error?: string | null
}

export type LaundryWorkPolicyAction = {
  label: string
  allowed: boolean
  disabled?: boolean
  reasonCode?: string
  message?: string
}

export type LaundryWorkPolicyActionModel = {
  work: {
    back: LaundryWorkPolicyAction
    saveDraft: LaundryWorkPolicyAction
    continue: LaundryWorkPolicyAction
  }
  issue: {
    createIssue: LaundryWorkPolicyAction
  }
  image: {
    uploadImage: LaundryWorkPolicyAction
  }
}

const allow = (label: string): LaundryWorkPolicyAction => ({
  label,
  allowed: true,
})

const deny = (label: string, reasonCode: string, message: string): LaundryWorkPolicyAction => ({
  label,
  allowed: false,
  disabled: true,
  reasonCode,
  message,
})

export function getLaundryWorkActionModel({
  workId,
  detail,
  workspaceScope,
  loading = false,
  error = null,
}: LaundryWorkPolicyInput): LaundryWorkPolicyActionModel {
  const missingWorkspace = !workspaceScope?.workspaceType
  const missingResortScope = workspaceScope?.workspaceType === 'RESORT' && !workspaceScope.resortId
  const missingWork = !workId || !detail?.work
  const busyOrErrored = loading || Boolean(error)
  const terminalWork = ['CLOSED', 'CANCELLED'].includes(detail?.work.currentStatus || '')

  const boundaryDenyReason = missingWorkspace
    ? ['MISSING_WORKSPACE_SCOPE', 'Missing workspace scope.']
    : missingResortScope
      ? ['MISSING_RESORT_SCOPE', 'Missing resort scope.']
      : missingWork
        ? ['MISSING_WORK_ID', 'Missing Laundry Work detail.']
        : busyOrErrored
          ? ['DETAIL_NOT_READY', 'Laundry Work detail is not ready.']
          : terminalWork
            ? ['TERMINAL_WORK', 'Laundry Work is terminal.']
            : null

  const canMutate = !boundaryDenyReason

  return {
    work: {
      back: allow('ย้อนกลับ'),
      saveDraft: canMutate
        ? allow('บันทึกชั่วคราว')
        : deny('บันทึกชั่วคราว', boundaryDenyReason?.[0] || 'ACTION_NOT_ALLOWED', boundaryDenyReason?.[1] || 'Action is not allowed.'),
      continue: canMutate
        ? allow('ดำเนินการขั้นตอนถัดไป')
        : deny('ดำเนินการขั้นตอนถัดไป', boundaryDenyReason?.[0] || 'ACTION_NOT_ALLOWED', boundaryDenyReason?.[1] || 'Action is not allowed.'),
    },
    issue: {
      createIssue: canMutate
        ? allow('เพิ่มปัญหา')
        : deny('เพิ่มปัญหา', boundaryDenyReason?.[0] || 'ACTION_NOT_ALLOWED', boundaryDenyReason?.[1] || 'Action is not allowed.'),
    },
    image: {
      uploadImage: canMutate
        ? allow('เพิ่มรูป')
        : deny('เพิ่มรูป', boundaryDenyReason?.[0] || 'ACTION_NOT_ALLOWED', boundaryDenyReason?.[1] || 'Action is not allowed.'),
    },
  }
}
