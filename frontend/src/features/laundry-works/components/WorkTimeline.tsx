export type WorkTimelineStepState = 'completed' | 'current' | 'pending' | 'blocked' | 'cancelled' | 'disabled'

export type WorkTimelineStep = {
  id?: string | number
  key?: string
  label?: string
  name?: string
  state?: WorkTimelineStepState | string
  description?: string
  helperText?: string
  completedAt?: string
  actorName?: string
}

export type WorkTimelineProps = {
  steps?: WorkTimelineStep[]
  nextHint?: string
  loading?: boolean
  error?: string | null
  emptyText?: string
}

const stateClassName: Record<string, string> = {
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  current: 'border-blue-300 bg-blue-50 text-blue-800 ring-2 ring-blue-100',
  pending: 'border-slate-200 bg-white text-slate-500',
  blocked: 'border-amber-200 bg-amber-50 text-amber-800',
  cancelled: 'border-red-200 bg-red-50 text-red-800',
  disabled: 'border-slate-100 bg-slate-50 text-slate-400',
}

const markerClassName: Record<string, string> = {
  completed: 'bg-emerald-600 text-white',
  current: 'bg-blue-600 text-white',
  pending: 'bg-white text-slate-500',
  blocked: 'bg-amber-600 text-white',
  cancelled: 'bg-red-600 text-white',
  disabled: 'bg-slate-100 text-slate-400',
}

export function WorkTimeline({
  steps = [],
  nextHint,
  loading = false,
  error = null,
  emptyText = 'ยังไม่มีข้อมูลลำดับงาน',
}: WorkTimelineProps) {
  if (loading) {
    return (
      <section className="rounded-2xl border bg-white p-4 shadow-sm" aria-busy="true">
        <div className="mb-4 h-5 w-28 animate-pulse rounded bg-slate-100" />
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-1">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800 shadow-sm">
        <h2 className="text-base font-semibold">ลำดับงาน</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  if (!steps.length) {
    return (
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">ลำดับงาน</h2>
        <p className="mt-2 rounded-xl border border-dashed p-4 text-sm text-slate-500">{emptyText}</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">ลำดับงาน</h2>
          {nextHint ? <p className="mt-1 text-sm text-slate-500">{nextHint}</p> : null}
        </div>
      </div>

      <ol className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-1">
        {steps.map((step, index) => {
          const state = step.state || 'pending'
          const tone = stateClassName[state] || stateClassName.pending
          const markerTone = markerClassName[state] || markerClassName.pending
          return (
            <li key={step.id || step.key || index} className={`rounded-xl border px-3 py-2 ${tone}`}>
              <div className="flex items-start gap-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-sm ${markerTone}`}>
                  {state === 'completed' ? '✓' : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{step.label || step.name || 'ขั้นตอน'}</p>
                  {step.description || step.helperText ? (
                    <p className="mt-0.5 text-xs opacity-80">{step.description || step.helperText}</p>
                  ) : null}
                  {step.completedAt || step.actorName ? (
                    <p className="mt-1 text-xs opacity-70">
                      {[step.completedAt, step.actorName].filter(Boolean).join(' • ')}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
