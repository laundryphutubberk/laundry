export type WorkspaceType = 'LAUNDRY' | 'RESORT'

export type LaundryWorkRequestMeta = {
  requestId: string
  feature: 'laundry-work'
  action: string
  actorId?: number | string
  actorRole?: string
  workspaceType: WorkspaceType
  resortId?: number
  createdAt: string
}

export type ApiSuccess<T> = {
  ok: true
  data: T
  meta: {
    requestId: string
    receivedAt: string
    source: 'backend' | 'client-normalized'
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
  }
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure

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

export type GetLaundryWorkDetailInput = {
  workId?: string | number
  meta: LaundryWorkRequestMeta
}

const createClientFailure = (requestId: string, code: string, message: string): ApiFailure => ({
  ok: false,
  error: {
    code,
    message,
    requestId,
    retryable: false,
  },
  meta: {
    requestId,
    receivedAt: new Date().toISOString(),
    source: 'client-normalized',
  },
})

const createMockDetail = (workId: string | number): LaundryWorkDetailDTO => ({
  work: {
    id: workId,
    workNo: `LW-${String(workId).padStart(4, '0')}`,
    resortId: 1,
    resortName: 'Demo Resort',
    bagCount: 3,
    currentStatus: 'BAG_RECEIVED',
    issueCount: 1,
    receivedDate: '2026-07-09',
    createdAt: '2026-07-09T08:00:00.000Z',
    updatedAt: '2026-07-09T09:00:00.000Z',
    note: 'Contract-safe mock detail from Laundry Work API boundary.',
  },
  bags: [
    { id: 'bag-1', bagNo: 'BAG-001', status: 'RECEIVED' },
    { id: 'bag-2', bagNo: 'BAG-002', status: 'RECEIVED' },
    { id: 'bag-3', bagNo: 'BAG-003', status: 'RECEIVED' },
  ],
  countLines: [
    { id: 'line-1', itemTypeName: 'ผ้าปูที่นอน', category: 'linen', colorGroup: 'white', quantity: 12, weight: '-' },
    { id: 'line-2', itemTypeName: 'ปลอกหมอน', category: 'linen', colorGroup: 'white', quantity: 24, weight: '-' },
  ],
  issues: [
    {
      id: 'issue-1',
      issueType: 'COUNT_MISMATCH',
      description: 'จำนวนที่นับได้ไม่ตรงกับบันทึกหน้าถุง',
      quantity: 1,
      itemTypeName: 'ผ้าปูที่นอน',
      status: 'OPEN',
      reportedAt: '2026-07-09T09:00:00.000Z',
      reportedBy: 'System Mock',
    },
  ],
  statusLogs: [
    { id: 'log-1', toStatus: 'BAG_RECEIVED', changedAt: '2026-07-09T08:00:00.000Z', changedByName: 'System Mock' },
  ],
})

export const laundryWorkApi = {
  async getLaundryWorkDetail({ workId, meta }: GetLaundryWorkDetailInput): Promise<ApiResult<LaundryWorkDetailDTO>> {
    if (!meta.workspaceType) {
      return createClientFailure(meta.requestId, 'MISSING_WORKSPACE_SCOPE', 'Missing workspace scope for Laundry Work detail.')
    }

    if (meta.workspaceType === 'RESORT' && !meta.resortId) {
      return createClientFailure(meta.requestId, 'MISSING_RESORT_SCOPE', 'Missing resortId for Resort Workspace request.')
    }

    if (!workId) {
      return createClientFailure(meta.requestId, 'MISSING_WORK_ID', 'Missing Laundry Work id.')
    }

    return {
      ok: true,
      data: createMockDetail(workId),
      meta: {
        requestId: meta.requestId,
        receivedAt: new Date().toISOString(),
        source: 'client-normalized',
      },
    }
  },
}
