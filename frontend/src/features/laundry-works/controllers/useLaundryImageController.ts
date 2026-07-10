import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getWorkspaceContext } from '../../auth/authSession'
import { laundryImageApi, type LaundryWorkImageDTO } from '../api/laundryImageApi'
import type { LaundryWorkRequestMeta } from '../api/laundryWorkApi'
import { getLaundryImagePolicy } from '../policies/laundryImage.policy'
import { useLaundryImageStore } from '../stores/laundryImage.store'

const createRequestId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `li-img-${Date.now()}`)
const REGISTER_PENDING_KEY = '__REGISTER_IMAGE__'

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

export function useLaundryImageController({ workId, workStatus }: { workId?: string | number; workStatus?: string }) {
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
  const [pendingImageId, setPendingImageId] = useState<string | number | null>(null)
  const mutationLock = useRef(false)

  const policy = useMemo(() => getLaundryImagePolicy({
    workspaceType: session.workspaceType,
    role: session.actorRole,
    workStatus,
    loading,
  }), [loading, session.actorRole, session.workspaceType, workStatus])

  const loadImages = useCallback(async () => {
    if (!workId) {
      reset()
      return
    }

    setWorkId(workId)
    setLoading(true)
    setError(null)
    const result = await laundryImageApi.list({ workId, meta: createMeta('listLaundryWorkImages', session) })
    if (result.ok) setImages(result.data)
    else setError(result.error)
    setLoading(false)
  }, [reset, session, setError, setImages, setLoading, setWorkId, workId])

  useEffect(() => {
    void loadImages()
    return () => reset()
  }, [loadImages, reset])

  const runMutation = useCallback(async (imageId: string | number | null, action: () => Promise<boolean>) => {
    if (mutationLock.current) return
    mutationLock.current = true
    setPendingImageId(imageId)
    setError(null)
    try {
      if (await action()) await loadImages()
    } finally {
      mutationLock.current = false
      setPendingImageId(null)
    }
  }, [loadImages, setError])

  const registerByUrl = useCallback(() => {
    if (!policy.canRegister || !workId) return
    const url = window.prompt('วาง URL รูปภาพจาก Storage Adapter')?.trim()
    if (!url) return
    const caption = window.prompt('คำอธิบายรูปภาพ (ไม่บังคับ)')?.trim() || undefined
    void runMutation(REGISTER_PENDING_KEY, async () => {
      const result = await laundryImageApi.register({ workId, url, caption, provider: 'EXTERNAL', meta: createMeta('registerLaundryWorkImage', session) })
      if (!result.ok) setError(result.error)
      return result.ok
    })
  }, [policy.canRegister, runMutation, session, setError, workId])

  const editCaption = useCallback((image: LaundryWorkImageDTO) => {
    if (!policy.canEditCaption) return
    const caption = window.prompt('แก้ไขคำอธิบายรูปภาพ', image.caption || '')
    if (caption === null) return
    void runMutation(image.id, async () => {
      const result = await laundryImageApi.update(image.id, { caption: caption.trim() || null }, createMeta('updateLaundryWorkImageCaption', session))
      if (!result.ok) setError(result.error)
      return result.ok
    })
  }, [policy.canEditCaption, runMutation, session, setError])

  const setCover = useCallback((image: LaundryWorkImageDTO) => {
    if (!policy.canSetCover || image.isCover) return
    void runMutation(image.id, async () => {
      const result = await laundryImageApi.setCover(image.id, createMeta('setLaundryWorkImageCover', session))
      if (!result.ok) setError(result.error)
      return result.ok
    })
  }, [policy.canSetCover, runMutation, session, setError])

  const softDelete = useCallback((image: LaundryWorkImageDTO) => {
    if (!policy.canSoftDelete || !window.confirm('นำรูปนี้ออกจากงานใช่หรือไม่?')) return
    void runMutation(image.id, async () => {
      const result = await laundryImageApi.softDelete(image.id, createMeta('softDeleteLaundryWorkImage', session))
      if (!result.ok) setError(result.error)
      return result.ok
    })
  }, [policy.canSoftDelete, runMutation, session, setError])

  return {
    workId: storedWorkId,
    images,
    loading,
    error,
    capability: laundryImageApi.capability,
    policy,
    pendingImageId,
    registerPending: pendingImageId === REGISTER_PENDING_KEY,
    actions: {
      registerByUrl,
      editCaption,
      setCover,
      softDelete,
    },
    reload: loadImages,
  }
}
