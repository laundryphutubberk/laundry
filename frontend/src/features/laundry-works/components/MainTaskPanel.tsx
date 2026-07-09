export type MainTaskPanelMode = 'read-only' | 'interactive' | 'blocked'

export type MainTaskPanelProjection = {
  activeStepKey?: string
  title?: string
  description?: string
  mode?: MainTaskPanelMode
  blockerReason?: string
}

export type MainTaskPanelProps = {
  mainTaskPanel?: MainTaskPanelProjection | null
  loading?: boolean
  error?: string | null
  emptyText?: string
}

const modeClassName: Record<MainTaskPanelMode, string> = {
  'read-only': 'border-slate-200 bg-white text-slate-900',
  interactive: 'border-blue-200 bg-blue-50/70 text-blue-950 shadow-blue-100/70',
  blocked: 'border-amber-200 bg-amber-50/80 text-amber-950 shadow-amber-100/70',
}

const modeLabel: Record<MainTaskPanelMode, string> = {
  'read-only': 'ดูข้อมูล',
  interactive: 'พร้อมดำเนินการ',
  blocked: 'รอแก้ไขก่อนดำเนินการ',
}

const modeBadgeClassName: Record<MainTaskPanelMode, string> = {
  'read-only': 'border-slate-200 bg-slate-50 text-slate-600',
  interactive: 'border-blue-200 bg-blue-100 text-blue-800',
  blocked: 'border-amber-200 bg-amber-100 text-amber-800',
}

export function MainTaskPanel({
  mainTaskPanel,
  loading = false,
  error = null,
  emptyText = 'ยังไม่มีขั้นตอนหลักที่ต้องดำเนินการ',
}: MainTaskPanelProps) {
  if (loading) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm" aria-busy="true">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="h-8 w-72 max-w-full rounded bg-slate-100" />
          <div className="h-4 w-full max-w-2xl rounded bg-slate-100" />
          <div className="h-16 rounded-2xl bg-slate-100" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-red-100 bg-red-50 p-7 text-red-800 shadow-sm">
        <p className="text-base font-black">ไม่สามารถแสดงงานหลักได้</p>
        <p className="mt-2 text-sm font-semibold">{error}</p>
      </section>
    )
  }

  if (!mainTaskPanel) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Current Task</p>
        <p className="mt-4 rounded-2xl border border-dashed border-slate-200 p-5 text-sm font-semibold text-slate-500">{emptyText}</p>
      </section>
    )
  }

  const mode = mainTaskPanel.mode || 'read-only'
  const panelTone = modeClassName[mode]
  const badgeTone = modeBadgeClassName[mode]

  return (
    <section className={`rounded-[28px] border p-7 shadow-sm ${panelTone}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Current Task</p>
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${badgeTone}`}>{modeLabel[mode]}</span>
          </div>

          <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-slate-950">{mainTaskPanel.title || 'งานหลัก'}</h2>
          {mainTaskPanel.description ? (
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{mainTaskPanel.description}</p>
          ) : null}
        </div>

        {mainTaskPanel.activeStepKey ? (
          <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-right shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Step Key</p>
            <p className="mt-1 text-sm font-black text-slate-800">{mainTaskPanel.activeStepKey}</p>
          </div>
        ) : null}
      </div>

      {mode === 'blocked' && mainTaskPanel.blockerReason ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-white/70 p-4 text-sm font-semibold leading-6 text-amber-800">
          {mainTaskPanel.blockerReason}
        </div>
      ) : null}
    </section>
  )
}
