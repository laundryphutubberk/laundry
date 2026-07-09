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

const statusToneClassName: Record<string, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
  default: 'border-blue-100 bg-blue-50 text-blue-700',
}

export function WorkHeader({ work, status, workspace, meta, actions = [], loading = false, error = null }: WorkHeaderProps) {
  const title = work?.workNo || work?.title || work?.code || work?.id || 'Laundry Work'
  const resortName = work?.resortName || work?.customerName || workspace?.resortName || 'ไม่ระบุรีสอร์ต'
  const statusLabel = status?.label || work?.currentStatus || work?.status || 'ไม่ระบุสถานะ'
  const subtitle = work?.description || work?.note || 'ภาพรวมงานซักและสถานะปัจจุบัน'
  const statusTone = statusToneClassName[status?.tone || 'default'] || statusToneClassName.default
  const safeActions = actions.length
    ? actions
    : [
        { label: 'พิมพ์รายงาน', variant: 'secondary' as const },
        { label: 'แก้ไขข้อมูลงาน', variant: 'primary' as const },
      ]

  if (loading) {
    return (
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm" aria-busy="true">
        <div className="animate-pulse space-y-5">
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="h-10 w-80 max-w-full rounded bg-slate-100" />
          <div className="h-4 w-full max-w-lg rounded bg-slate-100" />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="h-16 rounded-2xl bg-slate-100" />
            <div className="h-16 rounded-2xl bg-slate-100" />
            <div className="h-16 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[30px] border border-red-100 bg-red-50 p-6 text-red-800 shadow-sm">
        <p className="text-base font-semibold">ไม่สามารถแสดงข้อมูลงานซักได้</p>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between lg:p-7">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              {workspace?.workspaceLabel || 'Laundry Work Detail'}
            </p>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone}`}>{statusLabel}</span>
          </div>

          <div className="space-y-2">
            <h1 className="break-words text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">งาน #{title}</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 lg:justify-end">
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
                    ? 'rounded-2xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50'
                    : 'rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
                }
              >
                {action.label || 'ดำเนินการ'}
              </button>
            )
          })}
        </div>
      </div>

      <dl className="grid border-t bg-slate-50/80 text-sm text-slate-600 md:grid-cols-4">
        <div className="border-b p-4 md:border-b-0 md:border-r lg:px-7">
          <dt className="text-xs font-medium text-slate-400">รีสอร์ต</dt>
          <dd className="mt-1 font-semibold text-slate-900">{resortName}</dd>
        </div>
        <div className="border-b p-4 md:border-b-0 md:border-r lg:px-7">
          <dt className="text-xs font-medium text-slate-400">วันที่รับงาน</dt>
          <dd className="mt-1 font-semibold text-slate-900">{meta?.receivedAt || work?.receivedAt || '-'}</dd>
        </div>
        <div className="border-b p-4 md:border-b-0 md:border-r lg:px-7">
          <dt className="text-xs font-medium text-slate-400">ผู้รับผิดชอบ</dt>
          <dd className="mt-1 font-semibold text-slate-900">{meta?.ownerName || work?.ownerName || '-'}</dd>
        </div>
        <div className="p-4 lg:px-7">
          <dt className="text-xs font-medium text-slate-400">อัปเดตล่าสุด</dt>
          <dd className="mt-1 font-semibold text-slate-900">{meta?.updatedAt || work?.updatedAt || '-'}</dd>
        </div>
      </dl>
    </section>
  )
}
