import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { laundryWorkApi, type ApiFailure, type LaundryWorkDetailDTO, type LaundryWorkRequestMeta, type WorkspaceType } from '../api/laundryWorkApi'
import { getLaundryWorkActionModel, type LaundryWorkPolicyAction } from '../policies/laundryWork.policy'
import { createLaundryWorkDetailProjection } from '../projections/laundryWorkProjection'
import { useLaundryWorkStore } from '../stores/laundryWork.store'

const createRequestId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `lw-${Date.now()}`
}

type LaundryWorkSessionContext = {
  token?: string
  actorId?: number | string
  actorRole?: string
  workspaceType?: WorkspaceType
  resortId?: number
}

const readStoredToken = () => {
  if (typeof window === 'undefined') return undefined

  return (
    window.localStorage.getItem('laundry.auth.token') ||
    window.localStorage.getItem('authToken') ||
    window.localStorage.getItem('token') ||
    undefined
  )
}

const decodeJwtPayload = (token?: string) => {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    return JSON.parse(window.atob(padded)) as Record<string, unknown>
  } catch (_error) {
    return null
  }
}

const readLaundryWorkSessionContext = (): LaundryWorkSessionContext => {
  const token = readStoredToken()
  const payload = decodeJwtPayload(token)
  const workspaceType = payload?.workspaceType === 'LAUNDRY' || payload?.workspaceType === 'RESORT' ? payload.workspaceType : undefined
  const rawResortId = payload?.resortId
  const resortId = rawResortId === undefined || rawResortId === null ? undefined : Number(rawResortId)

  return {
    token,
    actorId: (payload?.userId || payload?.id) as string | number | undefined,
    actorRole: payload?.role as string | undefined,
    workspaceType,
    resortId: Number.isInteger(resortId) && resortId > 0 ? resortId : undefined,
  }
}

const createRequestMeta = (
  action: LaundryWorkRequestMeta['action'] = 'getLaundryWorkDetail',
  sessionContext: LaundryWorkSessionContext,
): LaundryWorkRequestMeta => ({
  requestId: createRequestId(),
  feature: 'laundry-work',
  action,
  actorId: sessionContext.actorId,
  actorRole: sessionContext.actorRole,
  workspaceType: sessionContext.workspaceType,
  resortId: sessionContext.resortId,
  token: sessionContext.token,
  createdAt: new Date().toISOString(),
})

const toButtonAction = (action: LaundryWorkPolicyAction, onClick?: () => void) => ({
  label: action.label,
  onClick,
  disabled: action.disabled || !action.allowed,
})

const nextBackendStatusByCurrentStatus: Record<string, string> = {
  DRAFT: 'BAG_RECEIVED',
  BAG_RECEIVED: 'FACTORY_RECEIVED',
  FACTORY_RECEIVED: 'BAG_OPENED',
  BAG_OPENED: 'ITEM_COUNTED',
  ITEM_COUNTED: 'TYPE_SORTED',
  TYPE_SORTED: 'COLOR_SORTED',
  COLOR_SORTED: 'DATA_RECORDED',
  DATA_RECORDED: 'RETURNED',
  RETURNED: 'CLOSED',
}

export function useLaundryWorkController() {
  const params = useParams()
  const navigate = useNavigate()
  const routeWorkId = params.workId || params.id
  const workId = routeWorkId
  const selectWork = useLaundryWorkStore((state) => state.selectWork)
  const resetLaundryWorkSelection = useLaundryWorkStore((state) => state.resetLaundryWorkSelection)

  const [detail, setDetail] = useState<LaundryWorkDetailDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiFailure['error'] | null>(null)
  const [requestId, setRequestId] = useState<string | undefined>()
  const [isContinuing, setIsContinuing] = useState(false)

  const sessionContext = useMemo(() => readLaundryWorkSessionContext(), [])

  const loadDetail = useCallback(async () => {
    const meta = createRequestMeta('getLaundryWorkDetail', sessionContext)

    setLoading(true)
    setError(null)
    setRequestId(meta.requestId)
    selectWork(workId)

    const result = await laundryWorkApi.getLaundryWorkDetail({ workId, meta })

    setRequestId(result.meta.requestId)

    if (result.ok) {
      setDetail(result.data)
      setError(null)
    } else {
      setDetail(null)
      setError(result.error)
    }

    setLoading(false)
  }, [selectWork, sessionContext, workId])

  useEffect(() => {
    let active = true

    async function safeLoadDetail() {
      await loadDetail()
      if (!active) return
    }

    void safeLoadDetail()

    return () => {
      active = false
      resetLaundryWorkSelection()
    }
  }, [loadDetail, resetLaundryWorkSelection])

  const workspaceScope = useMemo(
    () => ({
      workspaceType: sessionContext.workspaceType,
      resortId: sessionContext.resortId,
      role: sessionContext.actorRole,
    }),
    [sessionContext.actorRole, sessionContext.resortId, sessionContext.workspaceType],
  )

  const policyActionModel = useMemo(
    () =>
      getLaundryWorkActionModel({
        workId,
        detail,
        workspaceScope,
        loading,
        error: error?.message || null,
        capability: laundryWorkApi.capability,
      }),
    [detail, error, loading, workId, workspaceScope],
  )

  const viewModel = useMemo(
    () =>
      createLaundryWorkDetailProjection({
        detail,
        actionModel: policyActionModel,
        loading,
        error,
        requestId,
      }),
    [detail, error, loading, policyActionModel, requestId],
  )

  const continueWork = useCallback(async () => {
    if (!policyActionModel.work.continue.allowed || !detail?.work.currentStatus) return

    const toStatus = nextBackendStatusByCurrentStatus[detail.work.currentStatus]
    if (!toStatus) return

    const meta = createRequestMeta('updateLaundryWorkStatus', sessionContext)
    setIsContinuing(true)
    setError(null)
    setRequestId(meta.requestId)

    const result = await laundryWorkApi.updateLaundryWorkStatus({
      workId,
      toStatus,
      meta,
    })

    setRequestId(result.meta.requestId)

    if (!result.ok) {
      setError(result.error)
      setIsContinuing(false)
      return
    }

    await loadDetail()
    setIsContinuing(false)
  }, [detail?.work.currentStatus, loadDetail, policyActionModel.work.continue.allowed, sessionContext, workId])

  return {
    ...viewModel,
    actions: {
      work: {
        back: toButtonAction(policyActionModel.work.back, () => navigate(-1)),
        saveDraft: toButtonAction(policyActionModel.work.saveDraft),
        continue: toButtonAction(policyActionModel.work.continue, continueWork),
        canSaveDraft: policyActionModel.work.saveDraft.allowed,
        canContinue: policyActionModel.work.continue.allowed,
      },
      issue: {
        createIssue: toButtonAction(policyActionModel.issue.createIssue),
        canCreateIssue: policyActionModel.issue.createIssue.allowed,
      },
      image: {
        uploadImage: toButtonAction(policyActionModel.image.uploadImage),
        canUploadImage: policyActionModel.image.uploadImage.allowed,
      },
    },
    state: {
      ...viewModel.state,
      isBusy: loading || isContinuing,
      isContinuing,
    },
  }
}
