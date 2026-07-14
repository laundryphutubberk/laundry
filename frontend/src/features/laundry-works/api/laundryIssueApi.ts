import type { ApiResult, IssueReportDTO, LaundryWorkRequestMeta } from './laundryWorkApi'
import { authenticatedFetch } from '../../auth/authApi'

export type LaundryIssueDTO = IssueReportDTO & {
  workId?: string | number
  resortId?: string | number
  bagId?: string | number | null
  countLineId?: string | number | null
  itemType?: {
    id?: string | number
    name?: string
    category?: string | null
  } | null
  resolvedAt?: string | null
  reportedAt?: string
  work?: { id?: string | number; workNo?: string; currentStatus?: string } | null
  resort?: { id?: string | number; name?: string } | null
  reportedBy?: { id?: string | number; displayName?: string; role?: string } | null
  claim?: { id?: string | number; status?: string } | null
}

export type GlobalLaundryIssueFilters = {
  search?: string
  status?: string
  issueType?: string
  active?: 'true' | 'false'
  skip?: number
  take?: number
  meta: LaundryWorkRequestMeta
}

export type CreateLaundryIssueInput = {
  workId?: string | number
  bagId?: string | number
  countLineId?: string | number
  itemTypeId?: string | number
  colorGroup?: string
  issueType: 'DAMAGED' | 'MISSING' | 'COUNT_MISMATCH' | 'RETURN_MISMATCH' | 'OTHER'
  quantity: number
  description: string
  meta: LaundryWorkRequestMeta
}

export type UpdateLaundryIssueInput = Partial<Omit<CreateLaundryIssueInput, 'workId' | 'meta'>> & {
  issueId?: string | number
  bagId?: string | number | null
  countLineId?: string | number | null
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
  return meta.token
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

    const response = await authenticatedFetch(`${API_BASE_URL}${path}`, { ...init, headers })
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
      meta: { requestId, receivedAt: new Date().toISOString(), source: 'backend', pagination: envelope?.meta?.pagination },
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
    globalList: true,
    reopen: true,
  } as const,

  list({ workId, meta }: { workId?: string | number; meta: LaundryWorkRequestMeta }) {
    if (!workId) return Promise.resolve({ ok: false, error: { code: 'MISSING_WORK_ID', message: 'Missing Laundry Work id.' }, meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized' } } as ApiResult<LaundryIssueDTO[]>)
    return request<LaundryIssueDTO[]>(`/laundry/works/${workId}/issues`, meta)
  },

  listGlobal({ meta, ...filters }: GlobalLaundryIssueFilters) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value))
    })
    return request<LaundryIssueDTO[]>(`/laundry/issues?${params}`, meta)
  },

  create({ workId, meta, ...input }: CreateLaundryIssueInput) {
    if (!workId) return Promise.resolve({ ok: false, error: { code: 'MISSING_WORK_ID', message: 'Missing Laundry Work id.' }, meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized' } } as ApiResult<LaundryIssueDTO>)
    return request<LaundryIssueDTO>(`/laundry/works/${workId}/issues`, meta, { method: 'POST', body: JSON.stringify(input) })
  },

  update({ issueId, meta, ...input }: UpdateLaundryIssueInput) {
    if (!issueId) return Promise.resolve({ ok: false, error: { code: 'MISSING_ISSUE_ID', message: 'Missing Laundry Issue id.' }, meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized' } } as ApiResult<LaundryIssueDTO>)
    return request<LaundryIssueDTO>(`/laundry/issues/${issueId}`, meta, { method: 'PATCH', body: JSON.stringify(input) })
  },

  resolve({ issueId, meta, resolutionNote }: ResolveLaundryIssueInput) {
    if (!issueId) return Promise.resolve({ ok: false, error: { code: 'MISSING_ISSUE_ID', message: 'Missing Laundry Issue id.' }, meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized' } } as ApiResult<LaundryIssueDTO>)
    return request<LaundryIssueDTO>(`/laundry/issues/${issueId}/resolve`, meta, { method: 'PATCH', body: JSON.stringify({ resolutionNote }) })
  },

  reopen({ issueId, meta }: { issueId?: string | number; meta: LaundryWorkRequestMeta }) {
    if (!issueId) return Promise.resolve({ ok: false, error: { code: 'MISSING_ISSUE_ID', message: 'Missing Laundry Issue id.' }, meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized' } } as ApiResult<LaundryIssueDTO>)
    return request<LaundryIssueDTO>(`/laundry/issues/${issueId}/reopen`, meta, { method: 'PATCH', body: '{}' })
  },
}
