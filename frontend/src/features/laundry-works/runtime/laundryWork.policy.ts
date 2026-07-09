import type { LaundryWorkWorkspaceScope } from '../state/laundryWork.store'

export type LaundryWorkActionKey =
  | 'back'
  | 'saveDraft'
  | 'continue'
  | 'createIssue'
  | 'uploadImage'
  | 'viewImages'
  | 'refresh'

export type LaundryWorkPolicyContext = {
  actionKey: LaundryWorkActionKey
  work?: {
    id?: number | string
    resortId?: number
    currentStatus?: string
  } | null
  workspaceScope: LaundryWorkWorkspaceScope
}

export type LaundryWorkPolicyResult = {
  allowed: boolean
  reasonCode?:
    | 'MISSING_WORKSPACE_SCOPE'
    | 'RESORT_SCOPE_MISMATCH'
    | 'MISSING_CURRENT_WORK'
    | 'ACTION_NOT_SUPPORTED'
    | 'TERMINAL_WORK'
  message?: string
}

const terminalStatuses = new Set(['CLOSED', 'CANCELLED'])
const readOnlyActions = new Set<LaundryWorkActionKey>(['back', 'viewImages', 'refresh'])
const supportedActions = new Set<LaundryWorkActionKey>([
  'back',
  'saveDraft',
  'continue',
  'createIssue',
  'uploadImage',
  'viewImages',
  'refresh',
])

export function evaluateLaundryWorkPolicy({
  actionKey,
  work,
  workspaceScope,
}: LaundryWorkPolicyContext): LaundryWorkPolicyResult {
  if (!supportedActions.has(actionKey)) {
    return {
      allowed: false,
      reasonCode: 'ACTION_NOT_SUPPORTED',
      message: 'Action is not supported by Laundry Work contract.',
    }
  }

  if (!workspaceScope?.workspaceType) {
    return {
      allowed: false,
      reasonCode: 'MISSING_WORKSPACE_SCOPE',
      message: 'Workspace context is required before performing this action.',
    }
  }

  if (workspaceScope.workspaceType === 'RESORT') {
    if (!workspaceScope.resortId) {
      return {
        allowed: false,
        reasonCode: 'MISSING_WORKSPACE_SCOPE',
        message: 'Resort workspace requires an authenticated resort scope.',
      }
    }

    if (work?.resortId && work.resortId !== workspaceScope.resortId) {
      return {
        allowed: false,
        reasonCode: 'RESORT_SCOPE_MISMATCH',
        message: 'This work is outside the active resort scope.',
      }
    }
  }

  if (readOnlyActions.has(actionKey)) {
    return { allowed: true }
  }

  if (!work?.id) {
    return {
      allowed: false,
      reasonCode: 'MISSING_CURRENT_WORK',
      message: 'Current work is required before this action can run.',
    }
  }

  if (work.currentStatus && terminalStatuses.has(work.currentStatus)) {
    return {
      allowed: false,
      reasonCode: 'TERMINAL_WORK',
      message: 'This work is already terminal and cannot be changed from the detail screen.',
    }
  }

  return { allowed: true }
}

export function buildLaundryWorkActionModel({
  work,
  workspaceScope,
  handlers,
  pendingAction,
}: {
  work?: LaundryWorkPolicyContext['work']
  workspaceScope: LaundryWorkWorkspaceScope
  handlers: Partial<Record<LaundryWorkActionKey, () => void>>
  pendingAction?: LaundryWorkActionKey | null
}) {
  const action = (actionKey: LaundryWorkActionKey, label: string) => {
    const policy = evaluateLaundryWorkPolicy({ actionKey, work, workspaceScope })

    return {
      label,
      onClick: handlers[actionKey],
      disabled: !policy.allowed,
      loading: pendingAction === actionKey,
    }
  }

  return {
    work: {
      back: action('back', 'ย้อนกลับ'),
      saveDraft: action('saveDraft', 'บันทึกชั่วคราว'),
      continue: action('continue', 'ดำเนินการขั้นตอนถัดไป'),
      canSaveDraft: evaluateLaundryWorkPolicy({ actionKey: 'saveDraft', work, workspaceScope }).allowed,
      canContinue: evaluateLaundryWorkPolicy({ actionKey: 'continue', work, workspaceScope }).allowed,
    },
    issue: {
      createIssue: action('createIssue', 'เพิ่มปัญหา'),
      canCreateIssue: evaluateLaundryWorkPolicy({ actionKey: 'createIssue', work, workspaceScope }).allowed,
    },
    image: {
      uploadImage: action('uploadImage', 'เพิ่มรูป'),
      viewAll: action('viewImages', 'ดูทั้งหมด'),
      canUploadImage: evaluateLaundryWorkPolicy({ actionKey: 'uploadImage', work, workspaceScope }).allowed,
    },
  }
}
