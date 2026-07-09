import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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

const createRequestMeta = (): LaundryWorkRequestMeta => ({
  requestId: createRequestId(),
  feature: 'laundry-work',
  action: 'getLaundryWorkDetail',
  workspaceType: 'LAUNDRY',
  actorRole: 'LAUNDRY_STAFF',
  createdAt: new Date().toISOString(),
})

const toButtonAction = (action: LaundryWorkPolicyAction, onClick?: () => void) => ({
  label: action.label,
  onClick,
  disabled: action.disabled || !action.allowed,
})

export function useLaundryWorkController() {
  const params = useParams()
  const navigate = useNavigate()
  const routeWorkId = params.workId || params.id
  const workId = routeWorkId || 'mock-work-001'
  const selectWork = useLaundryWorkStore((state) => state.selectWork)
  const resetLaundryWorkSelection = useLaundryWorkStore((state) => state.resetLaundryWorkSelection)

  const [detail, setDetail] = useState<LaundryWorkDetailDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiFailure['error'] | null>(null)
  const [requestId, setRequestId] = useState<string | undefined>()

  useEffect(() => {
    let active = true
    const meta = createRequestMeta()

    setLoading(true)
    setError(null)
    setRequestId(meta.requestId)
    selectWork(workId)

    laundryWorkApi.getLaundryWorkDetail({ workId, meta }).then((result) => {
      if (!active) return

      setRequestId(result.meta.requestId)

      if (result.ok) {
        setDetail(result.data)
        setError(null)
      } else {
        setDetail(null)
        setError(result.error)
      }

      setLoading(false)
    })

    return () => {
      active = false
      resetLaundryWorkSelection()
    }
  }, [workId, selectWork, resetLaundryWorkSelection])

  const workspaceScope = useMemo(
    () => ({
      workspaceType: 'LAUNDRY' as const,
      role: 'LAUNDRY_STAFF',
    }),
    [],
  )

  const policyActionModel = useMemo(
    () =>
      getLaundryWorkActionModel({
        workId,
        detail,
        workspaceScope,
        loading,
        error: error?.message || null,
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

  return {
    ...viewModel,
    actions: {
      work: {
        back: toButtonAction(policyActionModel.work.back, () => navigate(-1)),
        saveDraft: toButtonAction(policyActionModel.work.saveDraft),
        continue: toButtonAction(policyActionModel.work.continue),
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
  }
}
