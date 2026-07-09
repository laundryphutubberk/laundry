export function HistoryPanel({ events = [] }) {
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">ประวัติการทำงาน</h2>
      <p className="mt-1 text-sm text-slate-500">เหตุการณ์สำคัญที่เกิดขึ้นในงานนี้</p>

      {events.length ? (
        <ol className="mt-4 space-y-3">
          {events.map((event, index) => (
            <li key={event.id || index} className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300" />
              <div className="min-w-0 flex-1 rounded-xl border bg-slate-50 p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-slate-900">{event.label || event.title || 'เหตุการณ์'}</p>
                  <span className="text-xs text-slate-500">{event.timestamp || event.createdAt || '-'}</span>
                </div>
                {event.description ? <p className="mt-1 text-sm text-slate-500">{event.description}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed p-4 text-sm text-slate-500">ยังไม่มีประวัติการทำงาน</p>
      )}
    </section>
  )
}
