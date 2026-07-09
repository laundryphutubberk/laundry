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

const markerClassName: Record<string, string> = {
  completed: 'bg-emerald-500 text-white ring-4 ring-emerald-50',
  current: 'bg-amber-400 text-white ring-4 ring-amber-50 shadow-lg shadow-amber-200/70',
  pending: 'bg-white text-slate-500 ring-1 ring-slate-300',
  blocked: 'bg-amber-500 text-white ring-4 ring-amber-50',
  cancelled: 'bg-red-500 text-white ring-4 ring-red-50',
  disabled: 'bg-slate-100 text-slate-400 ring-1 ring-slate-200',
}

const lineClassName: Record<string, string> = {
  completed: 'bg-emerald-400',
  current: 'bg-slate-200',
  pending: 'bg-slate-200',
  blocked: 'bg-amber-300',
  cancelled: 'bg-red-300',
  disabled: 'bg-slate-100',
}

const itemClassName: Record<string, string> = {
  completed: 'bg-white',
  current: 'border-amber-200 bg-amber-50/80 shadow-sm shadow-amber-100',
  pending: 'bg-white',
  blocked: 'border-amber-200 bg-amber-50',
  cancelled: 'border-red-200 bg-red-50',
  disabled: 'bg-slate-50',
}

const labelClassName: Record<string, string> = {
  completed: 'text-slate-900',
  current: 'text-slate-950',
  pending: 'text-slate-700',
  blocked: 'text-amber-800',
  cancelled: 'text-red-800',
  disabled: 'text-slate-400',
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
      <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm" aria-busy="true">
        <div className="mb-6 h-5 w-28 animate-pulse rounded bg-slate-100" />
        <div className="space-y-5">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-18 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-red-100 bg-red-50 p-7 text-red-800 shadow-sm">
        <h2 className="text-base font-black">ลำดับงาน</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  if (!steps.length) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="text-xl font-black tracking-tight text-slate-950">ลำดับงาน</h2>
        <p className="mt-3 rounded-2xl border border-dashed p-5 text-sm text-slate-500">{emptyText}</p>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-950">ลำดับงาน</h2>
        {nextHint ? <p className="mt-1 text-sm font-bold text-slate-500">{nextHint}</p> : null}
      </div>

      <ol className="mt-7 space-y-0">
        {steps.map((step, index) => {
          const state = step.state || 'pending'
          const markerTone = markerClassName[state] || markerClassName.pending
          const lineTone = lineClassName[state] || lineClassName.pending
          const itemTone = itemClassName[state] || itemClassName.pending
          const labelTone = labelClassName[state] || labelClassName.pending
          const isLast = index === steps.length - 1
          return (
            <li key={step.id || step.key || index} className="relative flex min-h-[76px] gap-4 pb-4 last:min-h-0 last:pb-0">
              {!isLast ? <span className={`absolute left-[18px] top-10 h-full w-0.5 ${lineTone}`} aria-hidden="true" /> : null}
              <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black shadow-sm ${markerTone}`}>
                {state === 'completed' ? '✓' : index + 1}
              </span>
              <div className={`min-w-0 flex-1 rounded-2xl border border-transparent px-4 py-3 ${itemTone}`}>
                <p className={`text-sm font-black ${labelTone}`}>{step.label || step.name || 'ขั้นตอน'}</p>
                {step.description || step.helperText ? (
                  <p className={state === 'current' ? 'mt-1 text-xs font-black text-amber-600' : 'mt-1 text-xs font-semibold text-slate-500'}>
                    {step.description || step.helperText}
                  </p>
                ) : null}
                {step.completedAt || step.actorName ? (
                  <p className="mt-1 text-xs font-semibold text-slate-500">{[step.completedAt, step.actorName].filter(Boolean).join(' • ')}</p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
