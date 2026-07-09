export type LaundryWorkWorkspaceScope = {
  workspaceType: 'LAUNDRY' | 'RESORT'
  resortId?: number
  role?: string
}

export type LaundryWorkDetailState = {
  selectedWorkId?: string | number
  workspaceScope: LaundryWorkWorkspaceScope
}

export const defaultLaundryWorkWorkspaceScope: LaundryWorkWorkspaceScope = {
  workspaceType: 'LAUNDRY',
}

export function createLaundryWorkDetailState(workId?: string | number): LaundryWorkDetailState {
  return {
    selectedWorkId: workId,
    workspaceScope: defaultLaundryWorkWorkspaceScope,
  }
}

export function resetLaundryWorkSelection(state: LaundryWorkDetailState): LaundryWorkDetailState {
  return {
    ...state,
    selectedWorkId: undefined,
  }
}
