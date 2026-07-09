export function CountTable({ rows = [], columns }) {
  const tableColumns = columns?.length
    ? columns
    : [
        { key: 'type', label: 'ประเภทผ้า' },
        { key: 'quantity', label: 'จำนวน' },
        { key: 'weight', label: 'น้ำหนัก' },
      ]

  if (!rows.length) {
    return (
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">รายการนับผ้า</h2>
        <p className="mt-2 text-sm text-slate-500">ยังไม่มีข้อมูลการนับผ้า</p>
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
                <th key={column.key} className="px-4 py-3 font-medium">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, index) => (
              <tr key={row.id || index} className="text-slate-700">
                {tableColumns.map((column) => (
                  <td key={column.key} className="px-4 py-3">{row[column.key] ?? '-'}</td>
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
                <span className="font-medium text-slate-800">{row[column.key] ?? '-'}</span>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  )
}
