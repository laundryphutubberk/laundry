import { FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getWorkspaceContext } from '../../auth/authSession'
import { laundryWorkApi, type ApiFailure, type LaundryWorkRequestMeta } from '../api/laundryWorkApi'

const createRequestId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `lw-create-${Date.now()}`
}

const createRequestMeta = (sessionContext: ReturnType<typeof getWorkspaceContext>): LaundryWorkRequestMeta => ({
  requestId: createRequestId(),
  feature: 'laundry-work',
  action: 'createLaundryWork',
  actorId: sessionContext.actorId,
  actorRole: sessionContext.actorRole,
  workspaceType: sessionContext.workspaceType,
  resortId: sessionContext.resortId || undefined,
  token: sessionContext.token,
  createdAt: new Date().toISOString(),
})

function toIsoDateTime(value: string) {
  if (!value) return undefined

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined

  return date.toISOString()
}

export function LaundryWorkCreatePage() {
  const navigate = useNavigate()
  const sessionContext = useMemo(() => getWorkspaceContext(), [])
  const [resortId, setResortId] = useState(sessionContext.resortId ? String(sessionContext.resortId) : '1')
  const [workNo, setWorkNo] = useState('')
  const [bagCount, setBagCount] = useState('0')
  const [receivedDate, setReceivedDate] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiFailure['error'] | null>(null)
  const [requestId, setRequestId] = useState<string | undefined>()

  const canCreate = sessionContext.workspaceType === 'LAUNDRY'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedResortId = Number(resortId)
    const parsedBagCount = Number(bagCount)

    const meta = createRequestMeta(sessionContext)
    setLoading(true)
    setError(null)
    setRequestId(meta.requestId)

    const result = await laundryWorkApi.createLaundryWork({
      meta,
      resortId: parsedResortId,
      workNo: workNo.trim() || undefined,
      bagCount: Number.isFinite(parsedBagCount) ? parsedBagCount : 0,
      receivedDate: toIsoDateTime(receivedDate),
      note: note.trim() || undefined,
      currentStatus: 'DRAFT',
    })

    setRequestId(result.meta.requestId)

    if (!result.ok) {
      setError(result.error)
      setLoading(false)
      return
    }

    navigate(`/workspace/laundry/works/${result.data.id}`, { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100/70">
      <main className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-4 py-5 md:px-6 lg:px-8 xl:px-10">
        <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-blue-700">Laundry Workspace</p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-950">สร้าง Laundry Work</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">เริ่มรอบงานซักใหม่สำหรับรีสอร์ต/ลูกค้า</p>
            </div>
            <Link to="/workspace/laundry/works" className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-200">
              กลับรายการงาน
            </Link>
          </div>
        </section>

        {!canCreate ? (
          <section className="rounded-[28px] border border-amber-100 bg-amber-50 p-6 text-amber-800 shadow-sm">
            <p className="text-base font-bold">ไม่สามารถสร้างงานซักจาก workspace นี้ได้</p>
            <p className="mt-2 text-sm">Create Work เปิดใช้งานเฉพาะ Laundry Workspace ตาม backend capability ปัจจุบัน</p>
          </section>
        ) : null}

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/70 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Resort ID</span>
              <input
                type="number"
                min="1"
                value={resortId}
                onChange={(event) => setResortId(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
                disabled={!canCreate || loading}
              />
              <p className="mt-2 text-xs font-semibold text-slate-400">ชั่วคราวใช้ Resort ID จาก backend contract จนกว่าจะมี Resort selector</p>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Work No</span>
              <input
                type="text"
                value={workNo}
                onChange={(event) => setWorkNo(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="ปล่อยว่างให้ backend สร้าง"
                disabled={!canCreate || loading}
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">จำนวนถุง</span>
              <input
                type="number"
                min="0"
                value={bagCount}
                onChange={(event) => setBagCount(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                disabled={!canCreate || loading}
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">วันที่รับงาน</span>
              <input
                type="datetime-local"
                value={receivedDate}
                onChange={(event) => setReceivedDate(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                disabled={!canCreate || loading}
              />
            </label>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-bold text-slate-700">หมายเหตุ</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              disabled={!canCreate || loading}
            />
          </label>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <p>{error.message}</p>
              {requestId ? <p className="mt-1 text-xs">requestId: {requestId}</p> : null}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link to="/workspace/laundry/works" className="rounded-2xl bg-slate-100 px-5 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-200">
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={!canCreate || loading}
              className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'กำลังสร้างงาน...' : 'สร้างงานซัก'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
