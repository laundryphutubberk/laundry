import { create } from 'zustand'

export type LaundryWorkFilters = {
  status?: string
  resortId?: string | number
  dateFrom?: string
  dateTo?: string
  search?: string
  issueOnly?: boolean
  returnReadyOnly?: boolean
}

export type LaundryWorkClientState = {
  activePanelId?: string
  expandedBagIds: Array<string | number>
}

export type LaundryWorkSelectionState = {
  selectedWorkId?: string | number
  selectedBagId?: string | number
  selectedIssueId?: string | number
  selectedCountLineId?: string | number
}

export type LaundryWorkStoreState = {
  filters: LaundryWorkFilters
  client: LaundryWorkClientState
  selection: LaundryWorkSelectionState
  setFilters: (filters: Partial<LaundryWorkFilters>) => void
  resetLaundryWorkFilters: () => void
  setActivePanelId: (activePanelId?: string) => void
  toggleExpandedBagId: (bagId: string | number) => void
  selectWork: (workId?: string | number) => void
  selectBag: (bagId?: string | number) => void
  selectIssue: (issueId?: string | number) => void
  selectCountLine: (countLineId?: string | number) => void
  resetLaundryWorkSelection: () => void
  resetLaundryWork: () => void
}

const emptyFilters: LaundryWorkFilters = {}

const emptyClient: LaundryWorkClientState = {
  activePanelId: 'overview',
  expandedBagIds: [],
}

const emptySelection: LaundryWorkSelectionState = {}

export const useLaundryWorkStore = create<LaundryWorkStoreState>((set) => ({
  filters: emptyFilters,
  client: emptyClient,
  selection: emptySelection,

  setFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    })),

  resetLaundryWorkFilters: () =>
    set({
      filters: emptyFilters,
    }),

  setActivePanelId: (activePanelId) =>
    set((state) => ({
      client: {
        ...state.client,
        activePanelId,
      },
    })),

  toggleExpandedBagId: (bagId) =>
    set((state) => {
      const expanded = state.client.expandedBagIds.includes(bagId)
      return {
        client: {
          ...state.client,
          expandedBagIds: expanded
            ? state.client.expandedBagIds.filter((id) => id !== bagId)
            : [...state.client.expandedBagIds, bagId],
        },
      }
    }),

  selectWork: (workId) =>
    set({
      selection: {
        selectedWorkId: workId,
        selectedBagId: undefined,
        selectedIssueId: undefined,
        selectedCountLineId: undefined,
      },
      client: emptyClient,
    }),

  selectBag: (bagId) =>
    set((state) => ({
      selection: {
        ...state.selection,
        selectedBagId: bagId,
      },
    })),

  selectIssue: (issueId) =>
    set((state) => ({
      selection: {
        ...state.selection,
        selectedIssueId: issueId,
      },
    })),

  selectCountLine: (countLineId) =>
    set((state) => ({
      selection: {
        ...state.selection,
        selectedCountLineId: countLineId,
      },
    })),

  resetLaundryWorkSelection: () =>
    set({
      selection: emptySelection,
      client: emptyClient,
    }),

  resetLaundryWork: () =>
    set({
      filters: emptyFilters,
      client: emptyClient,
      selection: emptySelection,
    }),
}))
