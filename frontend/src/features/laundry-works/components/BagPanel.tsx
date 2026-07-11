import { useState, type FormEvent } from 'react'

export type BagPanelBag = {
  id: string | number
  bagNo: string
  status: string
  statusLabel?: string
  statusTone?: string
  statusDescription?: string
  statusBadgeClassName?: string
  note?: string | null
  receivedAt?: string | null
}

export type BagPanelActions = {
  createBag?: {
    label: string
    disabled?: boolean
    onCreate?: (input: { bagNo: string; note?: string }) => void | Promise<void>
  }
  openBag?: {
    label: string
    disabled?: boolean
    onOpen?: (bagId: string | number) => void | Promise<void>
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

const PANEL_TITLE_ID = 'bag-panel-title'
const BAG_NO_INPUT_ID = 'bag-panel-bag-no'
const BAG_NOTE_INPUT_ID = 'bag-panel-note'
const BAG_FORM_HELP_ID = 'bag-panel-form-help'
const fallbackBadgeClassName = 'border-slate-200 bg-slate-50 text-slate-700'

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

function bagDisplayName(bag: BagPanelBag, index: number) {
  const simpleBagNo = bag.bagNo?.match(/BAG-(\d+)$/)?.[1]
  return simpleBagNo ? `ถุงที่ ${Number(simpleBagNo)}` : `ถุงที่ ${index + 1}`
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
      <section
        className="rounded-[28px] border border-white/70 bg-white p-5 shadow-sm"
        aria-busy="true"
        aria-label="กำลังโหลดข้อมูลถุงรับเข้า"
      >
        <span className="sr-only">กำลังโหลดข้อมูลถุงรับเข้า กรุณารอสักครู่</span>
        <div className="h-5 w-36 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-red-100 bg-red-50 p-5 text-red-800 shadow-sm" role="alert">
        <h2 className="text-base font-black">ไม่สามารถโหลดข้อมูลถุงรับเข้าได้</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-sm" aria-labelledby={PANEL_TITLE_ID}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id={PANEL_TITLE_ID} className="text-lg font-black text-slate-950">
            ถุงรับเข้า
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">ใช้ถุงเป็นหน่วยรับเข้า เพื่อตรวจจำนวนและช่วยนับผ้าให้ครบ</p>
        </div>
        <span className="w-fit rounded-2xl bg-slate-100 px-3 py-1 text-sm font-black text-slate-600" aria-live="polite">
          รับแล้ว {bags.length} ถุง
        </span>
      </div>

      <div className="mt-5">
        {bags.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            <p className="font-semibold">ยังไม่มีถุงรับเข้าในงานนี้</p>
            <p className="mt-1 text-xs">เพิ่มถุงเมื่อมีการรับถุงจริงเพิ่มเติมจากจำนวนเดิม</p>
          </div>
        ) : (
          <ul className="space-y-3" aria-label={`ถุงรับเข้าทั้งหมด ${bags.length} ถุง`}>
            {bags.map((bag, index) => {
              const displayName = bagDisplayName(bag, index)
              const formattedReceivedAt = formatDate(bag.receivedAt)
              const statusLabel = bag.statusLabel || bag.status || 'ไม่ระบุสถานะ'
              const statusDescription = bag.statusDescription || `สถานะ ${statusLabel}`
              const badgeClassName = bag.statusBadgeClassName || fallbackBadgeClassName

              return (
                <li key={bag.id}>
                  <article className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-black text-slate-950">{displayName}</h3>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-400">รหัสระบบ: {bag.bagNo}</p>
                      </div>
                      <span
                        className={`w-fit shrink-0 rounded-xl border px-3 py-1 text-xs font-black ${badgeClassName}`}
                        title={statusDescription}
                      >
                        <span className="sr-only">สถานะ </span>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-1 text-sm font-medium text-slate-500 sm:grid-cols-2">
                      <p>
                        รับเมื่อ:{' '}
                        {bag.receivedAt ? <time dateTime={bag.receivedAt}>{formattedReceivedAt}</time> : <span>-</span>}
                      </p>
                      <p className="break-words">{bag.note || 'ไม่มีหมายเหตุถุง'}</p>
                    </div>
                    {bag.status === 'RECEIVED' && actions?.openBag ? (
                      <button
                        type="button"
                        disabled={actions.openBag.disabled}
                        onClick={() => actions.openBag?.onOpen?.(bag.id)}
                        className="mt-3 rounded-xl bg-blue-700 px-3 py-2 text-xs font-black text-white disabled:bg-slate-300"
                      >
                        {actions.openBag.label}
                      </button>
                    ) : null}
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {createAction ? (
        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4"
          aria-describedby={BAG_FORM_HELP_ID}
          aria-busy={creating}
        >
          <h3 className="text-sm font-black text-slate-700">เพิ่มถุงรับเข้า</h3>
          <p id={BAG_FORM_HELP_ID} className="mt-1 text-xs font-semibold text-slate-500">
            ใช้กรณีรับถุงเพิ่มจากจำนวนเดิม เช่น ถุงที่ 6 หรือถุงตกหล่น
          </p>
          <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] md:items-end">
            <div className="min-w-0">
              <label htmlFor={BAG_NO_INPUT_ID} className="text-xs font-bold text-slate-500">
                ชื่อถุง / ลำดับถุง <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id={BAG_NO_INPUT_ID}
                name="bagNo"
                value={bagNo}
                onChange={(event) => setBagNo(event.target.value)}
                className="mt-1 w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                placeholder="เช่น ถุงที่ 6"
                disabled={disabled}
                required
                maxLength={100}
                aria-describedby={BAG_FORM_HELP_ID}
              />
            </div>
            <div className="min-w-0">
              <label htmlFor={BAG_NOTE_INPUT_ID} className="text-xs font-bold text-slate-500">
                หมายเหตุถุง
              </label>
              <input
                id={BAG_NOTE_INPUT_ID}
                name="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-1 w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                placeholder="เช่น ถุงขาด / ถุงเปียก / ไม่บังคับ"
                disabled={disabled}
                maxLength={500}
              />
            </div>
            <button
              type="submit"
              disabled={disabled || !bagNo.trim()}
              className="rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
            >
              {creating ? 'กำลังเพิ่ม...' : createAction.label}
            </button>
          </div>
          {createAction.disabled ? (
            <p className="mt-3 text-xs font-medium text-amber-700" role="status">
              ยังไม่สามารถเพิ่มถุงในสถานะงานปัจจุบันได้
            </p>
          ) : null}
        </form>
      ) : null}
    </section>
  )
}
