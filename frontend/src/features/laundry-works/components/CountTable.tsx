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

export type CountTableProps = {
  rows?: CountTableRow[]
  columns?: CountTableColumn[]
  summaryItems?: CountTableSummaryItem[]
  remark?: string
  action?: CountTableAction
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

export function CountTable({
  rows = [],
  columns,
  summaryItems = [],
  remark,
  action,
  loading = false,
  error = null,
  emptyText = 'ยังไม่มีข้อมูลการนับผ้า',
  title = 'รายการผ้าที่นับแล้ว',
  description = 'ข้อมูลนับจริงจากงานนี้ แสดงเพื่อปฏิบัติงานต่ออย่างปลอดภัย',
}: CountTableProps) {
  const tableColumns = columns?.length ? columns : defaultColumns

  if (loading) {
    return (
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm" aria-busy="true">
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
      <section className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-red-800 shadow-sm">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  if (!rows.length) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-3 rounded-2xl border border-dashed p-4 text-sm text-slate-500">{emptyText}</p>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className="w-fit rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {action.loading ? 'กำลังโหลด...' : action.label || 'ดูรายละเอียด'}
          </button>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              {tableColumns.map((column) => (
                <th key={column.key} className={`px-6 py-4 font-semibold ${alignClassName[column.align || 'left']}`}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={row.id || index} className="text-slate-700 hover:bg-slate-50/80">
                {tableColumns.map((column) => (
                  <td key={column.key} className={`px-6 py-[18px] ${alignClassName[column.align || 'left']}`}>
                    {row[column.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {rows.map((row, index) => (
          <article key={row.id || index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {tableColumns.map((column) => (
              <div key={column.key} className="flex justify-between gap-3 py-1.5 text-sm">
                <span className="text-slate-500">{column.label}</span>
                <span className="text-right font-semibold text-slate-800">{row[column.key] ?? '-'}</span>
              </div>
            ))}
          </article>
        ))}
      </div>

      {summaryItems.length || remark ? (
        <div className="grid gap-3 border-t border-slate-100 bg-slate-50/80 p-5 md:grid-cols-3">
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
