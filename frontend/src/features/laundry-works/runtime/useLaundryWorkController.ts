import { useEffect, useMemo, useState } from 'react'
import { laundryWorkApi, type ApiFailure, type LaundryWorkDetailDTO, type LaundryWorkRequestMeta } from '../api/laundryWorkApi'
import {
  getLaundryWorkState,
  setLaundryWorkSelection,
  setLaundryWorkWorkspaceScope,
  type LaundryWorkWorkspaceScope,
} from '../state/laundryWork.store'
import { buildLaundryWorkActionModel, type LaundryWorkActionKey } from './laundryWork.policy'
import { buildLaundryWorkDetailProjection } from './laundryWorkProjection'

export type UseLaundryWorkControllerInput = {
  workId?: string | number
  workspaceScope?: LaundryWorkWorkspaceScope
}

function createRequestMeta(action: string, workspaceScope: LaundryWorkWorkspaceScope): LaundryWorkRequestMeta {
  return {
    requestId: `lw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    feature: 'laundry-work',
    action,
    workspaceType: workspaceScope.workspaceType,
    resortId: workspaceScope.resortId,
    actorRole: workspaceScope.role,
    createdAt: new Date().toISOString(),
  }
}

const defaultWorkspaceScope: LaundryWorkWorkspaceScope = {
  workspaceType: 'LAUNDRY',
}

export function useLaundryWorkController({
  workId,
  workspaceScope = defaultWorkspaceScope,
}: UseLaundryWorkControllerInput = {}) {
  const [detail, setDetail] = useState<LaundryWorkDetailDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiFailure['error'] | null>(null)
  const [pendingAction, setPendingAction] = useState<LaundryWorkActionKey | null>(null)

  const selectedWorkId = workId || getLaundryWorkState().selectedWorkId || '1'

  const loadDetail = async (nextWorkId: string | number = selectedWorkId) => {
    setLoading(true)
    setError(null)
    setLaundryWorkWorkspaceScope(workspaceScope)
    setLaundryWorkSelection(nextWorkId)

    const result = await laundryWorkApi.getLaundryWorkDetail({
      workId: nextWorkId,
      meta: createRequestMeta('getLaundryWorkDetail', workspaceScope),
    })

    if (result.ok) {
      setDetail(result.data)
    } else {
      setError(result.error)
      setDetail(null)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadDetail(selectedWorkId)
    // controller boundary owns the load lifecycle for this feature page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkId, workspaceScope.workspaceType, workspaceScope.resortId])

  const runContractSafeAction = (actionKey: LaundryWorkActionKey) => () => {
    setPendingAction(actionKey)

    window.setTimeout(() => {
      setPendingAction(null)
    }, 0)
  }

  const actions = useMemo(
    () => buildLaundryWorkActionModel({
      work: detail?.work
        ? {
            id: detail.work.id,
            resortId: Number(detail.work.resortId),
            currentStatus: detail.work.currentStatus,
          }
        : null,
      workspaceScope,
      pendingAction,
      handlers: {
        back: () => window.history.back(),
        saveDraft: runContractSafeAction('saveDraft'),
        continue: runContractSafeAction('continue'),
        createIssue: runContractSafeAction('createIssue'),
        uploadImage: runContractSafeAction('uploadImage'),
        viewImages: runContractSafeAction('viewImages'),
        refresh: () => loadDetail(selectedWorkId),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [detail, pendingAction, selectedWorkId, workspaceScope.workspaceType, workspaceScope.resortId],
  )

  const viewModel = useMemo(
    () => buildLaundryWorkDetailProjection({
      detail,
      loading,
      error,
      workspaceScope,
    }),
    [detail, error, loading, workspaceScope],
  )

  return {
    viewModel,
    actions,
    state: {
      loading,
      error: viewModel.error,
      isBusy: loading || Boolean(pendingAction),
      isSavingDraft: pendingAction === 'saveDraft',
      isContinuing: pendingAction === 'continue',
      pendingAction,
    },
    loadDetail,
    refresh: () => loadDetail(selectedWorkId),
  }
}
