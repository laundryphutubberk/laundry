import type { ApiResult, LaundryWorkRequestMeta } from './laundryWorkApi'
export type TimelineEntryDTO = { id: string; eventType: string; occurredAt: string; title: string; description?: string | null; actor?: string | null }
export async function getLaundryTimeline(workId: string | number, meta: LaundryWorkRequestMeta): Promise<ApiResult<TimelineEntryDTO[]>> {
  try {
    const headers = new Headers({ 'X-Request-Id': meta.requestId, 'X-Feature': 'laundry-timeline', 'X-Action': 'listTimeline' })
    if (meta.token) headers.set('Authorization', `Bearer ${meta.token}`)
    if (meta.workspaceType) headers.set('X-Workspace-Type', meta.workspaceType)
    if (meta.resortId) headers.set('X-Resort-Id', String(meta.resortId))
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/laundry/works/${workId}/timeline`, { headers })
    const envelope = await response.json().catch(() => ({})); const requestId = envelope?.meta?.requestId || meta.requestId
    if (!response.ok) return { ok: false, error: { code: envelope?.error?.code || `HTTP_${response.status}`, message: envelope?.error?.message || 'ไม่สามารถโหลดประวัติกิจกรรมได้', status: response.status, requestId }, meta: { requestId, receivedAt: new Date().toISOString(), source: 'backend' } }
    return { ok: true, data: envelope.data || [], meta: { requestId, receivedAt: new Date().toISOString(), source: 'backend' } }
  } catch (error) { return { ok: false, error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' }, meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized' } } }
}
