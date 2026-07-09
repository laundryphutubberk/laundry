import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import { laundryWorkApi, type ApiFailure, type LaundryWorkDTO, type LaundryWorkRequestMeta, type WorkspaceType } from '../api/laundryWorkApi'

type LaundryWorkSessionContext = {
  token?: string
  actorId?: number | string
  actorRole?: string
  workspaceType?: WorkspaceType
  resortId?: number
}

const createRequestId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `lw-list-${Date.now()}`
}

const readStoredToken = () => {
  if (typeof window === 'undefined') return undefined

  return (
    window.localStorage.getItem('laundry.auth.token') ||
    window.localStorage.getItem('authToken') ||
    window.localStorage.getItem('token') ||
    undefined
  )
}

const decodeJwtPayload = (token?: string) => {
  if (!token || typeof window === 'undefined') return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    return JSON.parse(window.atob(padded)) as Record<string, unknown>
  } catch (_error) {
    return null
  }
}

const readLaundryWorkSessionContext = (): LaundryWorkSessionContext => {
  const token = readStoredToken()
  const payload = decodeJwtPayload(token)
  const workspaceType = payload?.workspaceType === 'LAUNDRY' || payload?.workspaceType === 'RESORT' ? payload.workspaceType : undefined
  const rawResortId = payload?.resortId
  const resortId = rawResortId === undefined || rawResortId === null ? undefined : Number(rawResortId)

  return {
    token,
    actorId: (payload?.userId || payload?.id) as string | number | undefined,
    actorRole: payload?.role as string | undefined,
    workspaceType,
    resortId: Number.isInteger(resortId) && resortId > 0 ? resortId : undefined,
  }
}

const createRequestMeta = (sessionContext: LaundryWorkSessionContext): LaundryWorkRequestMeta => ({
  requestId: createRequestId(),
  feature: 'laundry-work',
  action: 'listLaundryWorks',
  actorId: sessionContext.actorId,
  actorRole: sessionContext.actorRole,
  workspaceType: sessionContext.workspaceType,
  resortId: sessionContext.resortId,
  token: sessionContext.token,
  createdAt: new Date().toISOString(),
})

function formatDate(value?: string | null) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    DRAFT: 'ร่างงาน',
    BAG_RECEIVED: 'รับถุงแล้ว',
    FACTORY_RECEIVED: 'โรงซักรับแล้ว',
    BAG_OPENED: 'เปิดถุงแล้ว',
    ITEM_COUNTED: 'นับชิ้นแล้ว',
    TYPE_SORTED: 'แยกประเภทแล้ว',
    COLOR_SORTED: 'แยกสีแล้ว',
    DATA_RECORDED: 'บันทึกข้อมูลแล้ว',
    RETURNED: 'ส่งกลับแล้ว',
    CLOSED: 'ปิดงานแล้ว',
    CANCELLED: 'ยกเลิก',
  }

  return labels[status || ''] || status || 'ไม่ระบุสถานะ'
}

export function LaundryWorkListPage() {
  const sessionContext = useMemo(() => readLaundryWorkSessionContext(), [])
  const [items, setItems] = useState<LaundryWorkDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiFailure['error'] | null>(null)
  const [requestId, setRequestId] = useState<string | undefined>()

  useEffect(() => {
    let active = true
    const meta = createRequestMeta(sessionContext)

    setLoading(true)
    setError(null)
    setRequestId(meta.requestId)

    laundryWorkApi.listLaundryWorks({ meta, take: 50 }).then((result) => {
      if (!active) return

      setRequestId(result.meta.requestId)

      if (result.ok) {
        setItems(result.data.items)
        setError(null)
      } else {
        setItems([])
        setError(result.error)
      }

      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [sessionContext])

  return (
    <div className="min-h-screen bg-slate-100/70">
      <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 md:px-6 lg:px-8 xl:px-10">
        <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-blue-700">Laundry Workspace</p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-950">Laundry Work</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">รายการงานซักทั้งหมดใน workspace ที่ actor มีสิทธิ์เห็น</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
              {sessionContext.workspaceType || 'No workspace'}{sessionContext.resortId ? ` · Resort ${sessionContext.resortId}` : ''}
            </div>
          </div>
        </section>

        {loading ? (
          <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">กำลังโหลดรายการงานซัก...</p>
          </section>
        ) : null}

        {error ? (
          <section className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-red-800 shadow-sm">
            <p className="text-base font-semibold">ไม่สามารถโหลดรายการงานซักได้</p>
            <p className="mt-2 text-sm">{error.message}</p>
            {requestId ? <p className="mt-3 text-xs text-red-600">requestId: {requestId}</p> : null}
          </section>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-sm">
            <p className="text-base font-bold text-slate-950">ยังไม่มี Laundry Work</p>
            <p className="mt-2 text-sm text-slate-500">เมื่อ backend มีงานซักใน workspace นี้ รายการจะแสดงที่นี่</p>
          </section>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-sm">
            <div className="grid grid-cols-[minmax(0,1.3fr)_160px_140px_140px] gap-4 border-b bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-500 max-lg:hidden">
              <span>Work</span>
              <span>Status</span>
              <span>Bags</span>
              <span>Updated</span>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((work) => (
                <Link
                  key={work.id}
                  to={`/workspace/laundry/works/${work.id}`}
                  className="grid gap-3 px-5 py-4 text-left transition hover:bg-blue-50/70 lg:grid-cols-[minmax(0,1.3fr)_160px_140px_140px] lg:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-slate-950">{work.workNo}</p>
                    <p className="mt-1 truncate text-sm font-medium text-slate-500">{work.resortName}</p>
                  </div>
                  <p className="text-sm font-bold text-blue-700">{statusLabel(work.currentStatus)}</p>
                  <p className="text-sm font-semibold text-slate-600">{work.bagCount}</p>
                  <p className="text-sm font-semibold text-slate-500">{formatDate(work.updatedAt)}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}
