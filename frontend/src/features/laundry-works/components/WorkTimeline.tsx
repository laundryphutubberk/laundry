const stateClassName = {
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  current: 'border-blue-200 bg-blue-50 text-blue-700',
  pending: 'border-slate-200 bg-white text-slate-500',
  disabled: 'border-slate-100 bg-slate-50 text-slate-400',
}

export function WorkTimeline({ steps = [], nextHint }) {
  if (!steps.length) {
    return (
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">ลำดับงาน</h2>
        <p className="mt-2 text-sm text-slate-500">ยังไม่มีข้อมูลลำดับงาน</p>
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
          const tone = stateClassName[step.state] || stateClassName.pending
          return (
            <li key={step.id || step.key || index} className={`rounded-xl border px-3 py-2 ${tone}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold shadow-sm">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{step.label || step.name || 'ขั้นตอน'}</p>
                  {step.description ? <p className="text-xs opacity-80">{step.description}</p> : null}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
