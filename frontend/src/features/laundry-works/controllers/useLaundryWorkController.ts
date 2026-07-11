import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getWorkspaceContext } from '../../auth/authSession'
import { laundryWorkApi, type ApiFailure, type LaundryItemTypeDTO, type LaundryWorkDetailDTO, type LaundryWorkRequestMeta } from '../api/laundryWorkApi'
import type { MutationFeedbackModel } from '../components/MutationFeedbackBanner'
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
  BAG_RECEIVED: 'FACTORY_RECEIVED',
  DATA_RECORDED: 'RETURNED',
  RETURNED: 'CLOSED',
}

type ControllerMutationFeedback = Omit<MutationFeedbackModel, 'onDismiss' | 'onRetry'>

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
  const [mutationFeedback, setMutationFeedback] = useState<ControllerMutationFeedback | null>(null)
  const [isContinuing, setIsContinuing] = useState(false)
  const [isCreatingBag, setIsCreatingBag] = useState(false)
  const [isCreatingCountLine, setIsCreatingCountLine] = useState(false)
  const [isUpdatingCountLine, setIsUpdatingCountLine] = useState(false)
  const [isDeletingCountLine, setIsDeletingCountLine] = useState(false)
  const [itemTypes, setItemTypes] = useState<LaundryItemTypeDTO[]>([])
  const [isOpeningBag, setIsOpeningBag] = useState(false)
  const continueInFlightRef = useRef(false)

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
      if (sessionContext.workspaceType === 'LAUNDRY') {
        const itemTypeResult = await laundryWorkApi.listItemTypes(createRequestMeta('listLaundryItemTypes', sessionContext))
        if (itemTypeResult.ok) setItemTypes(itemTypeResult.data)
      }
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

  useEffect(() => {
    if (mutationFeedback?.tone !== 'success') return

    const timeoutId = window.setTimeout(() => setMutationFeedback(null), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [mutationFeedback])

  useEffect(() => {
    const handleIssueChanged = (event: Event) => {
      const changedWorkId = (event as CustomEvent<{ workId?: string }>).detail?.workId
      if (!changedWorkId || changedWorkId !== String(workId)) return
      void loadDetail()
    }

    window.addEventListener('laundry-work:issue-changed', handleIssueChanged)
    return () => window.removeEventListener('laundry-work:issue-changed', handleIssueChanged)
  }, [loadDetail, workId])

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
    if (!policyActionModel.work.continue.allowed || !detail?.work.currentStatus || continueInFlightRef.current) return

    const meta = createRequestMeta('updateLaundryWorkStatus', sessionContext)
    setIsContinuing(true)
    continueInFlightRef.current = true
    setError(null)
    setMutationFeedback(null)
    setRequestId(meta.requestId)

    try {
      const commandByStatus: Record<string, 'confirm-type-sorting' | 'confirm-color-sorting' | 'record-data'> = {
        ITEM_COUNTED: 'confirm-type-sorting',
        TYPE_SORTED: 'confirm-color-sorting',
        COLOR_SORTED: 'record-data',
      }
      const command = commandByStatus[detail.work.currentStatus]
      const result = detail.work.currentStatus === 'BAG_OPENED'
        ? await laundryWorkApi.completeCounting({ workId, meta })
        : command
          ? await laundryWorkApi.runWorkCommand(command, { workId, meta })
          : await laundryWorkApi.updateLaundryWorkStatus({
            workId,
            toStatus: nextBackendStatusByCurrentStatus[detail.work.currentStatus]!,
            meta,
          })

      setRequestId(result.meta.requestId)

      if (!result.ok) {
        setMutationFeedback({
          tone: 'error',
          title: 'ไม่สามารถดำเนินการขั้นตอนถัดไปได้',
          message: result.error.message,
          requestId: result.meta.requestId,
        })
        return
      }

      await loadDetail()
    } finally {
      continueInFlightRef.current = false
      setIsContinuing(false)
    }
  }, [detail?.work.currentStatus, loadDetail, policyActionModel.work.continue.allowed, sessionContext, workId])

  const openBag = useCallback(async (bagId: string | number) => {
    if (!policyActionModel.bag.openBag.allowed) return
    const meta = createRequestMeta('openLaundryBag', sessionContext)
    setIsOpeningBag(true)
    setMutationFeedback(null)
    try {
      const result = await laundryWorkApi.openBag({ workId, bagId, meta })
      if (!result.ok) {
        setMutationFeedback({ tone: 'error', title: 'เปิดถุงไม่สำเร็จ', message: result.error.message, requestId: result.meta.requestId })
        return
      }
      await loadDetail()
      setMutationFeedback({ tone: 'success', title: 'เปิดถุงแล้ว', message: 'พร้อมบันทึกรายการผ้าที่นับได้', requestId: result.meta.requestId })
    } finally {
      setIsOpeningBag(false)
    }
  }, [loadDetail, policyActionModel.bag.openBag.allowed, sessionContext, workId])

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
    async (input: { bagId: string | number; itemTypeId: string | number; itemTypeName: string; colorGroup?: string; quantity: number; note?: string }) => {
      if (!policyActionModel.countLine.createCountLine.allowed) return

      const meta = createRequestMeta('createLaundryCountLine', sessionContext)
      setIsCreatingCountLine(true)
      setMutationFeedback(null)

      try {
        const result = await laundryWorkApi.createLaundryCountLine({
          workId,
          bagId: input.bagId,
          itemTypeId: input.itemTypeId,
          colorGroup: input.colorGroup,
          quantity: input.quantity,
          note: input.note,
          meta,
        })

        if (!result.ok) {
          setMutationFeedback({
            tone: 'error',
            title: 'เพิ่มรายการนับผ้าไม่สำเร็จ',
            message: result.error.message,
            requestId: result.meta.requestId,
          })
          return
        }

        await loadDetail()
        setMutationFeedback({
          tone: 'success',
          title: 'เพิ่มรายการนับผ้าแล้ว',
          message: `${input.itemTypeName} จำนวน ${input.quantity} ชิ้นถูกบันทึกเรียบร้อย`,
          requestId: result.meta.requestId,
        })
      } catch (createError) {
        setMutationFeedback({
          tone: 'error',
          title: 'เพิ่มรายการนับผ้าไม่สำเร็จ',
          message: createError instanceof Error ? createError.message : 'Unexpected count-line error',
        })
      } finally {
        setIsCreatingCountLine(false)
      }
    },
    [loadDetail, policyActionModel.countLine.createCountLine.allowed, sessionContext, workId],
  )

  const updateCountLine = useCallback(
    async (
      lineId: string | number,
      input: { bagId?: string | number; itemTypeId?: string | number; colorGroup?: string | null; quantity?: number; note?: string | null },
    ) => {
      if (!policyActionModel.countLine.updateCountLine.allowed) return

      const meta = createRequestMeta('updateLaundryCountLine', sessionContext)
      setIsUpdatingCountLine(true)
      setMutationFeedback(null)

      try {
        const result = await laundryWorkApi.updateLaundryCountLine({
          lineId,
          ...input,
          meta,
        })

        if (!result.ok) {
          setMutationFeedback({
            tone: 'error',
            title: 'แก้ไขรายการนับผ้าไม่สำเร็จ',
            message: result.error.message,
            requestId: result.meta.requestId,
          })
          return
        }

        await loadDetail()
        setMutationFeedback({
          tone: 'success',
          title: 'แก้ไขรายการนับผ้าแล้ว',
          message: 'ข้อมูลรายการนับผ้าถูกอัปเดตเรียบร้อย',
          requestId: result.meta.requestId,
        })
      } finally {
        setIsUpdatingCountLine(false)
      }
    },
    [loadDetail, policyActionModel.countLine.updateCountLine.allowed, sessionContext],
  )

  const deleteCountLine = useCallback(
    async (lineId: string | number) => {
      if (!policyActionModel.countLine.deleteCountLine.allowed) return

      const meta = createRequestMeta('deleteLaundryCountLine', sessionContext)
      setIsDeletingCountLine(true)
      setMutationFeedback(null)

      try {
        const result = await laundryWorkApi.deleteLaundryCountLine({
          lineId,
          meta,
        })

        if (!result.ok) {
          setMutationFeedback({
            tone: 'error',
            title: 'ลบรายการนับผ้าไม่สำเร็จ',
            message: result.error.message,
            requestId: result.meta.requestId,
          })
          return
        }

        await loadDetail()
        setMutationFeedback({
          tone: 'success',
          title: 'ลบรายการนับผ้าแล้ว',
          message: 'รายการถูกนำออกจากงานเรียบร้อย',
          requestId: result.meta.requestId,
        })
      } finally {
        setIsDeletingCountLine(false)
      }
    },
    [loadDetail, policyActionModel.countLine.deleteCountLine.allowed, sessionContext],
  )

  return {
    ...viewModel,
    itemTypes,
    feedback: mutationFeedback
      ? {
          ...mutationFeedback,
          onDismiss: () => setMutationFeedback(null),
        }
      : null,
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
        openBag: {
          ...toButtonAction(policyActionModel.bag.openBag),
          onOpen: openBag,
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
        canUpdateCountLine: policyActionModel.countLine.updateCountLine.allowed,
        canDeleteCountLine: policyActionModel.countLine.deleteCountLine.allowed,
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
      isBusy: loading || isContinuing || isCreatingBag || isOpeningBag || isCreatingCountLine || isUpdatingCountLine || isDeletingCountLine,
      isContinuing,
      isCreatingBag,
      isOpeningBag,
      isCreatingCountLine,
      isUpdatingCountLine,
      isDeletingCountLine,
    },
  }
}
