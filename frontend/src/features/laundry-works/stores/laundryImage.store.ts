import { create } from 'zustand'

import type { ApiFailure } from '../api/laundryWorkApi'
import type { LaundryWorkImageDTO } from '../api/laundryImageApi'

type LaundryImageStore = {
  workId: string | null
  images: LaundryWorkImageDTO[]
  loading: boolean
  error: ApiFailure['error'] | null
  setWorkId: (workId: string | number | null | undefined) => void
  setImages: (images: LaundryWorkImageDTO[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: ApiFailure['error'] | null) => void
  reset: () => void
}

const initialState = {
  workId: null as string | null,
  images: [] as LaundryWorkImageDTO[],
  loading: false,
  error: null as ApiFailure['error'] | null,
}

export const useLaundryImageStore = create<LaundryImageStore>((set) => ({
  ...initialState,
  setWorkId: (workId) => set({ workId: workId === null || workId === undefined ? null : String(workId) }),
  setImages: (images) => set({ images }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}))
