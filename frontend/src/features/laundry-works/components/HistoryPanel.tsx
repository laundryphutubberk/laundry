import { useId } from 'react'

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
  const headingId = useId()

  if (loading) {
    return (
      <section
        className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
        aria-busy="true"
        aria-label="กำลังโหลดประวัติงาน"
      >
        <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-red-800 shadow-sm" role="alert" aria-live="assertive">
        <h2 className="text-lg font-black">ประวัติงาน</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-xl font-black tracking-tight text-slate-950">
        ประวัติงาน
      </h2>
      <p className="mt-1 text-sm text-slate-500">เหตุการณ์สำคัญที่เกิดขึ้นในงานนี้</p>

      {events.length ? (
        <ol className="mt-6 space-y-0" aria-label={`ประวัติงานทั้งหมด ${events.length} เหตุการณ์`}>
          {events.map((event, index) => {
            const eventDateTime = event.timestamp || event.createdAt
            const eventTime = event.time || eventDateTime || '-'
            const label = event.eventLabel || event.label || event.title || 'เหตุการณ์'
            const isLast = index === events.length - 1

            return (
              <li key={event.id || index} className="relative flex gap-4 pb-5 last:pb-0">
                {!isLast ? <span className="absolute left-[9px] top-5 h-full w-0.5 bg-slate-200" aria-hidden="true" /> : null}
                <span className="relative z-10 mt-2 h-5 w-5 shrink-0 rounded-full border-4 border-white bg-blue-500 shadow-sm ring-1 ring-blue-100" aria-hidden="true" />
                <article className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 transition hover:bg-white hover:shadow-sm">
                  <span className="sr-only">เหตุการณ์ที่ {index + 1} จาก {events.length}</span>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="text-sm font-black text-slate-950">{label}</h3>
                    {eventDateTime ? (
                      <time dateTime={eventDateTime} className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                        {eventTime}
                      </time>
                    ) : (
                      <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">{eventTime}</span>
                    )}
                  </div>
                  {event.actorName ? <p className="mt-2 text-xs font-bold text-slate-400">โดย {event.actorName}</p> : null}
                  {event.description || event.note ? <p className="mt-2 text-sm leading-6 text-slate-600">{event.description || event.note}</p> : null}
                </article>
              </li>
            )
          })}
        </ol>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
          <p className="text-sm font-semibold text-slate-700">{emptyText}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">เมื่อสถานะงานเปลี่ยนหรือมีการดำเนินการสำคัญ ระบบจะแสดงเหตุการณ์ไว้ที่นี่</p>
        </div>
      )}
    </section>
  )
}
