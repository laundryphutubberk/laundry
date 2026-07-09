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

export type WorkHeaderProps = {
  work?: WorkHeaderProjection | null
  status?: WorkHeaderStatus | null
  workspace?: WorkHeaderWorkspace | null
  meta?: WorkHeaderMeta | null
  loading?: boolean
  error?: string | null
}

export function WorkHeader({ work, status, workspace, meta, loading = false, error = null }: WorkHeaderProps) {
  const title = work?.workNo || work?.title || work?.code || work?.id || 'Laundry Work'
  const resortName = work?.resortName || work?.customerName || workspace?.resortName || 'ไม่ระบุรีสอร์ต'
  const statusLabel = status?.label || work?.currentStatus || work?.status || 'ไม่ระบุสถานะ'
  const subtitle = work?.description || work?.note || 'ภาพรวมงานซักและสถานะปัจจุบัน'

  if (loading) {
    return (
      <section className="rounded-2xl border bg-white p-4 shadow-sm" aria-busy="true">
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
      <section className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800 shadow-sm">
        <p className="text-sm font-semibold">ไม่สามารถแสดงข้อมูลงานซักได้</p>
        <p className="mt-1 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {workspace?.workspaceLabel || 'Laundry Work'}
          </p>
          <h1 className="truncate text-xl font-semibold text-slate-950 md:text-2xl">{title}</h1>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
            {statusLabel}
          </span>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {resortName}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <span className="block text-xs text-slate-400">วันที่รับงาน</span>
          <span>{meta?.receivedAt || work?.receivedAt || '-'}</span>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <span className="block text-xs text-slate-400">อัปเดตล่าสุด</span>
          <span>{meta?.updatedAt || work?.updatedAt || '-'}</span>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <span className="block text-xs text-slate-400">ผู้รับผิดชอบ</span>
          <span>{meta?.ownerName || work?.ownerName || '-'}</span>
        </div>
      </div>
    </section>
  )
}
