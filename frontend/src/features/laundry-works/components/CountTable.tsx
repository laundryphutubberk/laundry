export type CountTableColumn = {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
}

export type CountTableRow = {
  id?: string | number
  [key: string]: string | number | null | undefined
}

export type CountTableProps = {
  rows?: CountTableRow[]
  columns?: CountTableColumn[]
  loading?: boolean
  error?: string | null
  emptyText?: string
  title?: string
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
  loading = false,
  error = null,
  emptyText = 'ยังไม่มีข้อมูลการนับผ้า',
  title = 'รายการผ้าที่นับแล้ว',
}: CountTableProps) {
  const tableColumns = columns?.length ? columns : defaultColumns

  if (loading) {
    return (
      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm" aria-busy="true">
        <div className="border-b border-slate-100 p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="space-y-3 p-6">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-10 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[22px] border border-red-100 bg-red-50 p-6 text-red-800 shadow-sm">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  if (!rows.length) {
    return (
      <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-3 rounded-xl border border-dashed p-4 text-sm text-slate-500">{emptyText}</p>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <button type="button" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-slate-50">
          ดูรายละเอียด
        </button>
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
          <article key={row.id || index} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            {tableColumns.map((column) => (
              <div key={column.key} className="flex justify-between gap-3 py-1 text-sm">
                <span className="text-slate-500">{column.label}</span>
                <span className="text-right font-semibold text-slate-800">{row[column.key] ?? '-'}</span>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  )
}
