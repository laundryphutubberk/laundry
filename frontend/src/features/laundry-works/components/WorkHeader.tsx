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
  default: 'border-emerald-200 bg-emerald-50 text-emerald-700',
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
      <section className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm" aria-busy="true">
        <div className="animate-pulse space-y-5">
          <div className="h-4 w-44 rounded bg-slate-100" />
          <div className="h-12 w-96 max-w-full rounded bg-slate-100" />
          <div className="h-4 w-full max-w-2xl rounded bg-slate-100" />
          <div className="grid gap-3 md:grid-cols-4">
            <div className="h-14 rounded-2xl bg-slate-100" />
            <div className="h-14 rounded-2xl bg-slate-100" />
            <div className="h-14 rounded-2xl bg-slate-100" />
            <div className="h-14 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[30px] border border-red-100 bg-red-50 p-7 text-red-800 shadow-sm">
        <p className="text-base font-black">ไม่สามารถแสดงข้อมูลงานซักได้</p>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-6 p-7 lg:flex-row lg:items-start lg:justify-between xl:p-8">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-700">
              {workspace?.workspaceLabel || 'Laundry Workspace'}
            </p>
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusTone}`}>{statusLabel}</span>
          </div>

          <div className="space-y-2">
            <h1 className="break-words text-[34px] font-black leading-tight tracking-tight text-slate-950 md:text-[42px]">
              งาน #{title}
            </h1>
            <p className="max-w-4xl text-base font-medium leading-7 text-slate-600">{subtitle}</p>
          </div>

          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
            <div className="flex gap-2">
              <dt className="font-semibold text-slate-400">รีสอร์ต:</dt>
              <dd className="font-bold text-slate-800">{resortName}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-slate-400">วันที่รับงาน:</dt>
              <dd className="font-bold text-slate-800">{meta?.receivedAt || work?.receivedAt || '-'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-slate-400">ผู้รับผิดชอบ:</dt>
              <dd className="font-bold text-slate-800">{meta?.ownerName || work?.ownerName || '-'}</dd>
            </div>
          </dl>
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
                    ? 'rounded-2xl bg-blue-900 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/15 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50'
                    : 'rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
                }
              >
                {action.label || 'ดำเนินการ'}
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50/80 px-7 py-4 text-sm font-semibold text-slate-500 xl:px-8">
        อัปเดตล่าสุด <span className="font-black text-slate-800">{meta?.updatedAt || work?.updatedAt || '-'}</span>
      </div>
    </section>
  )
}
