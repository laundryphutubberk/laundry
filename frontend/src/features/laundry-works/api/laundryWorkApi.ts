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
  issue: {
    list: false
    create: false
    resolve: false
  }
  image: {
    list: false
    upload: false
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
  issue: {
    list: false,
    create: false,
    resolve: false,
  },
  image: {
    list: false,
    upload: false,
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
  itemTypeName?: string
  category?: string
  colorGroup?: string
  quantity: number
  weight?: string | number | null
  issueQuantity?: number
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
    message?: string
    statusCode?: number
    code?: string
    details?: {
      fieldErrors?: Record<string, string[]>
      formErrors?: string[]
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

function buildMeta(requestId: string, source: 'backend' | 'client-normalized' = 'client-normalized', extra?: BackendEnvelope<unknown>['meta']) {
  return {
    requestId: extra?.requestId || requestId,
    receivedAt: new Date().toISOString(),
    source,
    capability: laundryWorkBackendCapability,
    ...(extra?.pagination ? { pagination: extra.pagination } : {}),
  }
}

const createClientFailure = (requestId: string, code: string, message: string, status?: number): ApiFailure => ({
  ok: false,
  error: {
    code,
    message,
    requestId,
    status,
    retryable: false,
  },
  meta: buildMeta(requestId),
})

function normalizeStatusToCode(status: number) {
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 409) return 'CONFLICT'
  if (status === 400 || status === 422) return 'VALIDATION_ERROR'
  if (status >= 500) return 'SERVER_ERROR'
  return 'UNKNOWN_ERROR'
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

function assertRequestContext(meta: LaundryWorkRequestMeta): ApiFailure | null {
  if (!meta.workspaceType) {
    return createClientFailure(meta.requestId, 'MISSING_WORKSPACE_SCOPE', 'Missing workspace scope for Laundry Work request.')
  }

  if (meta.workspaceType === 'RESORT' && !meta.resortId) {
    return createClientFailure(meta.requestId, 'MISSING_RESORT_SCOPE', 'Missing resortId for Resort Workspace request.')
  }

  if (!getAuthToken(meta)) {
    return createClientFailure(meta.requestId, 'UNAUTHORIZED', 'Bearer token is required for Laundry Work backend endpoints.', 401)
  }

  return null
}

async function requestBackend<T>(path: string, meta: LaundryWorkRequestMeta, init: RequestInit = {}): Promise<ApiResult<T>> {
  const contextFailure = assertRequestContext(meta)
  if (contextFailure) return contextFailure

  try {
    const headers = new Headers(init.headers)
    headers.set('Content-Type', 'application/json')
    headers.set('Authorization', `Bearer ${getAuthToken(meta)}`)
    headers.set('X-Request-Id', meta.requestId)
    headers.set('X-Feature', meta.feature)
    headers.set('X-Action', meta.action)
    if (meta.workspaceType) headers.set('X-Workspace-Type', meta.workspaceType)
    if (meta.resortId) headers.set('X-Resort-Id', String(meta.resortId))

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    })
    const envelope = (await response.json().catch(() => ({}))) as BackendEnvelope<T>

    if (!response.ok || envelope.success === false) {
      const status = envelope.error?.statusCode || response.status
      const requestId = envelope.meta?.requestId || meta.requestId
      return {
        ok: false,
        error: {
          code: envelope.error?.code || normalizeStatusToCode(status),
          message: envelope.error?.message || response.statusText || 'Laundry Work request failed.',
          status,
          fieldErrors: envelope.error?.details?.fieldErrors,
          requestId,
          retryable: status >= 500,
        },
        meta: buildMeta(requestId, 'backend', envelope.meta),
      }
    }

    return {
      ok: true,
      data: envelope.data as T,
      meta: buildMeta(envelope.meta?.requestId || meta.requestId, 'backend', envelope.meta),
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

function normalizeWork(raw: any): LaundryWorkDTO {
  return {
    id: raw.id,
    workNo: raw.workNo,
    resortId: raw.resortId,
    resortName: raw.resortName || raw.resort?.name || '-',
    bagCount: raw.bagCount ?? raw._count?.bags ?? 0,
    currentStatus: raw.currentStatus,
    issueCount: raw.issueCount ?? raw._count?.issues ?? 0,
    receivedDate: raw.receivedDate,
    returnedAt: raw.returnedAt,
    closedAt: raw.closedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    note: raw.note,
  }
}

function normalizeDetail(raw: any): LaundryWorkDetailDTO {
  return {
    work: normalizeWork(raw),
    bags: (raw.bags || []).map((bag: any) => ({
      id: bag.id,
      bagNo: bag.bagNo,
      status: bag.status,
      note: bag.note,
      receivedAt: bag.receivedAt,
      openedAt: bag.openedAt,
    })),
    countLines: (raw.countLines || []).map((line: any) => ({
      id: line.id,
      itemTypeName: line.itemTypeName || line.itemType?.name,
      category: line.category || line.itemType?.category,
      colorGroup: line.colorGroup,
      quantity: line.quantity,
      issueQuantity: line.issueQuantity,
      weight: line.weight,
    })),
    issues: (raw.issues || []).map((issue: any) => ({
      id: issue.id,
      issueType: issue.issueType,
      description: issue.description,
      quantity: issue.quantity,
      itemTypeName: issue.itemTypeName || issue.itemType?.name,
      status: issue.status,
      reportedAt: issue.reportedAt,
      reportedBy: issue.reportedBy || issue.reportedByName,
    })),
    statusLogs: (raw.statusLogs || []).map((log: any) => ({
      id: log.id,
      toStatus: log.toStatus,
      note: log.note,
      changedAt: log.changedAt,
      changedByName: log.changedByName,
    })),
  }
}

function mapResult<TInput, TOutput>(result: ApiResult<TInput>, mapper: (input: TInput) => TOutput): ApiResult<TOutput> {
  if (!result.ok) return result
  return {
    ...result,
    data: mapper(result.data),
  }
}

export const laundryWorkApi = {
  capability: laundryWorkBackendCapability,

  async listLaundryWorks({ status, skip, take, meta }: ListLaundryWorksInput): Promise<ApiResult<LaundryWorkListResult>> {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (skip !== undefined) params.set('skip', String(skip))
    if (take !== undefined) params.set('take', String(take))

    const result = await requestBackend<any[]>(`/laundry/works${params.toString() ? `?${params.toString()}` : ''}`, meta)
    return mapResult(result, (items) => ({
      items: (items || []).map(normalizeWork),
      pagination: result.meta.pagination,
    }))
  },

  async getLaundryWorkDetail({ workId, meta }: GetLaundryWorkDetailInput): Promise<ApiResult<LaundryWorkDetailDTO>> {
    if (!workId) {
      return createClientFailure(meta.requestId, 'MISSING_WORK_ID', 'Missing Laundry Work id.', 400)
    }

    const result = await requestBackend<any>(`/laundry/works/${workId}`, meta)
    return mapResult(result, normalizeDetail)
  },

  async updateLaundryWorkStatus({
    workId,
    toStatus,
    note,
    changedById,
    changedByName,
    meta,
  }: UpdateLaundryWorkStatusInput): Promise<ApiResult<LaundryWorkDTO>> {
    if (!workId) {
      return createClientFailure(meta.requestId, 'MISSING_WORK_ID', 'Missing Laundry Work id.', 400)
    }

    if (!toStatus) {
      return createClientFailure(meta.requestId, 'VALIDATION_ERROR', 'toStatus is required.', 400)
    }

    const result = await requestBackend<any>(`/laundry/works/${workId}/status`, meta, {
      method: 'PATCH',
      body: JSON.stringify({ toStatus, note, changedById, changedByName }),
    })
    return mapResult(result, normalizeWork)
  },
}
