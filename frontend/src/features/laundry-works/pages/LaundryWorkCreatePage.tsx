import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getWorkspaceContext } from '../../auth/authSession'
import { createResort, listResorts, type ResortDTO } from '../../resorts/resortApi'
import { laundryWorkApi, type ApiFailure, type LaundryWorkRequestMeta } from '../api/laundryWorkApi'

const createRequestId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `lw-create-${Date.now()}`
}

const createRequestMeta = (
  sessionContext: ReturnType<typeof getWorkspaceContext>,
  action: LaundryWorkRequestMeta['action'] = 'createLaundryWork',
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

function toIsoDateTime(value: string) {
  if (!value) return undefined

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined

  return date.toISOString()
}

function formatBagNo(workNo: string, index: number) {
  return `${workNo}-BAG-${String(index).padStart(3, '0')}`
}

export function LaundryWorkCreatePage() {
  const navigate = useNavigate()
  const sessionContext = useMemo(() => getWorkspaceContext(), [])
  const [resorts, setResorts] = useState<ResortDTO[]>([])
  const [resortId, setResortId] = useState('')
  const [newResortName, setNewResortName] = useState('')
  const [workNo, setWorkNo] = useState('')
  const [bagCount, setBagCount] = useState('0')
  const [receivedDate, setReceivedDate] = useState('')
  const [note, setNote] = useState('')
  const [loadingResorts, setLoadingResorts] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiFailure['error'] | null>(null)
  const [resortError, setResortError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | undefined>()

  const canCreate = sessionContext.workspaceType === 'LAUNDRY'

  useEffect(() => {
    let active = true

    async function loadResorts() {
      setLoadingResorts(true)
      setResortError(null)

      try {
        const result = await listResorts()
        if (!active) return
        setResorts(result.items)
        setResortId((current) => current || result.items[0]?.id?.toString() || '')
      } catch (loadError) {
        if (!active) return
        setResortError(loadError instanceof Error ? loadError.message : 'Unable to load resorts')
      } finally {
        if (active) setLoadingResorts(false)
      }
    }

    void loadResorts()

    return () => {
      active = false
    }
  }, [])

  async function resolveResortId() {
    if (resortId) return Number(resortId)

    const name = newResortName.trim()
    if (!name) {
      throw new Error('กรุณาเลือกรีสอร์ต หรือสร้างรีสอร์ตใหม่ก่อน')
    }

    const resort = await createResort({ name })
    setResorts((current) => [...current, resort])
    setResortId(String(resort.id))
    return resort.id
  }

  async function createInitialBags(workId: string | number, generatedWorkNo: string, count: number) {
    for (let index = 1; index <= count; index += 1) {
      const meta = createRequestMeta(sessionContext, 'createLaundryBag')
      const result = await laundryWorkApi.createLaundryBag({
        workId,
        bagNo: formatBagNo(generatedWorkNo, index),
        receivedAt: receivedDate ? toIsoDateTime(receivedDate) : new Date().toISOString(),
        meta,
      })

      setRequestId(result.meta.requestId)

      if (!result.ok) {
        throw new Error(result.error.message)
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedBagCount = Math.max(0, Number(bagCount) || 0)
    const meta = createRequestMeta(sessionContext)
    setLoading(true)
    setError(null)
    setResortError(null)
    setRequestId(meta.requestId)

    try {
      const parsedResortId = await resolveResortId()
      const result = await laundryWorkApi.createLaundryWork({
        meta,
        resortId: parsedResortId,
        workNo: workNo.trim() || undefined,
        bagCount: 0,
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

      if (parsedBagCount > 0) {
        await createInitialBags(result.data.id, result.data.workNo, parsedBagCount)
      }

      navigate(`/workspace/laundry/works/${result.data.id}`, { replace: true })
    } catch (createError) {
      setResortError(createError instanceof Error ? createError.message : 'Unable to create Laundry Work')
      setLoading(false)
    }
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
              <span className="text-sm font-bold text-slate-700">รีสอร์ต / ลูกค้า</span>
              <select
                value={resortId}
                onChange={(event) => setResortId(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                disabled={!canCreate || loading || loadingResorts}
              >
                <option value="">{loadingResorts ? 'กำลังโหลดรีสอร์ต...' : 'สร้างรีสอร์ตใหม่ด้านล่าง'}</option>
                {resorts.map((resort) => (
                  <option key={resort.id} value={resort.id}>
                    {resort.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs font-semibold text-slate-400">ใช้รีสอร์ตจริงจาก backend แทนการกรอก ID เอง</p>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">สร้างรีสอร์ตใหม่</span>
              <input
                type="text"
                value={newResortName}
                onChange={(event) => setNewResortName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="เช่น รีสอร์ตภูทับเบิก A"
                disabled={!canCreate || loading || Boolean(resortId)}
              />
              <p className="mt-2 text-xs font-semibold text-slate-400">กรอกเมื่อยังไม่มีรีสอร์ตในรายการ</p>
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
              <p className="mt-2 text-xs font-semibold text-slate-400">ระบบจะสร้างเลขถุงจริงให้อัตโนมัติหลังสร้างงาน</p>
            </label>

            <label className="block md:col-span-2">
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

          {resortError ? (
            <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              {resortError}
            </div>
          ) : null}

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
              disabled={!canCreate || loading || loadingResorts}
              className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'กำลังสร้างงานและถุง...' : 'สร้างงานซัก'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
