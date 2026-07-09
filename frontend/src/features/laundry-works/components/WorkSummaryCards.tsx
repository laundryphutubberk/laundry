export type WorkSummaryCardItem = {
  id?: string | number
  key?: string
  label: string
  value?: string | number | null
  unit?: string
  description?: string
  helperText?: string
  tone?: 'default' | 'warning' | 'danger' | 'success' | string
}

export type WorkSummaryCardsProps = {
  items?: WorkSummaryCardItem[]
  loading?: boolean
  error?: string | null
  emptyText?: string
}

const fallbackItems: WorkSummaryCardItem[] = [
  { key: 'bag-count', label: 'จำนวนถุง', value: '-' },
  { key: 'total-weight', label: 'น้ำหนักรวม', value: '-' },
  { key: 'counted-items', label: 'นับแล้วทั้งหมด', value: '-' },
  { key: 'issue-items', label: 'ชิ้นที่มีปัญหา', value: '-' },
]

const toneClassName: Record<string, string> = {
  default: 'border-slate-200 bg-white text-slate-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
  danger: 'border-red-200 bg-red-50 text-red-950',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
}

export function WorkSummaryCards({
  items = [],
  loading = false,
  error = null,
  emptyText = 'ยังไม่มีข้อมูลสรุปงาน',
}: WorkSummaryCardsProps) {
  if (loading) {
    return (
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
        {[0, 1, 2, 3].map((item) => (
          <article key={item} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-3 w-32 animate-pulse rounded bg-slate-100" />
          </article>
        ))}
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
        {error}
      </section>
    )
  }

  const safeItems = items.length ? items : fallbackItems

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="สรุปงานซัก">
      {safeItems.map((item, index) => {
        const tone = toneClassName[item.tone || 'default'] || toneClassName.default
        const value = item.value ?? '-'
        return (
          <article key={item.id || item.key || index} className={`rounded-2xl border p-4 shadow-sm ${tone}`}>
            <p className="text-sm text-slate-500">{item.label}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="break-words text-2xl font-semibold">{value}</p>
              {item.unit ? <span className="text-sm text-slate-500">{item.unit}</span> : null}
            </div>
            {item.description || item.helperText ? (
              <p className="mt-2 text-xs text-slate-500">{item.description || item.helperText}</p>
            ) : null}
            {!items.length && index === 0 ? <span className="sr-only">{emptyText}</span> : null}
          </article>
        )
      })}
    </section>
  )
}
