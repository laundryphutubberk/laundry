import type { LaundryWorkBackendCapability, LaundryWorkDetailDTO, WorkspaceType } from '../api/laundryWorkApi'

export type LaundryWorkWorkspaceScope = {
  workspaceType?: WorkspaceType
  resortId?: string | number
  role?: string
}

export type LaundryWorkPolicyInput = {
  workId?: string | number
  detail?: LaundryWorkDetailDTO | null
  workspaceScope: LaundryWorkWorkspaceScope
  loading?: boolean
  error?: string | null
  capability?: LaundryWorkBackendCapability
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

function getNextBackendStatus(currentStatus?: string) {
  const transitions: Record<string, string> = {
    DRAFT: 'BAG_RECEIVED',
    BAG_RECEIVED: 'FACTORY_RECEIVED',
    FACTORY_RECEIVED: 'BAG_OPENED',
    BAG_OPENED: 'ITEM_COUNTED',
    ITEM_COUNTED: 'TYPE_SORTED',
    TYPE_SORTED: 'COLOR_SORTED',
    COLOR_SORTED: 'DATA_RECORDED',
    DATA_RECORDED: 'RETURNED',
    RETURNED: 'CLOSED',
  }

  return transitions[currentStatus || '']
}

export function getLaundryWorkActionModel({
  workId,
  detail,
  workspaceScope,
  loading = false,
  error = null,
  capability,
}: LaundryWorkPolicyInput): LaundryWorkPolicyActionModel {
  const missingWorkspace = !workspaceScope?.workspaceType
  const missingResortScope = workspaceScope?.workspaceType === 'RESORT' && !workspaceScope.resortId
  const missingWork = !workId || !detail?.work
  const busyOrErrored = loading || Boolean(error)
  const terminalWork = ['CLOSED', 'CANCELLED'].includes(detail?.work.currentStatus || '')
  const backendStatusTransitionReady = Boolean(capability?.statusTransition)
  const nextBackendStatus = getNextBackendStatus(detail?.work.currentStatus)
  const canContinueByBackend = backendStatusTransitionReady && Boolean(nextBackendStatus)

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
  const continueAction = boundaryDenyReason
    ? deny('ดำเนินการขั้นตอนถัดไป', boundaryDenyReason[0], boundaryDenyReason[1])
    : canContinueByBackend
      ? allow('ดำเนินการขั้นตอนถัดไป')
      : deny(
          'ดำเนินการขั้นตอนถัดไป',
          'BACKEND_CONTRACT_REQUIRED',
          'Continue action requires a supported backend status transition command for the current status.',
        )

  return {
    work: {
      back: allow('ย้อนกลับ'),
      saveDraft: deny(
        'บันทึกชั่วคราว',
        'BACKEND_CONTRACT_REQUIRED',
        'Save Draft is disabled until a backend draft contract exists.',
      ),
      continue: continueAction,
    },
    issue: {
      createIssue:
        canMutate && capability?.issue.create
          ? allow('เพิ่มปัญหา')
          : deny(
              'เพิ่มปัญหา',
              capability?.issue.create ? boundaryDenyReason?.[0] || 'ACTION_NOT_ALLOWED' : 'BACKEND_CONTRACT_REQUIRED',
              capability?.issue.create
                ? boundaryDenyReason?.[1] || 'Action is not allowed.'
                : 'Issue creation endpoint is not available in backend contract.',
            ),
    },
    image: {
      uploadImage:
        canMutate && capability?.image.upload
          ? allow('เพิ่มรูป')
          : deny(
              'เพิ่มรูป',
              capability?.image.upload ? boundaryDenyReason?.[0] || 'ACTION_NOT_ALLOWED' : 'BACKEND_CONTRACT_REQUIRED',
              capability?.image.upload
                ? boundaryDenyReason?.[1] || 'Action is not allowed.'
                : 'Image upload endpoint is not available in backend contract.',
            ),
    },
  }
}
