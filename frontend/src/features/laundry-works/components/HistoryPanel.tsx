export type HistoryPanelEvent = {
  id?: string | number
  label?: string
  title?: string
  eventLabel?: string
  description?: string
  note?: string
  timestamp?: string
  createdAt?: string
  time?: string
  actorName?: string
}

export type HistoryPanelProps = {
  events?: HistoryPanelEvent[]
  loading?: boolean
  error?: string | null
  emptyText?: string
}

export function HistoryPanel({
  events = [],
  loading = false,
  error = null,
  emptyText = 'ยังไม่มีประวัติการทำงาน',
}: HistoryPanelProps) {
  if (loading) {
    return (
      <section className="rounded-2xl border bg-white p-4 shadow-sm" aria-busy="true">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800 shadow-sm">
        <h2 className="text-base font-semibold">ประวัติการทำงาน</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">ประวัติการทำงาน</h2>
      <p className="mt-1 text-sm text-slate-500">เหตุการณ์สำคัญที่เกิดขึ้นในงานนี้</p>

      {events.length ? (
        <ol className="mt-4 space-y-3">
          {events.map((event, index) => {
            const eventTime = event.time || event.timestamp || event.createdAt || '-'
            const label = event.eventLabel || event.label || event.title || 'เหตุการณ์'
            return (
              <li key={event.id || index} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300" />
                <div className="min-w-0 flex-1 rounded-xl border bg-slate-50 p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    <span className="text-xs text-slate-500">{eventTime}</span>
                  </div>
                  {event.actorName ? <p className="mt-1 text-xs text-slate-400">โดย {event.actorName}</p> : null}
                  {event.description || event.note ? (
                    <p className="mt-1 text-sm text-slate-500">{event.description || event.note}</p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed p-4 text-sm text-slate-500">{emptyText}</p>
      )}
    </section>
  )
}
