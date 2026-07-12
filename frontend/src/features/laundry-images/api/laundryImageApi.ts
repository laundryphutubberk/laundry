import type { ApiResult, LaundryWorkRequestMeta } from '../../laundry-works/api/laundryWorkApi'

export type LaundryImageDTO = {
  id: string | number
  workId: string | number
  resortId: string | number
  url: string
  publicId?: string | null
  provider: string
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

export type CreateLaundryImageInput = {
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

export type UpdateLaundryImageInput = {
  imageId?: string | number
  caption?: string | null
  displayOrder?: number
  meta: LaundryWorkRequestMeta
}

export type LaundryImageMutationInput = {
  imageId?: string | number
  meta: LaundryWorkRequestMeta
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function getToken(meta: LaundryWorkRequestMeta) {
  return meta.token
}

function createClientFailure<T>(meta: LaundryWorkRequestMeta, code: string, message: string): ApiResult<T> {
  return {
    ok: false,
    error: {
      code,
      message,
      requestId: meta.requestId,
      retryable: false,
    },
    meta: {
      requestId: meta.requestId,
      receivedAt: new Date().toISOString(),
      source: 'client-normalized',
    },
  }
}

async function request<T>(path: string, meta: LaundryWorkRequestMeta, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const headers = new Headers(init.headers)
    headers.set('Content-Type', 'application/json')
    headers.set('X-Request-Id', meta.requestId)
    headers.set('X-Feature', 'laundry-image')
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
          code: envelope?.error?.code || 'IMAGE_REQUEST_FAILED',
          message: envelope?.error?.message || response.statusText || 'Laundry Image request failed.',
          status: envelope?.error?.statusCode || response.status,
          fieldErrors: envelope?.error?.details?.fieldErrors,
          requestId,
          retryable: response.status >= 500,
        },
        meta: {
          requestId,
          receivedAt: new Date().toISOString(),
          source: 'backend',
        },
      }
    }

    return {
      ok: true,
      data: envelope.data as T,
      meta: {
        requestId,
        receivedAt: new Date().toISOString(),
        source: 'backend',
      },
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
      meta: {
        requestId: meta.requestId,
        receivedAt: new Date().toISOString(),
        source: 'client-normalized',
      },
    }
  }
}

export const laundryImageApi = {
  capability: {
    list: true,
    create: true,
    update: true,
    setCover: true,
    softDelete: true,
    binaryUpload: false,
  } as const,

  list({ workId, meta }: { workId?: string | number; meta: LaundryWorkRequestMeta }) {
    if (!workId) return Promise.resolve(createClientFailure<LaundryImageDTO[]>(meta, 'MISSING_WORK_ID', 'Missing Laundry Work id.'))
    return request<LaundryImageDTO[]>(`/laundry/works/${workId}/images`, meta)
  },

  create({ workId, meta, ...input }: CreateLaundryImageInput) {
    if (!workId) return Promise.resolve(createClientFailure<LaundryImageDTO>(meta, 'MISSING_WORK_ID', 'Missing Laundry Work id.'))
    if (!input.url.trim()) return Promise.resolve(createClientFailure<LaundryImageDTO>(meta, 'VALIDATION_ERROR', 'Image URL is required.'))

    return request<LaundryImageDTO>(`/laundry/works/${workId}/images`, meta, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  update({ imageId, meta, ...input }: UpdateLaundryImageInput) {
    if (!imageId) return Promise.resolve(createClientFailure<LaundryImageDTO>(meta, 'MISSING_IMAGE_ID', 'Missing Laundry Image id.'))

    return request<LaundryImageDTO>(`/laundry/images/${imageId}`, meta, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  },

  setCover({ imageId, meta }: LaundryImageMutationInput) {
    if (!imageId) return Promise.resolve(createClientFailure<LaundryImageDTO>(meta, 'MISSING_IMAGE_ID', 'Missing Laundry Image id.'))

    return request<LaundryImageDTO>(`/laundry/images/${imageId}/cover`, meta, {
      method: 'PATCH',
    })
  },

  softDelete({ imageId, meta }: LaundryImageMutationInput) {
    if (!imageId) return Promise.resolve(createClientFailure<LaundryImageDTO>(meta, 'MISSING_IMAGE_ID', 'Missing Laundry Image id.'))

    return request<LaundryImageDTO>(`/laundry/images/${imageId}`, meta, {
      method: 'DELETE',
    })
  },
}
