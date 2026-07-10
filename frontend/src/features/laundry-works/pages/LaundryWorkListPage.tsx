import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { getWorkspaceContext } from '../../auth/authSession'
import { laundryWorkApi, type ApiFailure, type LaundryWorkDTO, type LaundryWorkRequestMeta } from '../api/laundryWorkApi'
import { removeLaundryWork } from '../api/laundryWorkManagementApi'

const createRequestId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `lw-list-${Date.now()}`
}

const createRequestMeta = (
  sessionContext: ReturnType<typeof getWorkspaceContext>,
  action = 'listLaundryWorks',
): LaundryWorkRequestMeta => ({
  requestId: createRequestId(),
  feature: 'laundry-work',
  action,
  actorId: sessionContext.actorId,
  actorRole: sessionContext.actorRole,
  workspaceType: sessionContext.workspaceType,
  resortId: sessionContext.resortId || undefined,
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

const isDraftWork = (work?: LaundryWorkDTO | null) => work?.currentStatus === 'DRAFT'

export function LaundryWorkListPage() {
  const sessionContext = useMemo(() => getWorkspaceContext(), [])
  const [items, setItems] = useState<LaundryWorkDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiFailure['error'] | null>(null)
  const [requestId, setRequestId] = useState<string | undefined>()
  const [pendingRemoval, setPendingRemoval] = useState<LaundryWorkDTO | null>(null)
  const [removalReason, setRemovalReason] = useState('')
  const [removing, setRemoving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const canCreate = sessionContext.workspaceType === 'LAUNDRY'
  const canManage = ['LAUNDRY_OWNER', 'LAUNDRY_MANAGER'].includes(sessionContext.actorRole || '')

  const loadItems = useCallback(async () => {
    const meta = createRequestMeta(sessionContext)
    setLoading(true)
    setError(null)
    setRequestId(meta.requestId)

    const result = await laundryWorkApi.listLaundryWorks({ meta, take: 50 })
    setRequestId(result.meta.requestId)

    if (result.ok) {
      setItems(result.data.items)
      setError(null)
    } else {
      setItems([])
      setError(result.error)
    }

    setLoading(false)
  }, [sessionContext])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  useEffect(() => {
    if (!successMessage) return

    const timeoutId = window.setTimeout(() => setSuccessMessage(null), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [successMessage])

  const closeRemovalDialog = () => {
    if (removing) return
    setPendingRemoval(null)
    setRemovalReason('')
  }

  const confirmRemoval = async () => {
    if (!pendingRemoval || !removalReason.trim()) return

    const meta = createRequestMeta(sessionContext, 'deleteOrCancelLaundryWork')
    setRemoving(true)
    setError(null)
    setSuccessMessage(null)
    setRequestId(meta.requestId)

    const result = await removeLaundryWork({
      workId: pendingRemoval.id,
      reason: removalReason,
      meta,
    })

    setRequestId(result.meta.requestId)

    if (!result.ok) {
      setError(result.error)
      setRemoving(false)
      return
    }

    setSuccessMessage(result.data.action === 'DELETED' ? `ลบงาน ${pendingRemoval.workNo} สำเร็จ` : `ยกเลิกงาน ${pendingRemoval.workNo} เรียบร้อย`)
    setPendingRemoval(null)
    setRemovalReason('')
    await loadItems()
    setRemoving(false)
  }

  const pendingIsDraft = isDraftWork(pendingRemoval)

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
            {canCreate ? (
              <Link to="/workspace/laundry/works/new" className="rounded-2xl bg-blue-700 px-4 py-2 text-center text-sm font-black text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800">
                + สร้างงานซัก
              </Link>
            ) : null}
          </div>
        </section>

        {successMessage ? (
          <section className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-emerald-800 shadow-sm" role="status">
            <p className="text-sm font-bold">✓ {successMessage}</p>
            <button type="button" onClick={() => setSuccessMessage(null)} className="text-sm font-black text-emerald-700" aria-label="ปิดข้อความสำเร็จ">
              ×
            </button>
          </section>
        ) : null}

        {loading ? (
          <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">กำลังโหลดรายการงานซัก...</p>
          </section>
        ) : null}

        {error ? (
          <section className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-red-800 shadow-sm">
            <p className="text-base font-semibold">ไม่สามารถดำเนินการกับรายการงานซักได้</p>
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

        {!loading && items.length > 0 ? (
          <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-sm">
            <div className={`grid gap-4 border-b bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-500 max-lg:hidden ${canManage ? 'grid-cols-[minmax(0,1.3fr)_160px_140px_140px_100px]' : 'grid-cols-[minmax(0,1.3fr)_160px_140px_140px]'}`}>
              <span>Work</span>
              <span>Status</span>
              <span>Bags</span>
              <span>Updated</span>
              {canManage ? <span className="text-right">Manage</span> : null}
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((work) => (
                <div key={work.id} className={`grid gap-3 px-5 py-4 transition hover:bg-blue-50/70 lg:items-center ${canManage ? 'lg:grid-cols-[minmax(0,1.3fr)_160px_140px_140px_100px]' : 'lg:grid-cols-[minmax(0,1.3fr)_160px_140px_140px]'}`}>
                  <Link to={`/workspace/laundry/works/${work.id}`} className="min-w-0">
                    <p className="truncate text-base font-black text-slate-950">{work.workNo}</p>
                    <p className="mt-1 truncate text-sm font-medium text-slate-500">{work.resortName}</p>
                  </Link>
                  <p className="text-sm font-bold text-blue-700">{statusLabel(work.currentStatus)}</p>
                  <p className="text-sm font-semibold text-slate-600">{work.bagCount}</p>
                  <p className="text-sm font-semibold text-slate-500">{formatDate(work.updatedAt)}</p>
                  {canManage && !['CLOSED', 'CANCELLED'].includes(work.currentStatus) ? (
                    <button
                      type="button"
                      onClick={() => setPendingRemoval(work)}
                      className="justify-self-start rounded-xl border border-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 lg:justify-self-end"
                    >
                      {isDraftWork(work) ? 'ลบงาน' : 'ยกเลิกงาน'}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      {pendingRemoval ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" role="dialog" aria-modal="true" aria-labelledby="remove-work-title">
          <section className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <h2 id="remove-work-title" className="text-xl font-black text-slate-950">
              {pendingIsDraft ? 'ลบงาน' : 'ยกเลิกงาน'} {pendingRemoval.workNo}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {pendingIsDraft
                ? 'งานนี้ยังอยู่ในสถานะร่าง หากยังไม่มีข้อมูลการดำเนินงาน ระบบจะลบออกถาวร หากมีข้อมูลที่ต้องเก็บเป็นประวัติ Backend จะยกเลิกงานอย่างปลอดภัยแทน'
                : 'งานนี้เริ่มดำเนินการแล้ว ระบบจะเปลี่ยนสถานะเป็น CANCELLED และเก็บประวัติการทำงานไว้'}
            </p>
            <label className="mt-5 block text-sm font-bold text-slate-700">
              เหตุผล
              <textarea
                value={removalReason}
                onChange={(event) => setRemovalReason(event.target.value)}
                disabled={removing}
                rows={4}
                placeholder={pendingIsDraft ? 'เช่น สร้างรายการซ้ำหรือกรอกข้อมูลผิด' : 'เช่น ลูกค้ายกเลิกงานหรือรับรายการผิด'}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeRemovalDialog} disabled={removing} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
                กลับ
              </button>
              <button
                type="button"
                onClick={confirmRemoval}
                disabled={removing || !removalReason.trim()}
                className="rounded-xl bg-red-700 px-4 py-2 text-sm font-black text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {removing ? 'กำลังดำเนินการ...' : pendingIsDraft ? 'ยืนยันลบงาน' : 'ยืนยันยกเลิกงาน'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
