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
}: CountTableProps) {
  const tableColumns = columns?.length ? columns : defaultColumns

  if (loading) {
    return (
      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm" aria-busy="true">
        <div className="border-b p-4">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="space-y-3 p-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-10 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800 shadow-sm">
        <h2 className="text-base font-semibold">รายการนับผ้า</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  if (!rows.length) {
    return (
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">รายการนับผ้า</h2>
        <p className="mt-2 rounded-xl border border-dashed p-4 text-sm text-slate-500">{emptyText}</p>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-4">
        <h2 className="text-base font-semibold text-slate-950">รายการนับผ้า</h2>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {tableColumns.map((column) => (
                <th key={column.key} className={`px-4 py-3 font-medium ${alignClassName[column.align || 'left']}`}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, index) => (
              <tr key={row.id || index} className="text-slate-700">
                {tableColumns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 ${alignClassName[column.align || 'left']}`}>
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
          <article key={row.id || index} className="rounded-xl border bg-slate-50 p-3">
            {tableColumns.map((column) => (
              <div key={column.key} className="flex justify-between gap-3 py-1 text-sm">
                <span className="text-slate-500">{column.label}</span>
                <span className="text-right font-medium text-slate-800">{row[column.key] ?? '-'}</span>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  )
}
