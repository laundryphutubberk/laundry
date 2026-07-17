import type { ApiResult, LaundryWorkRequestMeta } from './laundryWorkApi'
import { authenticatedFetch } from '../../auth/authApi'

export type InboundCustodyProfile = 'RESORT_SELF_DELIVERY'
export type InboundTrackingLevel = 'COUNT_ONLY'
export type InboundCustodyStatus = 'PENDING' | 'RECEIPT_CONFIRMED' | 'COUNT_EVIDENCE_RECORDED' | 'CLOSED'

export type InboundCustodyDTO = {
  id: string | number
  workId: string | number
  resortId: string | number
  profile: InboundCustodyProfile
  trackingLevel: InboundTrackingLevel
  status: InboundCustodyStatus
  receiptConfirmedAt?: string | null
  receiptConfirmedById?: string | number | null
  countEvidenceRecordedAt?: string | null
  countEvidenceRecordedById?: string | number | null
  countTotalItems: number
  closedAt?: string | null
  closedById?: string | number | null
  version: number
  createdAt: string
  updatedAt: string
}

export type InboundCustodyDetailDTO = {
  work: {
    id: string | number
    workNo: string
    resortId: string | number
    resortName: string
    currentStatus: string
  }
  custody: InboundCustodyDTO | null
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request<T>(
  path: string,
  meta: LaundryWorkRequestMeta,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  try {
    const headers = new Headers(init.headers)
    headers.set('Content-Type', 'application/json')
    headers.set('X-Request-Id', meta.requestId)
    headers.set('X-Feature', meta.feature)
    headers.set('X-Action', meta.action)
    const token = meta.token
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (meta.workspaceType) headers.set('X-Workspace-Type', meta.workspaceType)
    if (meta.resortId) headers.set('X-Resort-Id', String(meta.resortId))

    const response = await authenticatedFetch(`${API_BASE_URL}${path}`, { ...init, headers })
    const body = await response.json().catch(() => ({}))
    const requestId = body?.meta?.requestId || meta.requestId

    if (!response.ok) {
      return {
        ok: false,
        error: {
          code: body?.error?.code || `HTTP_${response.status}`,
          message: body?.error?.message || 'Inbound Custody request failed',
          status: response.status,
          requestId,
        },
        meta: { requestId, receivedAt: new Date().toISOString(), source: 'backend' },
      }
    }

    return {
      ok: true,
      data: body.data as T,
      meta: { requestId, receivedAt: new Date().toISOString(), source: 'backend' },
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
        requestId: meta.requestId,
      },
      meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized' },
    }
  }
}

export const inboundCustodyApi = {
  getCustody(workId: string | number, meta: LaundryWorkRequestMeta): Promise<ApiResult<InboundCustodyDetailDTO>> {
    return request<InboundCustodyDetailDTO>(`/laundry/works/${workId}/custody`, meta)
  },

  initiateCustody(workId: string | number, meta: LaundryWorkRequestMeta): Promise<ApiResult<InboundCustodyDTO>> {
    return request<InboundCustodyDTO>(`/laundry/works/${workId}/custody/initiate`, meta, { method: 'POST' })
  },

  confirmReceipt(workId: string | number, meta: LaundryWorkRequestMeta): Promise<ApiResult<InboundCustodyDTO>> {
    return request<InboundCustodyDTO>(`/laundry/works/${workId}/custody/confirm-receipt`, meta, { method: 'POST' })
  },

  recordCountEvidence(
    workId: string | number,
    payload: { countTotalItems?: number },
    meta: LaundryWorkRequestMeta,
  ): Promise<ApiResult<InboundCustodyDTO>> {
    return request<InboundCustodyDTO>(`/laundry/works/${workId}/custody/record-count-evidence`, meta, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  closeCustody(workId: string | number, meta: LaundryWorkRequestMeta): Promise<ApiResult<InboundCustodyDTO>> {
    return request<InboundCustodyDTO>(`/laundry/works/${workId}/custody/close`, meta, { method: 'POST' })
  },
}
