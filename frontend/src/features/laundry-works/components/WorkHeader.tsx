export type WorkHeaderStatus = {
  label?: string
  tone?: string
}

export type WorkHeaderMeta = {
  createdAt?: string
  updatedAt?: string
  receivedAt?: string
  ownerName?: string
}

export type WorkHeaderProjection = {
  id?: string | number
  workNo?: string
  code?: string
  title?: string
  description?: string
  note?: string
  resortName?: string
  customerName?: string
  status?: string
  currentStatus?: string
  createdAt?: string
  updatedAt?: string
  receivedAt?: string
  ownerName?: string
}

export type WorkHeaderWorkspace = {
  resortName?: string
  workspaceLabel?: string
}

export type WorkHeaderAction = {
  label?: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export type WorkHeaderProps = {
  work?: WorkHeaderProjection | null
  status?: WorkHeaderStatus | null
  workspace?: WorkHeaderWorkspace | null
  meta?: WorkHeaderMeta | null
  actions?: WorkHeaderAction[]
  loading?: boolean
  error?: string | null
}

export function WorkHeader({ work, status, workspace, meta, actions = [], loading = false, error = null }: WorkHeaderProps) {
  const title = work?.workNo || work?.title || work?.code || work?.id || 'Laundry Work'
  const resortName = work?.resortName || work?.customerName || workspace?.resortName || 'ไม่ระบุรีสอร์ต'
  const statusLabel = status?.label || work?.currentStatus || work?.status || 'ไม่ระบุสถานะ'
  const subtitle = work?.description || work?.note || 'ภาพรวมงานซักและสถานะปัจจุบัน'
  const safeActions = actions.length
    ? actions
    : [
        { label: 'พิมพ์รายงาน', variant: 'secondary' as const },
        { label: 'แก้ไขข้อมูลงาน', variant: 'primary' as const },
      ]

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-busy="true">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="h-8 w-64 max-w-full rounded bg-slate-100" />
          <div className="h-4 w-full max-w-md rounded bg-slate-100" />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-800 shadow-sm">
        <p className="text-sm font-semibold">ไม่สามารถแสดงข้อมูลงานซักได้</p>
        <p className="mt-1 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">งาน #{title}</h1>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              {statusLabel}
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {safeActions.map((action, index) => {
            const primary = action.variant === 'primary'
            return (
              <button
                key={`${action.label || 'header-action'}-${index}`}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={
                  primary
                    ? 'rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50'
                    : 'rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
                }
              >
                {action.label || 'ดำเนินการ'}
              </button>
            )
          })}
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <dt className="text-xs font-medium text-slate-400">รีสอร์ต</dt>
          <dd className="mt-1 font-semibold text-slate-700">{resortName}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <dt className="text-xs font-medium text-slate-400">วันที่รับงาน</dt>
          <dd className="mt-1 font-semibold text-slate-700">{meta?.receivedAt || work?.receivedAt || '-'}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <dt className="text-xs font-medium text-slate-400">ผู้รับผิดชอบ</dt>
          <dd className="mt-1 font-semibold text-slate-700">{meta?.ownerName || work?.ownerName || '-'}</dd>
        </div>
      </dl>
    </section>
  )
}
