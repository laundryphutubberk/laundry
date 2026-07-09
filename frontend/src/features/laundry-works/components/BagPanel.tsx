import { FormEvent, useState } from 'react'

export type BagPanelBag = {
  id: string | number
  bagNo: string
  status: string
  note?: string | null
  receivedAt?: string | null
}

export type BagPanelActions = {
  createBag?: {
    label: string
    disabled?: boolean
    onCreate?: (input: { bagNo: string; note?: string }) => void | Promise<void>
  }
}

export type BagPanelProps = {
  bags?: BagPanelBag[]
  actions?: BagPanelActions
  loading?: boolean
  error?: string | null
  state?: {
    isCreatingBag?: boolean
  }
}

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

export function BagPanel({ bags = [], actions, loading = false, error = null, state }: BagPanelProps) {
  const [bagNo, setBagNo] = useState('')
  const [note, setNote] = useState('')
  const createAction = actions?.createBag
  const creating = Boolean(state?.isCreatingBag)
  const disabled = Boolean(loading || error || creating || createAction?.disabled)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextBagNo = bagNo.trim()
    if (!nextBagNo || disabled) return

    await createAction?.onCreate?.({
      bagNo: nextBagNo,
      note: note.trim() || undefined,
    })
    setBagNo('')
    setNote('')
  }

  if (loading) {
    return (
      <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">กำลังโหลดข้อมูลถุง...</p>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-black text-slate-950">ถุงผ้า</p>
          <p className="mt-1 text-sm font-medium text-slate-500">จัดการถุงที่ผูกกับงานซักนี้</p>
        </div>
        <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">{bags.length} ถุง</span>
      </div>

      <div className="mt-5 space-y-3">
        {bags.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">
            ยังไม่มีถุงในงานนี้
          </div>
        ) : (
          bags.map((bag) => (
            <div key={bag.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-black text-slate-950">{bag.bagNo}</p>
                <span className="rounded-xl bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{bag.status}</span>
              </div>
              <div className="mt-2 grid gap-1 text-sm font-medium text-slate-500 sm:grid-cols-2">
                <p>รับเมื่อ: {formatDate(bag.receivedAt)}</p>
                <p>{bag.note || 'ไม่มีหมายเหตุ'}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {createAction ? (
        <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-700">เพิ่มถุงใหม่</p>
          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] md:items-end">
            <label className="block">
              <span className="text-xs font-bold text-slate-500">เลขถุง</span>
              <input
                value={bagNo}
                onChange={(event) => setBagNo(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="เช่น BAG-001"
                disabled={disabled}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-500">หมายเหตุ</span>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="ไม่บังคับ"
                disabled={disabled}
              />
            </label>
            <button
              type="submit"
              disabled={disabled || !bagNo.trim()}
              className="rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? 'กำลังเพิ่ม...' : createAction.label}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
