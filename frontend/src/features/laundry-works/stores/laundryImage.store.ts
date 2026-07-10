import { create } from 'zustand'

import type { ApiFailure } from '../api/laundryWorkApi'
import type { LaundryWorkImageDTO } from '../api/laundryImageApi'

type LaundryImageStore = {
  workId: string | null
  images: LaundryWorkImageDTO[]
  loading: boolean
  busy: boolean
  error: ApiFailure['error'] | null
  requestId: string | null
  setWorkId: (workId: string | number | null | undefined) => void
  setImages: (images: LaundryWorkImageDTO[]) => void
  setLoading: (loading: boolean) => void
  setBusy: (busy: boolean) => void
  setError: (error: ApiFailure['error'] | null) => void
  setRequestId: (requestId: string | null | undefined) => void
  reset: () => void
}

const initialState = {
  workId: null as string | null,
  images: [] as LaundryWorkImageDTO[],
  loading: false,
  busy: false,
  error: null as ApiFailure['error'] | null,
  requestId: null as string | null,
}

export const useLaundryImageStore = create<LaundryImageStore>((set) => ({
  ...initialState,
  setWorkId: (workId) => set({ workId: workId === null || workId === undefined ? null : String(workId) }),
  setImages: (images) => set({ images }),
  setLoading: (loading) => set({ loading }),
  setBusy: (busy) => set({ busy }),
  setError: (error) => set({ error }),
  setRequestId: (requestId) => set({ requestId: requestId || null }),
  reset: () => set(initialState),
}))
