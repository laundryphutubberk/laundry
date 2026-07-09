export function WorkHeader({ work, status, workspace, meta }) {
  const title = work?.title || work?.code || work?.id || 'Laundry Work'
  const resortName = work?.resortName || workspace?.resortName || 'ไม่ระบุรีสอร์ต'
  const statusLabel = status?.label || work?.status || 'ไม่ระบุสถานะ'
  const subtitle = work?.description || work?.note || 'ภาพรวมงานซักและสถานะปัจจุบัน'

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Laundry Work</p>
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
        <div>
          <span className="block text-xs text-slate-400">สร้างเมื่อ</span>
          <span>{meta?.createdAt || work?.createdAt || '-'}</span>
        </div>
        <div>
          <span className="block text-xs text-slate-400">อัปเดตล่าสุด</span>
          <span>{meta?.updatedAt || work?.updatedAt || '-'}</span>
        </div>
        <div>
          <span className="block text-xs text-slate-400">ผู้รับผิดชอบ</span>
          <span>{meta?.ownerName || work?.ownerName || '-'}</span>
        </div>
      </div>
    </section>
  )
}
