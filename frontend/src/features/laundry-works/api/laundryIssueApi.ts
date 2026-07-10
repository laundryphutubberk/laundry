import type { ApiResult, IssueReportDTO, LaundryWorkRequestMeta } from './laundryWorkApi'

export type CreateLaundryIssueInput = {
  workId?: string | number
  itemTypeId?: string | number
  colorGroup?: string
  issueType: 'DAMAGED' | 'MISSING' | 'COUNT_MISMATCH' | 'RETURN_MISMATCH' | 'OTHER'
  quantity: number
  description: string
  meta: LaundryWorkRequestMeta
}

export type UpdateLaundryIssueInput = Partial<Omit<CreateLaundryIssueInput, 'workId' | 'meta'>> & {
  issueId?: string | number
  status?: 'OPEN' | 'REVIEWING' | 'CANCELLED'
  meta: LaundryWorkRequestMeta
}

export type ResolveLaundryIssueInput = {
  issueId?: string | number
  resolutionNote: string
  meta: LaundryWorkRequestMeta
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function getToken(meta: LaundryWorkRequestMeta) {
  return meta.token || window.localStorage.getItem('laundry.auth.token') || window.localStorage.getItem('authToken') || window.localStorage.getItem('token') || undefined
}

async function request<T>(path: string, meta: LaundryWorkRequestMeta, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const headers = new Headers(init.headers)
    headers.set('Content-Type', 'application/json')
    headers.set('X-Request-Id', meta.requestId)
    headers.set('X-Feature', meta.feature)
    headers.set('X-Action', meta.action)
    const token = getToken(meta)
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (meta.workspaceType) headers.set('X-Workspace-Type', meta.workspaceType)
    if (meta.resortId) headers.set('X-Resort-Id', String(meta.resortId))

    const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
    const envelope = await response.json().catch(() => ({}))
    const requestId = envelope?.meta?.requestId || meta.requestId

    if (!response.ok || envelope?.success === false) {
      return {
        ok: false,
        error: {
          code: envelope?.error?.code || 'ISSUE_REQUEST_FAILED',
          message: envelope?.error?.message || response.statusText || 'Laundry Issue request failed.',
          status: envelope?.error?.statusCode || response.status,
          fieldErrors: envelope?.error?.details?.fieldErrors,
          requestId,
          retryable: response.status >= 500,
        },
        meta: { requestId, receivedAt: new Date().toISOString(), source: 'backend' },
      }
    }

    return {
      ok: true,
      data: envelope.data as T,
      meta: { requestId, receivedAt: new Date().toISOString(), source: 'backend' },
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed.',
        requestId: meta.requestId,
        retryable: true,
      },
      meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized' },
    }
  }
}

export const laundryIssueApi = {
  capability: {
    list: true,
    create: true,
    update: true,
    resolve: true,
  } as const,

  list({ workId, meta }: { workId?: string | number; meta: LaundryWorkRequestMeta }) {
    if (!workId) return Promise.resolve({ ok: false, error: { code: 'MISSING_WORK_ID', message: 'Missing Laundry Work id.' }, meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized' } } as ApiResult<IssueReportDTO[]>)
    return request<IssueReportDTO[]>(`/laundry/works/${workId}/issues`, meta)
  },

  create({ workId, meta, ...input }: CreateLaundryIssueInput) {
    if (!workId) return Promise.resolve({ ok: false, error: { code: 'MISSING_WORK_ID', message: 'Missing Laundry Work id.' }, meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized' } } as ApiResult<IssueReportDTO>)
    return request<IssueReportDTO>(`/laundry/works/${workId}/issues`, meta, { method: 'POST', body: JSON.stringify(input) })
  },

  update({ issueId, meta, ...input }: UpdateLaundryIssueInput) {
    if (!issueId) return Promise.resolve({ ok: false, error: { code: 'MISSING_ISSUE_ID', message: 'Missing Laundry Issue id.' }, meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized' } } as ApiResult<IssueReportDTO>)
    return request<IssueReportDTO>(`/laundry/issues/${issueId}`, meta, { method: 'PATCH', body: JSON.stringify(input) })
  },

  resolve({ issueId, meta, resolutionNote }: ResolveLaundryIssueInput) {
    if (!issueId) return Promise.resolve({ ok: false, error: { code: 'MISSING_ISSUE_ID', message: 'Missing Laundry Issue id.' }, meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized' } } as ApiResult<IssueReportDTO>)
    return request<IssueReportDTO>(`/laundry/issues/${issueId}/resolve`, meta, { method: 'PATCH', body: JSON.stringify({ resolutionNote }) })
  },
}
