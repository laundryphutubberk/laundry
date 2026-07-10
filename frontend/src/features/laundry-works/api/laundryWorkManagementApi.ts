import type { ApiResult, LaundryWorkDTO, LaundryWorkRequestMeta } from './laundryWorkApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export type RemoveLaundryWorkResult = {
  action: 'DELETED' | 'CANCELLED'
  work: LaundryWorkDTO
}

export type RemoveLaundryWorkInput = {
  workId: string | number
  reason: string
  meta: LaundryWorkRequestMeta
}

export async function removeLaundryWork({ workId, reason, meta }: RemoveLaundryWorkInput): Promise<ApiResult<RemoveLaundryWorkResult>> {
  const requestId = meta.requestId

  if (!workId) {
    return {
      ok: false,
      error: {
        code: 'MISSING_WORK_ID',
        message: 'Missing Laundry Work id.',
        status: 400,
        requestId,
        retryable: false,
      },
      meta: {
        requestId,
        receivedAt: new Date().toISOString(),
        source: 'client-normalized',
      },
    }
  }

  if (!reason.trim()) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'กรุณาระบุเหตุผลในการลบหรือยกเลิกงาน',
        status: 400,
        requestId,
        retryable: false,
      },
      meta: {
        requestId,
        receivedAt: new Date().toISOString(),
        source: 'client-normalized',
      },
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/laundry/works/${workId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${meta.token || ''}`,
        'X-Request-Id': requestId,
        'X-Feature': meta.feature,
        'X-Action': meta.action,
        ...(meta.workspaceType ? { 'X-Workspace-Type': meta.workspaceType } : {}),
        ...(meta.resortId ? { 'X-Resort-Id': String(meta.resortId) } : {}),
      },
      body: JSON.stringify({ reason: reason.trim() }),
    })

    const envelope = await response.json().catch(() => ({}))
    const responseRequestId = envelope.meta?.requestId || requestId

    if (!response.ok || envelope.success === false) {
      return {
        ok: false,
        error: {
          code: envelope.error?.code || 'REMOVE_WORK_FAILED',
          message: envelope.error?.message || response.statusText || 'ไม่สามารถลบหรือยกเลิกงานได้',
          status: envelope.error?.statusCode || response.status,
          requestId: responseRequestId,
          retryable: response.status >= 500,
        },
        meta: {
          requestId: responseRequestId,
          receivedAt: new Date().toISOString(),
          source: 'backend',
        },
      }
    }

    return {
      ok: true,
      data: envelope.data as RemoveLaundryWorkResult,
      meta: {
        requestId: responseRequestId,
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
        requestId,
        retryable: true,
      },
      meta: {
        requestId,
        receivedAt: new Date().toISOString(),
        source: 'client-normalized',
      },
    }
  }
}
