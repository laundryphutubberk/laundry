import { useCallback, useEffect, useMemo, useState } from 'react'
import { getWorkspaceContext } from '../../auth/authSession'
import {
  inboundCustodyApi,
  type InboundCustodyDetailDTO,
  type InboundCustodyDTO,
  type InboundCustodyStatus,
} from '../api/inboundCustodyApi'
import type { LaundryWorkRequestMeta } from '../api/laundryWorkApi'
import { getInboundCustodyActionModel, type InboundCustodyPolicyActionModel } from '../policies/inboundCustody.policy'

const createRequestId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `ic-${Date.now()}`
}

const createRequestMeta = (
  action: LaundryWorkRequestMeta['action'] = 'inboundCustody',
  sessionContext: ReturnType<typeof getWorkspaceContext>,
): LaundryWorkRequestMeta => ({
  requestId: createRequestId(),
  feature: 'laundry-work',
  action,
  actorId: sessionContext.actorId,
  actorRole: sessionContext.actorRole,
  workspaceType: sessionContext.workspaceType,
  resortId: sessionContext.resortId ?? undefined,
  token: sessionContext.token ?? undefined,
  createdAt: new Date().toISOString(),
})

export type InboundCustodyControllerState = {
  loading: boolean
  error: string | null
  detail: InboundCustodyDetailDTO | null
  custody: InboundCustodyDTO | null
  policy: InboundCustodyPolicyActionModel
  pending: boolean
}

export function useInboundCustodyController(workId?: string | number, workStatus?: string) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<InboundCustodyDetailDTO | null>(null)
  const [pending, setPending] = useState(false)

  const sessionContext = useMemo(() => getWorkspaceContext(), [])

  const loadCustody = useCallback(async () => {
    if (!workId) return
    const meta = createRequestMeta('getInboundCustody', sessionContext)
    setLoading(true)
    setError(null)

    const result = await inboundCustodyApi.getCustody(workId, meta)

    if (result.ok) {
      setDetail(result.data)
      setError(null)
    } else {
      setDetail(null)
      setError(result.error.message)
    }

    setLoading(false)
  }, [sessionContext, workId])

  useEffect(() => {
    let active = true
    async function load() {
      await loadCustody()
      if (!active) return
    }
    void load()
    return () => { active = false }
  }, [loadCustody])

  const custody = detail?.custody || null

  const policy = useMemo(
    () =>
      getInboundCustodyActionModel({
        workStatus: workStatus || detail?.work.currentStatus,
        custodyStatus: custody?.status as InboundCustodyStatus | null | undefined,
        workspaceType: sessionContext.workspaceType,
        loading,
        error,
      }),
    [custody?.status, detail?.work.currentStatus, error, loading, sessionContext.workspaceType, workStatus],
  )

  const initiate = useCallback(async () => {
    if (!workId || !policy.initiate.allowed) return
    const meta = createRequestMeta('initiateInboundCustody', sessionContext)
    setPending(true)
    setError(null)
    try {
      const result = await inboundCustodyApi.initiateCustody(workId, meta)
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      await loadCustody()
    } finally {
      setPending(false)
    }
  }, [loadCustody, policy.initiate.allowed, sessionContext, workId])

  const confirmReceipt = useCallback(async () => {
    if (!workId || !policy.confirmReceipt.allowed) return
    const meta = createRequestMeta('confirmInboundCustodyReceipt', sessionContext)
    setPending(true)
    setError(null)
    try {
      const result = await inboundCustodyApi.confirmReceipt(workId, meta)
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      await loadCustody()
    } finally {
      setPending(false)
    }
  }, [loadCustody, policy.confirmReceipt.allowed, sessionContext, workId])

  const recordCountEvidence = useCallback(async (countTotalItems?: number) => {
    if (!workId || !policy.recordCountEvidence.allowed) return
    const meta = createRequestMeta('recordInboundCustodyCountEvidence', sessionContext)
    setPending(true)
    setError(null)
    try {
      const result = await inboundCustodyApi.recordCountEvidence(workId, { countTotalItems }, meta)
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      await loadCustody()
    } finally {
      setPending(false)
    }
  }, [loadCustody, policy.recordCountEvidence.allowed, sessionContext, workId])

  const close = useCallback(async () => {
    if (!workId || !policy.close.allowed) return
    const meta = createRequestMeta('closeInboundCustody', sessionContext)
    setPending(true)
    setError(null)
    try {
      const result = await inboundCustodyApi.closeCustody(workId, meta)
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      await loadCustody()
    } finally {
      setPending(false)
    }
  }, [loadCustody, policy.close.allowed, sessionContext, workId])

  return {
    loading,
    error,
    detail,
    custody,
    policy,
    pending,
    initiate,
    confirmReceipt,
    recordCountEvidence,
    close,
    reload: loadCustody,
  }
}
