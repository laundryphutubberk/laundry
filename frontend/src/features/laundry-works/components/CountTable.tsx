import { useId, useState } from 'react'

export type CountTableColumn = {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
}

export type CountTableRow = {
  id?: string | number
  [key: string]: string | number | null | undefined
}

export type CountTableSummaryItem = {
  key?: string
  label: string
  value?: string | number | null
  description?: string
}

export type CountTableAction = {
  label?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

export type CountTableRowActions = {
  canUpdate?: boolean
  canDelete?: boolean
  updating?: boolean
  deleting?: boolean
  onUpdate?: (row: CountTableRow) => void | Promise<void>
  onDelete?: (row: CountTableRow) => void | Promise<void>
}

export type CountTableProps = {
  rows?: CountTableRow[]
  columns?: CountTableColumn[]
  summaryItems?: CountTableSummaryItem[]
  remark?: string
  action?: CountTableAction
  rowActions?: CountTableRowActions
  loading?: boolean
  error?: string | null
  emptyText?: string
  title?: string
  description?: string
}

const defaultColumns: CountTableColumn[] = [
  { key: 'type', label: 'ประเภทผ้า' },
  { key: 'category', label: 'หมวดหมู่' },
  { key: 'color', label: 'สี' },
  { key: 'quantity', label: 'จำนวน', align: 'right' },
  { key: 'weight', label: 'น้ำหนัก', align: 'right' },
]

const alignClassName: Record<string, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
}

const rowButtonClassName =
  'rounded-xl border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50'

const toEditableValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '-') return ''
  return String(value)
}

const getRowLabel = (row: CountTableRow, index: number) => {
  const type = typeof row.type === 'string' && row.type.trim() ? row.type.trim() : `รายการที่ ${index + 1}`
  return type
}

export function CountTable({
  rows = [],
  columns,
  summaryItems = [],
  remark,
  action,
  rowActions,
  loading = false,
  error = null,
  emptyText = 'ยังไม่มีข้อมูลการนับผ้า',
  title = 'รายการผ้าที่นับแล้ว',
  description = 'ข้อมูลนับจริงจากงานนี้ แสดงเพื่อปฏิบัติงานต่ออย่างปลอดภัย',
}: CountTableProps) {
  const tableColumns = columns?.length ? columns : defaultColumns
  const hasRowActions = Boolean(rowActions?.canUpdate || rowActions?.canDelete)
  const [editingRowId, setEditingRowId] = useState<string | number | null>(null)
  const [confirmingDeleteRowId, setConfirmingDeleteRowId] = useState<string | number | null>(null)
  const [editDraft, setEditDraft] = useState<CountTableRow>({})
  const titleId = useId()
  const descriptionId = useId()

  const startEdit = (row: CountTableRow) => {
    if (!row.id) return
    setConfirmingDeleteRowId(null)
    setEditingRowId(row.id)
    setEditDraft({
      ...row,
      type: toEditableValue(row.type),
      color: toEditableValue(row.color),
      quantity: toEditableValue(row.quantity),
    })
  }

  const cancelEdit = () => {
    setEditingRowId(null)
    setEditDraft({})
  }

  const updateDraft = (key: string, value: string) => {
    setEditDraft((current) => ({ ...current, [key]: value }))
  }

  const submitEdit = async () => {
    if (!editingRowId || !rowActions?.onUpdate) return
    await rowActions.onUpdate({ ...editDraft, id: editingRowId })
    cancelEdit()
  }

  const requestDelete = (row: CountTableRow) => {
    if (!row.id) return
    setEditingRowId(null)
    setConfirmingDeleteRowId(row.id)
  }

  const cancelDelete = () => {
    setConfirmingDeleteRowId(null)
  }

  const confirmDelete = async (row: CountTableRow) => {
    if (!row.id || !rowActions?.onDelete) return
    await rowActions.onDelete(row)
    setConfirmingDeleteRowId(null)
  }

  if (loading) {
    return (
      <section
        className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
        aria-busy="true"
        aria-label={`กำลังโหลด${title}`}
      >
        <span className="sr-only" role="status">กำลังโหลดข้อมูลรายการผ้าที่นับแล้ว</span>
        <div className="border-b border-slate-100 p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="space-y-3 p-6">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-red-800 shadow-sm" role="alert">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  if (!rows.length) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby={titleId}>
        <h2 id={titleId} className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-3 rounded-2xl border border-dashed p-4 text-sm text-slate-500">{emptyText}</p>
      </section>
    )
  }

  return (
    <section
      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 id={titleId} className="text-xl font-bold text-slate-950">{title}</h2>
          <p id={descriptionId} className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className="w-fit rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {action.loading ? 'กำลังโหลด...' : action.label || 'ดูรายละเอียด'}
          </button>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{description} มีทั้งหมด {rows.length} รายการ</caption>
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              {tableColumns.map((column) => (
                <th scope="col" key={column.key} className={`px-6 py-4 font-semibold ${alignClassName[column.align || 'left']}`}>
                  {column.label}
                </th>
              ))}
              {hasRowActions ? <th scope="col" className="px-6 py-4 text-right font-semibold">จัดการ</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => {
              const isEditing = Boolean(row.id && editingRowId === row.id)
              const isConfirmingDelete = Boolean(row.id && confirmingDeleteRowId === row.id)
              const rowLabel = getRowLabel(row, index)

              return (
                <tr key={row.id || index} className="text-slate-700 hover:bg-slate-50/80">
                  {tableColumns.map((column) => (
                    <td key={column.key} className={`px-6 py-[18px] ${alignClassName[column.align || 'left']}`}>
                      {isEditing && ['type', 'color', 'quantity'].includes(column.key) ? (
                        <input
                          type={column.key === 'quantity' ? 'number' : 'text'}
                          min={column.key === 'quantity' ? 1 : undefined}
                          inputMode={column.key === 'quantity' ? 'numeric' : undefined}
                          value={toEditableValue(editDraft[column.key])}
                          onChange={(event) => updateDraft(column.key, event.target.value)}
                          aria-label={`แก้ไข${column.label}ของ${rowLabel}`}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
                        />
                      ) : (
                        row[column.key] ?? '-'
                      )}
                    </td>
                  ))}
                  {hasRowActions ? (
                    <td className="px-6 py-[18px] text-right">
                      <div className="flex justify-end gap-2" aria-live="polite">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={submitEdit}
                              disabled={rowActions?.updating}
                              aria-label={`บันทึกการแก้ไข ${rowLabel}`}
                              className={`${rowButtonClassName} border-blue-100 text-blue-700 hover:bg-blue-50`}
                            >
                              บันทึก
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={rowActions?.updating}
                              aria-label={`ยกเลิกการแก้ไข ${rowLabel}`}
                              className={`${rowButtonClassName} border-slate-200 text-slate-700 hover:bg-slate-50`}
                            >
                              ยกเลิก
                            </button>
                          </>
                        ) : isConfirmingDelete ? (
                          <>
                            <span className="self-center text-xs font-semibold text-red-700" role="status">ยืนยันลบ {rowLabel}?</span>
                            <button
                              type="button"
                              onClick={() => confirmDelete(row)}
                              disabled={rowActions?.deleting}
                              aria-label={`ยืนยันลบ ${rowLabel}`}
                              className={`${rowButtonClassName} border-red-100 bg-red-50 text-red-700 hover:bg-red-100`}
                            >
                              ยืนยัน
                            </button>
                            <button
                              type="button"
                              onClick={cancelDelete}
                              disabled={rowActions?.deleting}
                              aria-label={`ยกเลิกการลบ ${rowLabel}`}
                              className={`${rowButtonClassName} border-slate-200 text-slate-700 hover:bg-slate-50`}
                            >
                              ยกเลิก
                            </button>
                          </>
                        ) : (
                          <>
                            {rowActions?.canUpdate ? (
                              <button
                                type="button"
                                onClick={() => startEdit(row)}
                                disabled={rowActions.updating}
                                aria-label={`แก้ไข ${rowLabel}`}
                                className={`${rowButtonClassName} border-slate-200 text-slate-700 hover:bg-slate-50`}
                              >
                                แก้ไข
                              </button>
                            ) : null}
                            {rowActions?.canDelete ? (
                              <button
                                type="button"
                                onClick={() => requestDelete(row)}
                                disabled={rowActions.deleting}
                                aria-label={`ลบ ${rowLabel}`}
                                className={`${rowButtonClassName} border-red-100 text-red-700 hover:bg-red-50`}
                              >
                                ลบ
                              </button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 md:hidden" role="list" aria-label={`${title} ${rows.length} รายการ`}>
        {rows.map((row, index) => {
          const isEditing = Boolean(row.id && editingRowId === row.id)
          const isConfirmingDelete = Boolean(row.id && confirmingDeleteRowId === row.id)
          const rowLabel = getRowLabel(row, index)

          return (
            <article key={row.id || index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4" role="listitem">
              {tableColumns.map((column) => (
                <div key={column.key} className="flex justify-between gap-3 py-1.5 text-sm">
                  <span className="text-slate-500">{column.label}</span>
                  {isEditing && ['type', 'color', 'quantity'].includes(column.key) ? (
                    <input
                      type={column.key === 'quantity' ? 'number' : 'text'}
                      min={column.key === 'quantity' ? 1 : undefined}
                      inputMode={column.key === 'quantity' ? 'numeric' : undefined}
                      value={toEditableValue(editDraft[column.key])}
                      onChange={(event) => updateDraft(column.key, event.target.value)}
                      aria-label={`แก้ไข${column.label}ของ${rowLabel}`}
                      className="w-40 rounded-xl border border-slate-200 px-3 py-2 text-right text-sm outline-none transition focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
                    />
                  ) : (
                    <span className="text-right font-semibold text-slate-800">{row[column.key] ?? '-'}</span>
                  )}
                </div>
              ))}
              {hasRowActions ? (
                <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-3" aria-live="polite">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={submitEdit}
                        disabled={rowActions?.updating}
                        aria-label={`บันทึกการแก้ไข ${rowLabel}`}
                        className={`${rowButtonClassName} border-blue-100 text-blue-700`}
                      >
                        บันทึก
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={rowActions?.updating}
                        aria-label={`ยกเลิกการแก้ไข ${rowLabel}`}
                        className={`${rowButtonClassName} border-slate-200 text-slate-700`}
                      >
                        ยกเลิก
                      </button>
                    </>
                  ) : isConfirmingDelete ? (
                    <>
                      <span className="self-center text-xs font-semibold text-red-700" role="status">ยืนยันลบ {rowLabel}?</span>
                      <button
                        type="button"
                        onClick={() => confirmDelete(row)}
                        disabled={rowActions?.deleting}
                        aria-label={`ยืนยันลบ ${rowLabel}`}
                        className={`${rowButtonClassName} border-red-100 bg-red-50 text-red-700`}
                      >
                        ยืนยัน
                      </button>
                      <button
                        type="button"
                        onClick={cancelDelete}
                        disabled={rowActions?.deleting}
                        aria-label={`ยกเลิกการลบ ${rowLabel}`}
                        className={`${rowButtonClassName} border-slate-200 text-slate-700`}
                      >
                        ยกเลิก
                      </button>
                    </>
                  ) : (
                    <>
                      {rowActions?.canUpdate ? (
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          disabled={rowActions.updating}
                          aria-label={`แก้ไข ${rowLabel}`}
                          className={`${rowButtonClassName} border-slate-200 text-slate-700`}
                        >
                          แก้ไข
                        </button>
                      ) : null}
                      {rowActions?.canDelete ? (
                        <button
                          type="button"
                          onClick={() => requestDelete(row)}
                          disabled={rowActions.deleting}
                          aria-label={`ลบ ${rowLabel}`}
                          className={`${rowButtonClassName} border-red-100 text-red-700`}
                        >
                          ลบ
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
            </article>
          )
        })}
      </div>

      {summaryItems.length || remark ? (
        <div className="grid gap-3 border-t border-slate-100 bg-slate-50/80 p-5 md:grid-cols-3" aria-label="สรุปรายการนับผ้า">
          {summaryItems.map((item, index) => (
            <div key={item.key || index} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold text-slate-400">{item.label}</p>
              <p className="mt-1 text-2xl font-black text-blue-950">{item.value ?? '-'}</p>
              {item.description ? <p className="mt-1 text-xs font-semibold text-slate-500">{item.description}</p> : null}
            </div>
          ))}
          {remark ? (
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold text-slate-400">หมายเหตุ</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{remark}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
