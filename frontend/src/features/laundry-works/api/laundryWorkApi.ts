export type WorkspaceType = 'LAUNDRY' | 'RESORT'

export type LaundryWorkRequestMeta = {
  requestId: string
  feature: 'laundry-work'
  action: string
  actorId?: number | string
  actorRole?: string
  workspaceType?: WorkspaceType
  resortId?: number
  token?: string
  createdAt: string
}

export type ApiSuccess<T> = {
  ok: true
  data: T
  meta: {
    requestId: string
    receivedAt: string
    source: 'backend' | 'client-normalized'
    capability?: LaundryWorkBackendCapability
    pagination?: {
      total?: number
      skip?: number
      take?: number
    }
  }
}

export type ApiFailure = {
  ok: false
  error: {
    code: string
    message: string
    status?: number
    fieldErrors?: Record<string, string[]>
    requestId?: string
    retryable?: boolean
  }
  meta: {
    requestId: string
    receivedAt: string
    source: 'backend' | 'client-normalized'
    capability?: LaundryWorkBackendCapability
  }
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure

export type LaundryWorkBackendCapability = {
  list: true
  detail: true
  create: true
  statusTransition: true
  bags: {
    list: true
    detail: true
    create: true
  }
  countLines: {
    list: true
    create: true
    update: true
    delete: true
  }
  issue: {
    list: false
    create: false
    resolve: false
  }
  image: {
    list: true
    registerMetadata: true
    update: true
    setCover: true
    softDelete: true
    binaryUploadAdapter: false
  }
  history: {
    fromDetailStatusLogs: true
    dedicatedEndpoint: false
  }
}

export const laundryWorkBackendCapability: LaundryWorkBackendCapability = {
  list: true,
  detail: true,
  create: true,
  statusTransition: true,
  bags: {
    list: true,
    detail: true,
    create: true,
  },
  countLines: {
    list: true,
    create: true,
    update: true,
    delete: true,
  },
  issue: {
    list: false,
    create: false,
    resolve: false,
  },
  image: {
    list: true,
    registerMetadata: true,
    update: true,
    setCover: true,
    softDelete: true,
    binaryUploadAdapter: false,
  },
  history: {
    fromDetailStatusLogs: true,
    dedicatedEndpoint: false,
  },
}

export type LaundryWorkDTO = {
  id: string | number
  workNo: string
  resortId: string | number
  resortName: string
  bagCount: number
  currentStatus: string
  issueCount: number
  receivedDate?: string
  returnedAt?: string | null
  closedAt?: string | null
  createdAt?: string
  updatedAt?: string
  note?: string | null
}

export type LaundryBagDTO = {
  id: string | number
  bagNo: string
  status: string
  note?: string | null
  receivedAt?: string | null
  openedAt?: string | null
}

export type LaundryCountLineDTO = {
  id: string | number
  bagId?: string | number | null
  bagNo?: string
  itemTypeName?: string
  category?: string
  colorGroup?: string
  quantity: number
  weight?: string | number | null
  issueQuantity?: number
  note?: string | null
}

export type IssueReportDTO = {
  id: string | number
  issueType: string
  description?: string | null
  quantity?: number
  itemTypeName?: string
  status: string
  reportedAt?: string
  reportedBy?: string
}

export type LaundryWorkImageDTO = {
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
  uploadedAt?: string | null
  deletedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type WorkStatusLogDTO = {
  id: string | number
  toStatus: string
  note?: string | null
  changedAt?: string
  changedByName?: string
}

export type LaundryWorkDetailDTO = {
  work: LaundryWorkDTO
  bags: LaundryBagDTO[]
  countLines: LaundryCountLineDTO[]
  issues: IssueReportDTO[]
  images?: LaundryWorkImageDTO[]
  statusLogs: WorkStatusLogDTO[]
}

export type LaundryWorkListResult = {
  items: LaundryWorkDTO[]
  pagination?: {
    total?: number
    skip?: number
    take?: number
  }
}

export type GetLaundryWorkDetailInput = {
  workId?: string | number
  meta: LaundryWorkRequestMeta
}

export type ListLaundryWorksInput = {
  status?: string
  skip?: number
  take?: number
  meta: LaundryWorkRequestMeta
}

export type CreateLaundryWorkInput = {
  resortId: number
  workNo?: string
  bagCount?: number
  receivedDate?: string
  note?: string
  currentStatus?: string
  meta: LaundryWorkRequestMeta
}

export type CreateLaundryBagInput = {
  workId?: string | number
  bagNo: string
  receivedAt?: string
  note?: string
  meta: LaundryWorkRequestMeta
}

export type ListLaundryCountLinesInput = {
  workId?: string | number
  bagId?: string | number
  skip?: number
  take?: number
  meta: LaundryWorkRequestMeta
}

export type CreateLaundryCountLineInput = {
  workId?: string | number
  bagId?: string | number
  itemTypeName: string
  colorGroup?: string
  quantity: number
  note?: string
  meta: LaundryWorkRequestMeta
}

export type UpdateLaundryCountLineInput = {
  lineId?: string | number
  bagId?: string | number | null
  itemTypeName?: string
  colorGroup?: string | null
  quantity?: number
  note?: string | null
  meta: LaundryWorkRequestMeta
}

export type DeleteLaundryCountLineInput = {
  lineId?: string | number
  meta: LaundryWorkRequestMeta
}

export type UpdateLaundryWorkStatusInput = {
  workId?: string | number
  toStatus: string
  note?: string
  changedById?: number
  changedByName?: string
  meta: LaundryWorkRequestMeta
}

type BackendEnvelope<T> = {
  success?: boolean
  data?: T
  error?: {
    code?: string
    message?: string
    statusCode?: number
    details?: {
      fieldErrors?: Record<string, string[]>
    }
  }
  meta?: {
    requestId?: string
    pagination?: {
      total?: number
      skip?: number
      take?: number
    }
  }
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
    const envelope = await response.json().catch(() => ({})) as BackendEnvelope<T>
    const requestId = envelope.meta?.requestId || meta.requestId

    if (!response.ok || envelope.success === false) {
      return {
        ok: false,
        error: {
          code: envelope.error?.code || 'LAUNDRY_WORK_REQUEST_FAILED',
          message: envelope.error?.message || response.statusText || 'Laundry Work request failed.',
          status: envelope.error?.statusCode || response.status,
          fieldErrors: envelope.error?.details?.fieldErrors,
          requestId,
          retryable: response.status >= 500,
        },
        meta: { requestId, receivedAt: new Date().toISOString(), source: 'backend', capability: laundryWorkBackendCapability },
      }
    }

    return {
      ok: true,
      data: envelope.data as T,
      meta: {
        requestId,
        receivedAt: new Date().toISOString(),
        source: 'backend',
        capability: laundryWorkBackendCapability,
        pagination: envelope.meta?.pagination,
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
      meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized', capability: laundryWorkBackendCapability },
    }
  }
}

function missingIdResult<T>(code: string, message: string, meta: LaundryWorkRequestMeta): ApiResult<T> {
  return {
    ok: false,
    error: { code, message, requestId: meta.requestId },
    meta: { requestId: meta.requestId, receivedAt: new Date().toISOString(), source: 'client-normalized', capability: laundryWorkBackendCapability },
  }
}

export const laundryWorkApi = {
  capability: laundryWorkBackendCapability,

  list({ status, skip, take, meta }: ListLaundryWorksInput) {
    const query = new URLSearchParams()
    if (status) query.set('status', status)
    if (skip !== undefined) query.set('skip', String(skip))
    if (take !== undefined) query.set('take', String(take))
    const suffix = query.size ? `?${query.toString()}` : ''
    return request<LaundryWorkListResult>(`/laundry/works${suffix}`, meta)
  },

  detail({ workId, meta }: GetLaundryWorkDetailInput) {
    if (!workId) return Promise.resolve(missingIdResult<LaundryWorkDetailDTO>('MISSING_WORK_ID', 'Missing Laundry Work id.', meta))
    return request<LaundryWorkDetailDTO>(`/laundry/works/${workId}`, meta)
  },

  create({ meta, ...input }: CreateLaundryWorkInput) {
    return request<LaundryWorkDTO>('/laundry/works', meta, { method: 'POST', body: JSON.stringify(input) })
  },

  createBag({ workId, meta, ...input }: CreateLaundryBagInput) {
    if (!workId) return Promise.resolve(missingIdResult<LaundryBagDTO>('MISSING_WORK_ID', 'Missing Laundry Work id.', meta))
    return request<LaundryBagDTO>(`/laundry/works/${workId}/bags`, meta, { method: 'POST', body: JSON.stringify(input) })
  },

  listCountLines({ workId, bagId, skip, take, meta }: ListLaundryCountLinesInput) {
    if (!workId) return Promise.resolve(missingIdResult<LaundryCountLineDTO[]>('MISSING_WORK_ID', 'Missing Laundry Work id.', meta))
    const query = new URLSearchParams()
    if (bagId !== undefined) query.set('bagId', String(bagId))
    if (skip !== undefined) query.set('skip', String(skip))
    if (take !== undefined) query.set('take', String(take))
    const suffix = query.size ? `?${query.toString()}` : ''
    return request<LaundryCountLineDTO[]>(`/laundry/works/${workId}/count-lines${suffix}`, meta)
  },

  createCountLine({ workId, meta, ...input }: CreateLaundryCountLineInput) {
    if (!workId) return Promise.resolve(missingIdResult<LaundryCountLineDTO>('MISSING_WORK_ID', 'Missing Laundry Work id.', meta))
    return request<LaundryCountLineDTO>(`/laundry/works/${workId}/count-lines`, meta, { method: 'POST', body: JSON.stringify(input) })
  },

  updateCountLine({ lineId, meta, ...input }: UpdateLaundryCountLineInput) {
    if (!lineId) return Promise.resolve(missingIdResult<LaundryCountLineDTO>('MISSING_COUNT_LINE_ID', 'Missing Laundry Count Line id.', meta))
    return request<LaundryCountLineDTO>(`/laundry/count-lines/${lineId}`, meta, { method: 'PATCH', body: JSON.stringify(input) })
  },

  deleteCountLine({ lineId, meta }: DeleteLaundryCountLineInput) {
    if (!lineId) return Promise.resolve(missingIdResult<{ id: string | number; deleted: boolean }>('MISSING_COUNT_LINE_ID', 'Missing Laundry Count Line id.', meta))
    return request<{ id: string | number; deleted: boolean }>(`/laundry/count-lines/${lineId}`, meta, { method: 'DELETE' })
  },

  updateStatus({ workId, meta, ...input }: UpdateLaundryWorkStatusInput) {
    if (!workId) return Promise.resolve(missingIdResult<LaundryWorkDTO>('MISSING_WORK_ID', 'Missing Laundry Work id.', meta))
    return request<LaundryWorkDTO>(`/laundry/works/${workId}/status`, meta, { method: 'PATCH', body: JSON.stringify(input) })
  },
}
