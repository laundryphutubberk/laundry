export function WorkSummaryCards({ items = [] }) {
  const safeItems = items.length
    ? items
    : [
        { label: 'จำนวนถุง', value: '-' },
        { label: 'น้ำหนักรวม', value: '-' },
        { label: 'นับแล้วทั้งหมด', value: '-' },
        { label: 'ชิ้นที่มีปัญหา', value: '-' },
      ]

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {safeItems.map((item, index) => (
        <article key={item.id || item.key || index} className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">{item.label}</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold text-slate-950">{item.value}</p>
            {item.unit ? <span className="text-sm text-slate-500">{item.unit}</span> : null}
          </div>
          {item.description ? <p className="mt-2 text-xs text-slate-400">{item.description}</p> : null}
        </article>
      ))}
    </section>
  )
}
