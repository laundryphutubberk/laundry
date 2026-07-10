import { create } from 'zustand'

import type { ApiFailure } from '../api/laundryWorkApi'
import type { LaundryIssueDTO } from '../api/laundryIssueApi'

type LaundryIssueStore = {
  issues: LaundryIssueDTO[]
  loading: boolean
  busy: boolean
  error: ApiFailure['error'] | null
  setIssues: (issues: LaundryIssueDTO[]) => void
  setLoading: (loading: boolean) => void
  setBusy: (busy: boolean) => void
  setError: (error: ApiFailure['error'] | null) => void
  reset: () => void
}

const initialState = {
  issues: [] as LaundryIssueDTO[],
  loading: false,
  busy: false,
  error: null as ApiFailure['error'] | null,
}

export const useLaundryIssueStore = create<LaundryIssueStore>((set) => ({
  ...initialState,
  setIssues: (issues) => set({ issues }),
  setLoading: (loading) => set({ loading }),
  setBusy: (busy) => set({ busy }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}))
