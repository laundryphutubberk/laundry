import { getWorkspaceContext } from '../auth/authSession'
import { authenticatedFetch } from '../auth/authApi'

type ApiEnvelope<T> = {
  success?: boolean
  data?: T
  error?: { message?: string }
  meta?: { pagination?: { total?: number; skip?: number; take?: number } }
}

export type LaundryItemTypeDTO = {
  id: number
  name: string
  category?: string | null
  weightPerPieceKg?: string | number | null
  active: boolean
}

export type LaundryItemTypeInput = {
  name?: string
  category?: string | null
  weightPerPieceKg?: number | null
  active?: boolean
}

export type ItemCatalogListOptions = {
  search?: string
  active?: boolean | 'all'
  skip?: number
  take?: number
}

type Pagination = { total?: number; skip?: number; take?: number }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function requestId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `catalog-${Date.now()}`
}

function headers() {
  const session = getWorkspaceContext()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.token}`,
    'X-Request-Id': requestId(),
    'X-Feature': 'item-catalog',
  }
}

async function parse<T>(response: Response, fallback: string): Promise<ApiEnvelope<T>> {
  const envelope = (await response.json().catch(() => ({}))) as ApiEnvelope<T>
  if (!response.ok || envelope.success === false) throw new Error(envelope.error?.message || fallback)
  return envelope
}

export async function listLaundryItemTypes(options: ItemCatalogListOptions = {}): Promise<{ items: LaundryItemTypeDTO[]; pagination?: Pagination }> {
  const params = new URLSearchParams()
  if (options.search?.trim()) params.set('search', options.search.trim())
  if (options.active === 'all') params.set('active', 'all')
  else if (typeof options.active === 'boolean') params.set('active', String(options.active))
  params.set('skip', String(Math.max(0, options.skip || 0)))
  params.set('take', String(options.take || 20))
  const envelope = await parse<LaundryItemTypeDTO[]>(await authenticatedFetch(`${API_BASE_URL}/laundry/item-types?${params}`, { headers: headers() }), 'Unable to load Laundry Item Types')
  return { items: envelope.data || [], pagination: envelope.meta?.pagination }
}

export async function createLaundryItemType(input: LaundryItemTypeInput & { name: string }) {
  const response = await authenticatedFetch(`${API_BASE_URL}/laundry/item-types`, { method: 'POST', headers: headers(), body: JSON.stringify(input) })
  return (await parse<LaundryItemTypeDTO>(response, 'Unable to create Laundry Item Type')).data as LaundryItemTypeDTO
}

export async function updateLaundryItemType(itemTypeId: number, input: LaundryItemTypeInput) {
  const response = await authenticatedFetch(`${API_BASE_URL}/laundry/item-types/${itemTypeId}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(input) })
  return (await parse<LaundryItemTypeDTO>(response, 'Unable to update Laundry Item Type')).data as LaundryItemTypeDTO
}
