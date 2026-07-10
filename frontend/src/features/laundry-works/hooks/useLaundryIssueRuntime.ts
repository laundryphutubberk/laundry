import { useCallback, useEffect, useMemo, useState } from 'react'

import { getWorkspaceContext } from '../../auth/authSession'
import {
  laundryIssueApi,
  type CreateLaundryIssueInput,
  type LaundryIssueDTO,
  type UpdateLaundryIssueInput,
} from '../api/laundryIssueApi'
import type { ApiFailure, LaundryWorkRequestMeta } from '../api/laundryWorkApi'

const createRequestId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `li-${Date.now()}`
}

const createRequestMeta = (
  action: string,
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

export type LaundryIssueCreateForm = Omit<CreateLaundryIssueInput, 'workId' | 'meta'>
export type LaundryIssueUpdateForm = Omit<UpdateLaundryIssueInput, 'issueId' | 'meta'>

export function useLaundryIssueRuntime(workId?: string | number, workStatus?: string) {
  const sessionContext = useMemo(() => getWorkspaceContext(), [])
  const [issues, setIssues] = useState<LaundryIssueDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiFailure['error'] | null>(null)
  const [requestId, setRequestId] = useState<string>()
  const [creating, setCreating] = useState(false)
  const [updatingIssueId, setUpdatingIssueId] = useState<string | number | null>(null)
  const [resolvingIssueId, setResolvingIssueId] = useState<string | number | null>(null)

  const terminalWork = ['CLOSED', 'CANCELLED'].includes(workStatus || '')
  const canMutate = sessionContext.workspaceType === 'LAUNDRY' && !terminalWork

  const loadIssues = useCallback(async () => {
    if (!workId) {
      setIssues([])
      setLoading(false)
      return
    }

    const meta = createRequestMeta('listLaundryIssues', sessionContext)
    setLoading(true)
    setError(null)
    setRequestId(meta.requestId)

    const result = await laundryIssueApi.list({ workId, meta })
    setRequestId(result.meta.requestId)

    if (result.ok) {
      setIssues(result.data)
    } else {
      setIssues([])
      setError(result.error)
    }

    setLoading(false)
  }, [sessionContext, workId])

  useEffect(() => {
    void loadIssues()
  }, [loadIssues])

  const createIssue = useCallback(async (input: LaundryIssueCreateForm) => {
    if (!workId || !canMutate) return false

    const meta = createRequestMeta('createLaundryIssue', sessionContext)
    setCreating(true)
    setError(null)
    setRequestId(meta.requestId)

    try {
      const result = await laundryIssueApi.create({ workId, ...input, meta })
      setRequestId(result.meta.requestId)
      if (!result.ok) {
        setError(result.error)
        return false
      }
      await loadIssues()
      return true
    } finally {
      setCreating(false)
    }
  }, [canMutate, loadIssues, sessionContext, workId])

  const updateIssue = useCallback(async (issueId: string | number, input: LaundryIssueUpdateForm) => {
    if (!canMutate) return false

    const meta = createRequestMeta('updateLaundryIssue', sessionContext)
    setUpdatingIssueId(issueId)
    setError(null)
    setRequestId(meta.requestId)

    try {
      const result = await laundryIssueApi.update({ issueId, ...input, meta })
      setRequestId(result.meta.requestId)
      if (!result.ok) {
        setError(result.error)
        return false
      }
      await loadIssues()
      return true
    } finally {
      setUpdatingIssueId(null)
    }
  }, [canMutate, loadIssues, sessionContext])

  const resolveIssue = useCallback(async (issueId: string | number, resolutionNote: string) => {
    if (!canMutate) return false

    const meta = createRequestMeta('resolveLaundryIssue', sessionContext)
    setResolvingIssueId(issueId)
    setError(null)
    setRequestId(meta.requestId)

    try {
      const result = await laundryIssueApi.resolve({ issueId, resolutionNote, meta })
      setRequestId(result.meta.requestId)
      if (!result.ok) {
        setError(result.error)
        return false
      }
      await loadIssues()
      return true
    } finally {
      setResolvingIssueId(null)
    }
  }, [canMutate, loadIssues, sessionContext])

  return {
    issues,
    loading,
    error: error?.message || null,
    requestId,
    state: {
      creating,
      updatingIssueId,
      resolvingIssueId,
    },
    policy: {
      canCreate: canMutate && laundryIssueApi.capability.create,
      canUpdate: canMutate && laundryIssueApi.capability.update,
      canResolve: canMutate && laundryIssueApi.capability.resolve,
      reason: terminalWork
        ? 'ไม่สามารถแก้ไขปัญหาในงานที่ปิดหรือยกเลิกแล้ว'
        : sessionContext.workspaceType !== 'LAUNDRY'
          ? 'ต้องดำเนินการจาก Laundry Workspace'
          : null,
    },
    actions: {
      reload: loadIssues,
      createIssue,
      updateIssue,
      resolveIssue,
    },
  }
}

export type LaundryIssueRuntime = ReturnType<typeof useLaundryIssueRuntime>
