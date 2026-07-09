export type LaundryWorkWorkspaceType = 'LAUNDRY' | 'RESORT'

export type LaundryWorkWorkspaceScope = {
  workspaceType: LaundryWorkWorkspaceType
  resortId?: number
  role?: string
}

export type LaundryWorkRecord = {
  id: string | number
  workNo?: string
  resortId?: number
  resortName?: string
  bagCount?: number
  currentStatus?: string
  issueCount?: number
  receivedDate?: string
  returnedAt?: string
  closedAt?: string
  createdAt?: string
  updatedAt?: string
  note?: string
}

export type LaundryWorkDetailRecord = {
  work: LaundryWorkRecord | null
  bags?: Array<Record<string, unknown>>
  countLines?: Array<Record<string, unknown>>
  issues?: Array<Record<string, unknown>>
  statusLogs?: Array<Record<string, unknown>>
  images?: Array<Record<string, unknown>>
}

export type LaundryWorkBoundaryError = {
  code: string
  message: string
  requestId?: string
  retryable?: boolean
}

export type LaundryWorkClientState = {
  selectedWorkId?: number | string
  workspaceScope: LaundryWorkWorkspaceScope
  activePanelId?: string
  currentWorkDetail: LaundryWorkDetailRecord | null
  loading: {
    detail: boolean
    command: boolean
  }
  error: {
    detail: LaundryWorkBoundaryError | null
    command: LaundryWorkBoundaryError | null
  }
  actionStatus: {
    pendingAction?: string
    lastAction?: string
    lastSucceededAction?: string
    lastFailedAction?: string
  }
  lastUpdatedAt?: string
}

const defaultState: LaundryWorkClientState = {
  workspaceScope: {
    workspaceType: 'LAUNDRY',
  },
  currentWorkDetail: null,
  loading: {
    detail: false,
    command: false,
  },
  error: {
    detail: null,
    command: null,
  },
  actionStatus: {},
}

let state: LaundryWorkClientState = { ...defaultState }

export function getLaundryWorkState(): LaundryWorkClientState {
  return state
}

export function setLaundryWorkPatch(patch: Partial<LaundryWorkClientState>): LaundryWorkClientState {
  state = {
    ...state,
    ...patch,
    loading: {
      ...state.loading,
      ...patch.loading,
    },
    error: {
      ...state.error,
      ...patch.error,
    },
    actionStatus: {
      ...state.actionStatus,
      ...patch.actionStatus,
    },
  }

  return state
}

export function setLaundryWorkSelection(selectedWorkId?: number | string): LaundryWorkClientState {
  return setLaundryWorkPatch({ selectedWorkId, activePanelId: undefined })
}

export function setLaundryWorkWorkspaceScope(workspaceScope: LaundryWorkWorkspaceScope): LaundryWorkClientState {
  return setLaundryWorkPatch({ workspaceScope })
}

export function resetLaundryWorkSelection(): LaundryWorkClientState {
  return setLaundryWorkPatch({
    selectedWorkId: undefined,
    activePanelId: undefined,
    currentWorkDetail: null,
  })
}

export function resetLaundryWork(): LaundryWorkClientState {
  state = { ...defaultState }
  return state
}
