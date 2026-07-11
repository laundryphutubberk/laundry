import { useId, useState, type FormEvent } from 'react'

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
    bagId: string | number
    itemTypeId: string | number
    itemTypeName: string
    colorGroup?: string
    quantity: number
    note?: string
  }) => void | Promise<void>
}

export type CountEntryPanelProps = {
  bags?: CountEntryBagOption[]
  itemTypes?: Array<{ id: string | number; name: string; category?: string | null }>
  action?: CountEntryAction
  loading?: boolean
  error?: string | null
}

const fieldClassName =
  'h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

export function CountEntryPanel({ bags = [], itemTypes = [], action, loading = false, error = null }: CountEntryPanelProps) {
  const fieldIdPrefix = useId()
  const bagFieldId = `${fieldIdPrefix}-bag`
  const itemTypeFieldId = `${fieldIdPrefix}-item-type`
  const colorFieldId = `${fieldIdPrefix}-color`
  const quantityFieldId = `${fieldIdPrefix}-quantity`
  const noteFieldId = `${fieldIdPrefix}-note`
  const guidanceId = `${fieldIdPrefix}-guidance`

  const [bagId, setBagId] = useState('')
  const [itemTypeName, setItemTypeName] = useState('')
  const [colorGroup, setColorGroup] = useState('')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')

  const normalizedItemTypeName = itemTypeName.trim()
  const selectedItemType = itemTypes.find((itemType) => (
    itemType.name === normalizedItemTypeName
    || itemType.name.startsWith(`${normalizedItemTypeName} `)
  ))
  const hasRequiredValues = Boolean(bagId && selectedItemType && Number(quantity) > 0)
  const canSubmit = Boolean(action?.onCreate && hasRequiredValues && !action?.disabled && !action?.loading)

  const submitCountLine = async () => {
    if (!canSubmit) return

    await action?.onCreate?.({
      bagId,
      itemTypeId: selectedItemType?.id || '',
      itemTypeName: selectedItemType?.name || '',
      colorGroup: colorGroup.trim() || undefined,
      quantity: Number(quantity),
      note: note.trim() || undefined,
    })

    setItemTypeName('')
    setColorGroup('')
    setQuantity('')
    setNote('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submitCountLine()
  }

  if (loading) {
    return (
      <section className="rounded-[28px] border bg-white p-5 shadow-sm" aria-busy="true" aria-label="กำลังเตรียมแบบฟอร์มเพิ่มรายการนับผ้า">
        <div className="h-5 w-36 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-11 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-red-100 bg-red-50 p-5 text-red-800 shadow-sm" role="alert" aria-live="assertive">
        <p className="text-sm font-semibold">ไม่สามารถบันทึกรายการนับผ้าได้</p>
        <p className="mt-1 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border bg-white p-5 shadow-sm" aria-labelledby={`${fieldIdPrefix}-title`}>
      <div className="mb-5">
        <h2 id={`${fieldIdPrefix}-title`} className="text-base font-semibold text-slate-950">
          เพิ่มรายการนับผ้า
        </h2>
        <p className="mt-1 text-sm text-slate-500">บันทึกจำนวนผ้าที่นับได้จริง แยกตามถุง ประเภท และสี</p>
      </div>

      <form onSubmit={handleSubmit} className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2 xl:grid-cols-12" noValidate>
        <div className="grid min-w-0 gap-1.5 text-sm xl:col-span-3">
          <label htmlFor={bagFieldId} className="font-medium text-slate-600">
            ถุง
          </label>
          <select
            id={bagFieldId}
            name="bagId"
            value={bagId}
            onChange={(event) => setBagId(event.target.value)}
            disabled={action?.disabled || action?.loading}
            className={fieldClassName}
          >
            <option value="" disabled>
              เลือกถุง
            </option>
            {bags.map((bag) => (
              <option key={bag.id} value={bag.id}>
                {bag.label || bag.bagNo || `ถุง ${bag.id}`}
              </option>
            ))}
            <option value="">ไม่ระบุถุง</option>
          </select>
        </div>

        <div className="grid min-w-0 gap-1.5 text-sm xl:col-span-4">
          <label htmlFor={itemTypeFieldId} className="font-medium text-slate-600">
            ประเภทผ้า <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id={itemTypeFieldId}
            name="itemTypeName"
            value={itemTypeName}
            onChange={(event) => setItemTypeName(event.target.value)}
            disabled={action?.disabled || action?.loading}
            placeholder="เช่น ผ้าเช็ดตัว"
            required
            maxLength={120}
            autoComplete="off"
            list={`${itemTypeFieldId}-options`}
            aria-describedby={guidanceId}
            className={fieldClassName}
          />
          <datalist id={`${itemTypeFieldId}-options`}>
            {itemTypes.map((itemType) => <option key={itemType.id} value={itemType.name} />)}
          </datalist>
        </div>

        <div className="grid min-w-0 gap-1.5 text-sm xl:col-span-3">
          <label htmlFor={colorFieldId} className="font-medium text-slate-600">
            สี
          </label>
          <input
            id={colorFieldId}
            name="colorGroup"
            value={colorGroup}
            onChange={(event) => setColorGroup(event.target.value)}
            disabled={action?.disabled || action?.loading}
            placeholder="เช่น ขาว"
            maxLength={80}
            autoComplete="off"
            className={fieldClassName}
          />
        </div>

        <div className="grid min-w-0 gap-1.5 text-sm xl:col-span-2">
          <label htmlFor={quantityFieldId} className="font-medium text-slate-600">
            จำนวน <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id={quantityFieldId}
            name="quantity"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            disabled={action?.disabled || action?.loading}
            placeholder="1"
            required
            aria-describedby={guidanceId}
            className={`${fieldClassName} text-right tabular-nums`}
          />
        </div>

        <div className="grid min-w-0 gap-1.5 text-sm md:col-span-2 xl:col-span-10">
          <label htmlFor={noteFieldId} className="font-medium text-slate-600">
            หมายเหตุ
          </label>
          <input
            id={noteFieldId}
            name="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={action?.disabled || action?.loading}
            placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
            maxLength={500}
            autoComplete="off"
            className={fieldClassName}
          />
        </div>

        <div className="flex min-w-0 items-end md:col-span-2 xl:col-span-2">
          <button
            type="button"
            onClick={() => void submitCountLine()}
            disabled={!canSubmit}
            aria-describedby={guidanceId}
            className="h-11 w-full rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
          >
            {action?.loading ? 'กำลังบันทึก...' : `+ ${action?.label || 'เพิ่มรายการ'}`}
          </button>
        </div>
      </form>

      <div id={guidanceId} aria-live="polite">
        {action?.disabled ? (
          <p className="mt-3 text-xs font-medium text-amber-700">ยังไม่สามารถเพิ่มรายการในสถานะงานปัจจุบันได้</p>
        ) : !hasRequiredValues ? (
          <p className="mt-3 text-xs text-slate-500">
            กรอกประเภทผ้าและจำนวนอย่างน้อย 1 ชิ้นก่อนเพิ่มรายการ <span className="text-red-500">*</span> คือข้อมูลที่จำเป็น
          </p>
        ) : (
          <p className="mt-3 text-xs text-slate-500">กด Enter หรือปุ่ม “เพิ่มรายการ” เพื่อบันทึกข้อมูล</p>
        )}
      </div>
    </section>
  )
}
