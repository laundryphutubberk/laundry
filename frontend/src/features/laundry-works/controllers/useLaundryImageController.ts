import { useCallback, useEffect, useMemo } from 'react'

import { getWorkspaceContext } from '../../auth/authSession'
import { laundryImageApi } from '../api/laundryImageApi'
import type { LaundryWorkRequestMeta } from '../api/laundryWorkApi'
import { useLaundryImageStore } from '../stores/laundryImage.store'

const createRequestId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `li-img-${Date.now()}`)

const createMeta = (action: string, session: ReturnType<typeof getWorkspaceContext>): LaundryWorkRequestMeta => ({
  requestId: createRequestId(),
  feature: 'laundry-work',
  action,
  actorId: session.actorId,
  actorRole: session.actorRole,
  workspaceType: session.workspaceType,
  resortId: session.resortId || undefined,
  token: session.token,
  createdAt: new Date().toISOString(),
})

export function useLaundryImageController({ workId }: { workId?: string | number }) {
  const session = useMemo(() => getWorkspaceContext(), [])
  const storedWorkId = useLaundryImageStore((state) => state.workId)
  const images = useLaundryImageStore((state) => state.images)
  const loading = useLaundryImageStore((state) => state.loading)
  const error = useLaundryImageStore((state) => state.error)
  const setWorkId = useLaundryImageStore((state) => state.setWorkId)
  const setImages = useLaundryImageStore((state) => state.setImages)
  const setLoading = useLaundryImageStore((state) => state.setLoading)
  const setError = useLaundryImageStore((state) => state.setError)
  const reset = useLaundryImageStore((state) => state.reset)

  const loadImages = useCallback(async () => {
    if (!workId) {
      reset()
      return
    }

    setWorkId(workId)
    setLoading(true)
    setError(null)

    const result = await laundryImageApi.list({
      workId,
      meta: createMeta('listLaundryWorkImages', session),
    })

    if (result.ok) setImages(result.data)
    else setError(result.error)

    setLoading(false)
  }, [reset, session, setError, setImages, setLoading, setWorkId, workId])

  useEffect(() => {
    void loadImages()
    return () => reset()
  }, [loadImages, reset])

  return {
    workId: storedWorkId,
    images,
    loading,
    error,
    capability: laundryImageApi.capability,
    reload: loadImages,
  }
}
