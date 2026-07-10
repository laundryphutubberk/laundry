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

export type ListLaundryWorkImagesInput = {
  workId?: string | number
  meta: LaundryWorkRequestMeta
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const capability = {
  list: true,
  upload: false,
  updateCaption: false,
  setCover: false,
  softDelete: false,
} as const

function buildMeta(requestId: string, source: 'backend' | 'client-normalized' = 'client-normalized') {
  return {
    requestId,
    receivedAt: new Date().toISOString(),
    source,
    capability,
  }
}

function getAuthToken(meta: LaundryWorkRequestMeta) {
  if (meta.token) return meta.token
  if (typeof window === 'undefined') return undefined

  return (
    window.localStorage.getItem('laundry.auth.token') ||
    window.localStorage.getItem('authToken') ||
    window.localStorage.getItem('token') ||
    undefined
  )
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

async function list({ workId, meta }: ListLaundryWorkImagesInput): Promise<ApiResult<LaundryWorkImageDTO[]>> {
  if (!workId) {
    return {
      ok: false,
      error: {
        code: 'MISSING_WORK_ID',
        message: 'Missing Laundry Work id.',
        requestId: meta.requestId,
        retryable: false,
      },
      meta: buildMeta(meta.requestId),
    }
  }

  try {
    const headers = new Headers()
    const token = getAuthToken(meta)

    headers.set('Content-Type', 'application/json')
    headers.set('X-Request-Id', meta.requestId)
    headers.set('X-Feature', meta.feature)
    headers.set('X-Action', meta.action)
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (meta.workspaceType) headers.set('X-Workspace-Type', meta.workspaceType)
    if (meta.resortId) headers.set('X-Resort-Id', String(meta.resortId))

    const response = await fetch(`${API_BASE_URL}/laundry/works/${workId}`, { headers })
    const envelope = await response.json().catch(() => ({}))
    const requestId = envelope?.meta?.requestId || meta.requestId

    if (!response.ok || envelope?.success === false) {
      return {
        ok: false,
        error: {
          code: envelope?.error?.code || 'LAUNDRY_IMAGE_LIST_FAILED',
          message: envelope?.error?.message || response.statusText || 'Unable to load Laundry Work images.',
          status: envelope?.error?.statusCode || response.status,
          fieldErrors: envelope?.error?.details?.fieldErrors,
          requestId,
          retryable: response.status >= 500,
        },
        meta: buildMeta(requestId, 'backend'),
      }
    }

    const images = Array.isArray(envelope?.data?.images)
      ? envelope.data.images.filter((image: any) => !image?.deletedAt).map(normalizeImage)
      : []

    return {
      ok: true,
      data: images,
      meta: buildMeta(requestId, 'backend'),
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
      meta: buildMeta(meta.requestId),
    }
  }
}

export const laundryImageApi = {
  capability,
  list,
}
