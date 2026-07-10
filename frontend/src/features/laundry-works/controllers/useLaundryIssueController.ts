import { useCallback, useEffect, useMemo, useState } from 'react'

import { getWorkspaceContext } from '../../auth/authSession'
import { laundryIssueApi, type CreateLaundryIssueInput, type UpdateLaundryIssueInput } from '../api/laundryIssueApi'
import type { ApiFailure, IssueReportDTO, LaundryWorkRequestMeta } from '../api/laundryWorkApi'
import { getLaundryIssuePolicy } from '../policies/laundryIssue.policy'

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
  const [issues, setIssues] = useState<IssueReportDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiFailure['error'] | null>(null)

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
  }, [session, workId])

  useEffect(() => {
    void loadIssues()
  }, [loadIssues])

  const createIssue = useCallback(async (input: Omit<CreateLaundryIssueInput, 'workId' | 'meta'>) => {
    if (!policy.canCreate) return false
    setBusy(true)
    setError(null)
    const result = await laundryIssueApi.create({ ...input, workId, meta: createMeta('createLaundryIssue', session) })
    if (!result.ok) {
      setError(result.error)
      setBusy(false)
      return false
    }
    await loadIssues()
    setBusy(false)
    return true
  }, [loadIssues, policy.canCreate, session, workId])

  const updateIssue = useCallback(async (issueId: string | number, input: Omit<UpdateLaundryIssueInput, 'issueId' | 'meta'>) => {
    if (!policy.canUpdate) return false
    setBusy(true)
    setError(null)
    const result = await laundryIssueApi.update({ ...input, issueId, meta: createMeta('updateLaundryIssue', session) })
    if (!result.ok) {
      setError(result.error)
      setBusy(false)
      return false
    }
    await loadIssues()
    setBusy(false)
    return true
  }, [loadIssues, policy.canUpdate, session])

  const resolveIssue = useCallback(async (issueId: string | number, resolutionNote: string) => {
    if (!policy.canResolve) return false
    setBusy(true)
    setError(null)
    const result = await laundryIssueApi.resolve({ issueId, resolutionNote, meta: createMeta('resolveLaundryIssue', session) })
    if (!result.ok) {
      setError(result.error)
      setBusy(false)
      return false
    }
    await loadIssues()
    setBusy(false)
    return true
  }, [loadIssues, policy.canResolve, session])

  return { issues, loading, busy, error, policy, createIssue, updateIssue, resolveIssue, reload: loadIssues }
}
