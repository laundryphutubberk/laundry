export type LaundryWorkWorkspaceScope = {
  workspaceType: 'LAUNDRY' | 'RESORT'
  resortId?: number
  role?: string
}

export type LaundryWorkClientState = {
  selectedWorkId?: number | string
  workspaceScope: LaundryWorkWorkspaceScope
  activePanelId?: string
}

const defaultState: LaundryWorkClientState = {
  workspaceScope: {
    workspaceType: 'LAUNDRY',
  },
}

let state: LaundryWorkClientState = { ...defaultState }

export function getLaundryWorkState(): LaundryWorkClientState {
  return state
}

export function setLaundryWorkSelection(selectedWorkId?: number | string): LaundryWorkClientState {
  state = {
    ...state,
    selectedWorkId,
  }

  return state
}

export function setLaundryWorkWorkspaceScope(workspaceScope: LaundryWorkWorkspaceScope): LaundryWorkClientState {
  state = {
    ...state,
    workspaceScope,
  }

  return state
}

export function resetLaundryWorkSelection(): LaundryWorkClientState {
  state = {
    ...state,
    selectedWorkId: undefined,
    activePanelId: undefined,
  }

  return state
}

export function resetLaundryWork(): LaundryWorkClientState {
  state = { ...defaultState }

  return state
}
