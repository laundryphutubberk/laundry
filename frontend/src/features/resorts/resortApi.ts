import { getWorkspaceContext } from '../auth/authSession'
import { authenticatedFetch } from '../auth/authApi'

type ApiEnvelope<T> = {
  success?: boolean
  data?: T
  error?: {
    message?: string
    statusCode?: number
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

export type ResortDTO = {
  id: number
  name: string
  contactName?: string | null
  contactPhone?: string | null
  address?: string | null
  active: boolean
}

export type ResortListResult = {
  items: ResortDTO[]
  pagination?: {
    total?: number
    skip?: number
    take?: number
  }
}

export type ResortInput = {
  name?: string
  contactName?: string
  contactPhone?: string
  address?: string
  active?: boolean
}

export type ResortListOptions = {
  search?: string
  active?: boolean
  skip?: number
  take?: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function createRequestId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `resort-${Date.now()}`
}

async function requestResort<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getWorkspaceContext()
  const headers = new Headers(init.headers)

  headers.set('Content-Type', 'application/json')
  headers.set('X-Request-Id', createRequestId())
  headers.set('X-Feature', 'resorts')
  if (session.token) headers.set('Authorization', `Bearer ${session.token}`)
  if (session.workspaceType) headers.set('X-Workspace-Type', session.workspaceType)

  const response = await authenticatedFetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })
  const envelope = (await response.json().catch(() => ({}))) as ApiEnvelope<T>

  if (!response.ok || envelope.success === false) {
    throw new Error(envelope.error?.message || response.statusText || 'Resort request failed')
  }

  return envelope.data as T
}

export async function listResorts(options: ResortListOptions = { active: true }): Promise<ResortListResult> {
  const params = new URLSearchParams()
  if (options.search?.trim()) params.set('search', options.search.trim())
  if (typeof options.active === 'boolean') params.set('active', String(options.active))
  params.set('skip', String(Math.max(0, options.skip || 0)))
  params.set('take', String(options.take || 50))

  const response = await authenticatedFetch(`${API_BASE_URL}/resorts?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${getWorkspaceContext().token}`,
      'X-Request-Id': createRequestId(),
      'X-Feature': 'resorts',
    },
  })
  const envelope = (await response.json().catch(() => ({}))) as ApiEnvelope<ResortDTO[]>

  if (!response.ok || envelope.success === false) {
    throw new Error(envelope.error?.message || response.statusText || 'Unable to load resorts')
  }

  return {
    items: envelope.data || [],
    pagination: envelope.meta?.pagination,
  }
}

export async function createResort(input: ResortInput & { name: string }): Promise<ResortDTO> {
  return requestResort<ResortDTO>('/resorts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateResort(resortId: number, input: ResortInput): Promise<ResortDTO> {
  return requestResort<ResortDTO>(`/resorts/${resortId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}
