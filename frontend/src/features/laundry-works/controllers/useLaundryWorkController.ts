import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getWorkspaceContext } from '../../auth/authSession'
import { laundryWorkApi, type ApiFailure, type LaundryWorkDetailDTO, type LaundryWorkRequestMeta } from '../api/laundryWorkApi'
import { getLaundryWorkActionModel, type LaundryWorkPolicyAction } from '../policies/laundryWork.policy'
import { createLaundryWorkDetailProjection } from '../projections/laundryWorkProjection'
import { useLaundryWorkStore } from '../stores/laundryWork.store'

const createRequestId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `lw-${Date.now()}`
}

const createRequestMeta = (
  action: LaundryWorkRequestMeta['action'] = 'getLaundryWorkDetail',
  sessionContext: ReturnType<typeof getWorkspaceContext>,
): LaundryWorkRequestMeta => ({
  requestId: createRequestId(),
  feature: 'laundry-work',
  action,
  actorId: sessionContext.actorId,
  actorRole: sessionContext.actorRole,
  workspaceType: sessionContext.workspaceType,
  resortId: sessionContext.resortId || undefined,
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
  const [isCreatingBag, setIsCreatingBag] = useState(false)
  const [isCreatingCountLine, setIsCreatingCountLine] = useState(false)
  const [isUpdatingCountLine, setIsUpdatingCountLine] = useState(false)
  const [isDeletingCountLine, setIsDeletingCountLine] = useState(false)

  const sessionContext = useMemo(() => getWorkspaceContext(), [])

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

    try {
      const result = await laundryWorkApi.updateLaundryWorkStatus({
        workId,
        toStatus,
        meta,
      })

      setRequestId(result.meta.requestId)

      if (!result.ok) {
        setError(result.error)
        return
      }

      await loadDetail()
    } finally {
      setIsContinuing(false)
    }
  }, [detail?.work.currentStatus, loadDetail, policyActionModel.work.continue.allowed, sessionContext, workId])

  const createBag = useCallback(
    async (input: { bagNo: string; note?: string }) => {
      if (!policyActionModel.bag.createBag.allowed) return

      const meta = createRequestMeta('createLaundryBag', sessionContext)
      setIsCreatingBag(true)
      setError(null)
      setRequestId(meta.requestId)

      try {
        const result = await laundryWorkApi.createLaundryBag({
          workId,
          bagNo: input.bagNo,
          note: input.note,
          receivedAt: new Date().toISOString(),
          meta,
        })

        setRequestId(result.meta.requestId)

        if (!result.ok) {
          setError(result.error)
          return
        }

        await loadDetail()
      } finally {
        setIsCreatingBag(false)
      }
    },
    [loadDetail, policyActionModel.bag.createBag.allowed, sessionContext, workId],
  )

  const createCountLine = useCallback(
    async (input: { bagId?: string | number; itemTypeName: string; colorGroup?: string; quantity: number; note?: string }) => {
      if (!policyActionModel.countLine.createCountLine.allowed) return

      const meta = createRequestMeta('createLaundryCountLine', sessionContext)
      setIsCreatingCountLine(true)
      setError(null)
      setRequestId(meta.requestId)

      try {
        const result = await laundryWorkApi.createLaundryCountLine({
          workId,
          bagId: input.bagId,
          itemTypeName: input.itemTypeName,
          colorGroup: input.colorGroup,
          quantity: input.quantity,
          note: input.note,
          meta,
        })

        setRequestId(result.meta.requestId)

        if (!result.ok) {
          setError(result.error)
          return
        }

        await loadDetail()
      } finally {
        setIsCreatingCountLine(false)
      }
    },
    [loadDetail, policyActionModel.countLine.createCountLine.allowed, sessionContext, workId],
  )

  const updateCountLine = useCallback(
    async (
      lineId: string | number,
      input: { bagId?: string | number | null; itemTypeName?: string; colorGroup?: string | null; quantity?: number; note?: string | null },
    ) => {
      if (!policyActionModel.countLine.createCountLine.allowed) return

      const meta = createRequestMeta('updateLaundryCountLine', sessionContext)
      setIsUpdatingCountLine(true)
      setError(null)
      setRequestId(meta.requestId)

      try {
        const result = await laundryWorkApi.updateLaundryCountLine({
          lineId,
          ...input,
          meta,
        })

        setRequestId(result.meta.requestId)

        if (!result.ok) {
          setError(result.error)
          return
        }

        await loadDetail()
      } finally {
        setIsUpdatingCountLine(false)
      }
    },
    [loadDetail, policyActionModel.countLine.createCountLine.allowed, sessionContext],
  )

  const deleteCountLine = useCallback(
    async (lineId: string | number) => {
      if (!policyActionModel.countLine.createCountLine.allowed) return

      const meta = createRequestMeta('deleteLaundryCountLine', sessionContext)
      setIsDeletingCountLine(true)
      setError(null)
      setRequestId(meta.requestId)

      try {
        const result = await laundryWorkApi.deleteLaundryCountLine({
          lineId,
          meta,
        })

        setRequestId(result.meta.requestId)

        if (!result.ok) {
          setError(result.error)
          return
        }

        await loadDetail()
      } finally {
        setIsDeletingCountLine(false)
      }
    },
    [loadDetail, policyActionModel.countLine.createCountLine.allowed, sessionContext],
  )

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
      bag: {
        createBag: {
          ...toButtonAction(policyActionModel.bag.createBag),
          onCreate: createBag,
        },
        canCreateBag: policyActionModel.bag.createBag.allowed,
      },
      countLine: {
        createCountLine: {
          ...toButtonAction(policyActionModel.countLine.createCountLine),
          onCreate: createCountLine,
          loading: isCreatingCountLine,
        },
        updateCountLine,
        deleteCountLine,
        canCreateCountLine: policyActionModel.countLine.createCountLine.allowed,
        canUpdateCountLine: policyActionModel.countLine.createCountLine.allowed,
        canDeleteCountLine: policyActionModel.countLine.createCountLine.allowed,
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
      isBusy: loading || isContinuing || isCreatingBag || isCreatingCountLine || isUpdatingCountLine || isDeletingCountLine,
      isContinuing,
      isCreatingBag,
      isCreatingCountLine,
      isUpdatingCountLine,
      isDeletingCountLine,
    },
  }
}
