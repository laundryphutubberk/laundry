import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getWorkspaceContext } from '../../auth/authSession'
import { laundryIssueApi, type CreateLaundryIssueInput, type UpdateLaundryIssueInput } from '../api/laundryIssueApi'
import type { LaundryWorkRequestMeta } from '../api/laundryWorkApi'
import { getLaundryIssuePolicy } from '../policies/laundryIssue.policy'
import type { MutationFeedbackModel } from '../runtime/mutationFeedback.model'
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

const notifyLaundryWorkIssueChanged = (workId?: string | number) => {
  if (!workId || typeof window === 'undefined') return

  window.dispatchEvent(new CustomEvent('laundry-work:issue-changed', {
    detail: { workId: String(workId) },
  }))
}

export function useLaundryIssueController({ workId, workStatus }: { workId?: string | number; workStatus?: string }) {
  const session = useMemo(() => getWorkspaceContext(), [])
  const mutationInFlightRef = useRef(false)
  const [mutationFeedback, setMutationFeedback] = useState<MutationFeedbackModel | null>(null)
  const issues = useLaundryIssueStore((state) => state.issues)
  const loading = useLaundryIssueStore((state) => state.loading)
  const busy = useLaundryIssueStore((state) => state.busy)
  const error = useLaundryIssueStore((state) => state.error)
  const setIssues = useLaundryIssueStore((state) => state.setIssues)
  const setLoading = useLaundryIssueStore((state) => state.setLoading)
  const setBusy = useLaundryIssueStore((state) => state.setBusy)
  const setError = useLaundryIssueStore((state) => state.setError)
  const reset = useLaundryIssueStore((state) => state.reset)

  const dismissMutationFeedback = useCallback(() => setMutationFeedback(null), [])

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

  useEffect(() => {
    if (mutationFeedback?.tone !== 'success') return
    const timeoutId = window.setTimeout(() => setMutationFeedback(null), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [mutationFeedback])

  const createIssue = useCallback(async (input: Omit<CreateLaundryIssueInput, 'workId' | 'meta'>) => {
    if (!policy.canCreate || busy || mutationInFlightRef.current) return false
    mutationInFlightRef.current = true
    setBusy(true)
    setError(null)
    setMutationFeedback(null)
    try {
      const result = await laundryIssueApi.create({ ...input, workId, meta: createMeta('createLaundryIssue', session) })
      if (!result.ok) {
        setError(result.error)
        setMutationFeedback({
          tone: 'error',
          title: 'เพิ่มปัญหาไม่สำเร็จ',
          message: result.error.message,
          requestId: result.error.requestId,
          onDismiss: dismissMutationFeedback,
        })
        return false
      }
      await loadIssues()
      notifyLaundryWorkIssueChanged(workId)
      setMutationFeedback({ tone: 'success', title: 'เพิ่มปัญหาเรียบร้อย', onDismiss: dismissMutationFeedback })
      return true
    } finally {
      mutationInFlightRef.current = false
      setBusy(false)
    }
  }, [busy, dismissMutationFeedback, loadIssues, policy.canCreate, session, setBusy, setError, workId])

  const updateIssue = useCallback(async (issueId: string | number, input: Omit<UpdateLaundryIssueInput, 'issueId' | 'meta'>) => {
    if (!policy.canUpdate || busy || mutationInFlightRef.current) return false
    mutationInFlightRef.current = true
    setBusy(true)
    setError(null)
    setMutationFeedback(null)
    const cancelling = input.status === 'CANCELLED'
    try {
      const result = await laundryIssueApi.update({ ...input, issueId, meta: createMeta('updateLaundryIssue', session) })
      if (!result.ok) {
        setError(result.error)
        setMutationFeedback({
          tone: 'error',
          title: cancelling ? 'ยกเลิกปัญหาไม่สำเร็จ' : 'บันทึกการแก้ไขไม่สำเร็จ',
          message: result.error.message,
          requestId: result.error.requestId,
          onDismiss: dismissMutationFeedback,
        })
        return false
      }
      await loadIssues()
      notifyLaundryWorkIssueChanged(workId)
      setMutationFeedback({
        tone: 'success',
        title: cancelling ? 'ยกเลิกปัญหาเรียบร้อย' : 'บันทึกการแก้ไขเรียบร้อย',
        onDismiss: dismissMutationFeedback,
      })
      return true
    } finally {
      mutationInFlightRef.current = false
      setBusy(false)
    }
  }, [busy, dismissMutationFeedback, loadIssues, policy.canUpdate, session, setBusy, setError, workId])

  const resolveIssue = useCallback(async (issueId: string | number, resolutionNote: string) => {
    if (!policy.canResolve || busy || mutationInFlightRef.current) return false
    mutationInFlightRef.current = true
    setBusy(true)
    setError(null)
    setMutationFeedback(null)
    try {
      const result = await laundryIssueApi.resolve({ issueId, resolutionNote, meta: createMeta('resolveLaundryIssue', session) })
      if (!result.ok) {
        setError(result.error)
        setMutationFeedback({
          tone: 'error',
          title: 'ปิดปัญหาไม่สำเร็จ',
          message: result.error.message,
          requestId: result.error.requestId,
          onDismiss: dismissMutationFeedback,
        })
        return false
      }
      await loadIssues()
      notifyLaundryWorkIssueChanged(workId)
      setMutationFeedback({ tone: 'success', title: 'ปิดปัญหาเรียบร้อย', onDismiss: dismissMutationFeedback })
      return true
    } finally {
      mutationInFlightRef.current = false
      setBusy(false)
    }
  }, [busy, dismissMutationFeedback, loadIssues, policy.canResolve, session, setBusy, setError, workId])

  return {
    issues,
    loading,
    busy,
    error,
    mutationFeedback,
    policy,
    createIssue,
    updateIssue,
    resolveIssue,
    dismissMutationFeedback,
    reload: loadIssues,
  }
}
