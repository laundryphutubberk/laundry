import { useState, type FormEvent } from 'react'

export type CountEntryBagOption = {
  id?: string | number
  label?: string
  bagNo?: string
  status?: string
}

export type CountEntryAction = {
  label?: string
  disabled?: boolean
  loading?: boolean
  onCreate?: (input: {
    bagId?: string | number
    itemTypeName: string
    colorGroup?: string
    quantity: number
    note?: string
  }) => void | Promise<void>
}

export type CountEntryPanelProps = {
  bags?: CountEntryBagOption[]
  action?: CountEntryAction
  loading?: boolean
  error?: string | null
}

export function CountEntryPanel({ bags = [], action, loading = false, error = null }: CountEntryPanelProps) {
  const [bagId, setBagId] = useState('')
  const [itemTypeName, setItemTypeName] = useState('')
  const [colorGroup, setColorGroup] = useState('')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')

  const canSubmit = Boolean(action?.onCreate && itemTypeName.trim() && Number(quantity) > 0 && !action?.disabled && !action?.loading)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    await action?.onCreate?.({
      bagId: bagId || undefined,
      itemTypeName: itemTypeName.trim(),
      colorGroup: colorGroup.trim() || undefined,
      quantity: Number(quantity),
      note: note.trim() || undefined,
    })

    setItemTypeName('')
    setColorGroup('')
    setQuantity('')
    setNote('')
  }

  if (loading) {
    return (
      <section className="rounded-[28px] border bg-white p-5 shadow-sm" aria-busy="true">
        <div className="h-5 w-36 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-11 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-red-100 bg-red-50 p-5 text-red-800 shadow-sm">
        <p className="text-sm font-semibold">ไม่สามารถบันทึกรายการนับผ้าได้</p>
        <p className="mt-1 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">เพิ่มรายการนับผ้า</h2>
        <p className="mt-1 text-sm text-slate-500">บันทึกจำนวนผ้าที่นับได้จริง แยกตามถุง ประเภท และสี</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)_160px_120px]">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-600">ถุง</span>
          <select
            value={bagId}
            onChange={(event) => setBagId(event.target.value)}
            disabled={action?.disabled || action?.loading}
            className="h-11 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="">ไม่ระบุถุง</option>
            {bags.map((bag) => (
              <option key={bag.id} value={bag.id}>
                {bag.label || bag.bagNo || `ถุง ${bag.id}`}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-600">ประเภทผ้า</span>
          <input
            value={itemTypeName}
            onChange={(event) => setItemTypeName(event.target.value)}
            disabled={action?.disabled || action?.loading}
            placeholder="เช่น ผ้าเช็ดตัว"
            className="h-11 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-600">สี</span>
          <input
            value={colorGroup}
            onChange={(event) => setColorGroup(event.target.value)}
            disabled={action?.disabled || action?.loading}
            placeholder="เช่น ขาว"
            className="h-11 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-600">จำนวน</span>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            disabled={action?.disabled || action?.loading}
            placeholder="0"
            className="h-11 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <label className="grid gap-1 text-sm md:col-span-3">
          <span className="font-medium text-slate-600">หมายเหตุ</span>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={action?.disabled || action?.loading}
            placeholder="หมายเหตุเพิ่มเติม"
            className="h-11 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-11 w-full rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {action?.loading ? 'กำลังบันทึก...' : action?.label || 'เพิ่มรายการ'}
          </button>
        </div>
      </form>

      {action?.disabled && action?.label ? (
        <p className="mt-3 text-xs text-slate-500">Action ถูกปิดตาม runtime policy</p>
      ) : null}
    </section>
  )
}
