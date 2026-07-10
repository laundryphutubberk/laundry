import { useCallback, useEffect, useMemo } from 'react'

import { getWorkspaceContext } from '../../auth/authSession'
import { laundryIssueApi, type CreateLaundryIssueInput, type UpdateLaundryIssueInput } from '../api/laundryIssueApi'
import type { LaundryWorkRequestMeta } from '../api/laundryWorkApi'
import { getLaundryIssuePolicy } from '../policies/laundryIssue.policy'
import { useLaundryIssueStore } from '../stores/laundryIssue.store'

const createRequestId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `li-${Date.now()}`)

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

export function useLaundryIssueController({ workId, workStatus }: { workId?: string | number; workStatus?: string }) {
  const session = useMemo(() => getWorkspaceContext(), [])
  const issues = useLaundryIssueStore((state) => state.issues)
  const loading = useLaundryIssueStore((state) => state.loading)
  const busy = useLaundryIssueStore((state) => state.busy)
  const error = useLaundryIssueStore((state) => state.error)
  const setIssues = useLaundryIssueStore((state) => state.setIssues)
  const setLoading = useLaundryIssueStore((state) => state.setLoading)
  const setBusy = useLaundryIssueStore((state) => state.setBusy)
  const setError = useLaundryIssueStore((state) => state.setError)
  const reset = useLaundryIssueStore((state) => state.reset)

  const policy = useMemo(
    () => getLaundryIssuePolicy({ workspaceType: session.workspaceType, role: session.actorRole, workStatus, loading }),
    [loading, session.actorRole, session.workspaceType, workStatus],
  )

  const loadIssues = useCallback(async () => {
    const meta = createMeta('listLaundryIssues', session)
    setLoading(true)
    setError(null)
    const result = await laundryIssueApi.list({ workId, meta })
    if (result.ok) setIssues(result.data)
    else setError(result.error)
    setLoading(false)
  }, [session, setError, setIssues, setLoading, workId])

  useEffect(() => {
    void loadIssues()
    return () => reset()
  }, [loadIssues, reset])

  const createIssue = useCallback(async (input: Omit<CreateLaundryIssueInput, 'workId' | 'meta'>) => {
    if (!policy.canCreate) return false
    setBusy(true)
    setError(null)
    try {
      const result = await laundryIssueApi.create({ ...input, workId, meta: createMeta('createLaundryIssue', session) })
      if (!result.ok) {
        setError(result.error)
        return false
      }
      await loadIssues()
      return true
    } finally {
      setBusy(false)
    }
  }, [loadIssues, policy.canCreate, session, setBusy, setError, workId])

  const updateIssue = useCallback(async (issueId: string | number, input: Omit<UpdateLaundryIssueInput, 'issueId' | 'meta'>) => {
    if (!policy.canUpdate) return false
    setBusy(true)
    setError(null)
    try {
      const result = await laundryIssueApi.update({ ...input, issueId, meta: createMeta('updateLaundryIssue', session) })
      if (!result.ok) {
        setError(result.error)
        return false
      }
      await loadIssues()
      return true
    } finally {
      setBusy(false)
    }
  }, [loadIssues, policy.canUpdate, session, setBusy, setError])

  const resolveIssue = useCallback(async (issueId: string | number, resolutionNote: string) => {
    if (!policy.canResolve) return false
    setBusy(true)
    setError(null)
    try {
      const result = await laundryIssueApi.resolve({ issueId, resolutionNote, meta: createMeta('resolveLaundryIssue', session) })
      if (!result.ok) {
        setError(result.error)
        return false
      }
      await loadIssues()
      return true
    } finally {
      setBusy(false)
    }
  }, [loadIssues, policy.canResolve, session, setBusy, setError])

  return { issues, loading, busy, error, policy, createIssue, updateIssue, resolveIssue, reload: loadIssues }
}
