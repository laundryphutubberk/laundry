import type { ApiResult, LaundryWorkRequestMeta } from './laundryWorkApi'

export type LaundryWorkImageDTO = {
  id: string | number
  workId: string | number
  resortId: string | number
  url: string
  publicId?: string | null
  provider?: string
  mimeType?: string | null
  originalName?: string | null
  sizeBytes?: number | null
  caption?: string | null
  displayOrder: number
  isCover: boolean
  uploadedById?: string | number | null
  uploadedAt?: string
  deletedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ListLaundryWorkImagesInput = { workId?: string | number; meta: LaundryWorkRequestMeta }
export type RegisterLaundryWorkImageInput = {
  workId?: string | number
  url: string
  publicId?: string
  provider?: string
  mimeType?: string
  originalName?: string
  sizeBytes?: number
  caption?: string
  displayOrder?: number
  isCover?: boolean
  meta: LaundryWorkRequestMeta
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const capability = {
  list: true,
  upload: true,
  updateCaption: true,
  setCover: true,
  softDelete: true,
} as const

function buildMeta(requestId: string, source: 'backend' | 'client-normalized' = 'client-normalized') {
  return { requestId, receivedAt: new Date().toISOString(), source, capability }
}

function getAuthToken(meta: LaundryWorkRequestMeta) {
  if (meta.token) return meta.token
  if (typeof window === 'undefined') return undefined
  return window.localStorage.getItem('laundry.auth.token') || window.localStorage.getItem('authToken') || window.localStorage.getItem('token') || undefined
}

function normalizeImage(raw: any): LaundryWorkImageDTO {
  return {
    id: raw.id,
    workId: raw.workId,
    resortId: raw.resortId,
    url: raw.url,
    publicId: raw.publicId,
    provider: raw.provider,
    mimeType: raw.mimeType,
    originalName: raw.originalName,
    sizeBytes: raw.sizeBytes,
    caption: raw.caption,
    displayOrder: Number(raw.displayOrder || 0),
    isCover: Boolean(raw.isCover),
    uploadedById: raw.uploadedById,
    uploadedAt: raw.uploadedAt,
    deletedAt: raw.deletedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

async function request<T>(path: string, meta: LaundryWorkRequestMeta, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const headers = new Headers(init.headers)
    const token = getAuthToken(meta)
    headers.set('Content-Type', 'application/json')
    headers.set('X-Request-Id', meta.requestId)
    headers.set('X-Feature', 'laundry-image')
    headers.set('X-Action', meta.action)
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
          code: envelope?.error?.code || `HTTP_${response.status}`,
          message: envelope?.error?.message || response.statusText || 'Laundry Image request failed.',
          status: envelope?.error?.statusCode || response.status,
          fieldErrors: envelope?.error?.details?.fieldErrors,
          requestId,
          retryable: response.status >= 500,
        },
        meta: buildMeta(requestId, 'backend'),
      }
    }

    return { ok: true, data: envelope.data as T, meta: buildMeta(requestId, 'backend') }
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed.',
        requestId: meta.requestId,
        retryable: true,
      },
      meta: buildMeta(meta.requestId),
    }
  }
}

export const laundryImageApi = {
  capability,

  async list({ workId, meta }: ListLaundryWorkImagesInput): Promise<ApiResult<LaundryWorkImageDTO[]>> {
    if (!workId) return request('/laundry/works/0/images', meta)
    const result = await request<any[]>(`/laundry/works/${workId}/images`, meta)
    return result.ok ? { ...result, data: (result.data || []).filter((image) => !image?.deletedAt).map(normalizeImage) } : result
  },

  async register({ workId, meta, ...input }: RegisterLaundryWorkImageInput): Promise<ApiResult<LaundryWorkImageDTO>> {
    const result = await request<any>(`/laundry/works/${workId}/images`, meta, { method: 'POST', body: JSON.stringify(input) })
    return result.ok ? { ...result, data: normalizeImage(result.data) } : result
  },

  async update(imageId: string | number, input: { caption?: string | null; displayOrder?: number }, meta: LaundryWorkRequestMeta): Promise<ApiResult<LaundryWorkImageDTO>> {
    const result = await request<any>(`/laundry/images/${imageId}`, meta, { method: 'PATCH', body: JSON.stringify(input) })
    return result.ok ? { ...result, data: normalizeImage(result.data) } : result
  },

  async setCover(imageId: string | number, meta: LaundryWorkRequestMeta): Promise<ApiResult<LaundryWorkImageDTO>> {
    const result = await request<any>(`/laundry/images/${imageId}/cover`, meta, { method: 'PATCH', body: '{}' })
    return result.ok ? { ...result, data: normalizeImage(result.data) } : result
  },

  async softDelete(imageId: string | number, meta: LaundryWorkRequestMeta): Promise<ApiResult<{ deleted: true }>> {
    return request(`/laundry/images/${imageId}`, meta, { method: 'DELETE' })
  },
}
