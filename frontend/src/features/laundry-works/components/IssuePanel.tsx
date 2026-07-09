export type IssuePanelAction = {
  label?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

export type IssuePanelActions = {
  createIssue?: IssuePanelAction
  canCreateIssue?: boolean
  onCreateIssue?: () => void
}

export type IssuePanelItem = {
  id?: string | number
  title?: string
  type?: string
  issueType?: string
  description?: string
  quantity?: string | number
  itemTypeName?: string
  status?: string
  reportedAt?: string
  reportedBy?: string
}

export type IssuePanelProps = {
  issues?: IssuePanelItem[]
  actions?: IssuePanelActions
  loading?: boolean
  error?: string | null
  emptyText?: string
}

const statusClassName: Record<string, string> = {
  OPEN: 'bg-red-50 text-red-700 ring-red-100',
  REVIEWING: 'bg-amber-50 text-amber-700 ring-amber-100',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  CANCELLED: 'bg-slate-100 text-slate-500 ring-slate-200',
}

export function IssuePanel({
  issues = [],
  actions,
  loading = false,
  error = null,
  emptyText = 'ยังไม่มีปัญหาที่บันทึกไว้',
}: IssuePanelProps) {
  const createAction = actions?.createIssue
  const canCreateIssue = Boolean(createAction || actions?.canCreateIssue)
  const onCreateIssue = createAction?.onClick || actions?.onCreateIssue

  if (loading) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" aria-busy="true">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-red-800 shadow-sm">
        <h2 className="text-lg font-black">ปัญหา/หมายเหตุ</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950">ปัญหา/หมายเหตุ</h2>
          <p className="mt-1 text-sm text-slate-500">แสดงปัญหาที่ต้องเห็นก่อนดำเนินงานต่อ พร้อมสถานะ ผู้รายงาน และเวลา</p>
        </div>
        {canCreateIssue ? (
          <button
            type="button"
            onClick={onCreateIssue}
            disabled={createAction?.disabled || createAction?.loading}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-blue-900 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createAction?.loading ? 'กำลังดำเนินการ...' : createAction?.label || 'เพิ่มปัญหา'}
          </button>
        ) : null}
      </div>

      {issues.length ? (
        <div className="mt-5 grid gap-3">
          {issues.map((issue, index) => {
            const status = issue.status || 'OPEN'
            const statusTone = statusClassName[status] || statusClassName.OPEN
            const severityLabel = Number(issue.quantity || 0) > 0 ? 'ต้องตรวจสอบ' : 'ข้อมูล'
            return (
              <article key={issue.id || index} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 ring-1 ring-transparent transition hover:bg-white hover:ring-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-white">{severityLabel}</span>
                      <p className="text-sm font-black text-slate-950">{issue.title || issue.issueType || issue.type || 'ปัญหา'}</p>
                    </div>
                    <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                      {issue.quantity !== undefined && issue.quantity !== null ? <span>จำนวน: <strong className="text-slate-800">{issue.quantity}</strong></span> : null}
                      {issue.itemTypeName ? <span>รายการ: <strong className="text-slate-800">{issue.itemTypeName}</strong></span> : null}
                      {issue.reportedAt ? <span>เวลา: <strong className="text-slate-800">{issue.reportedAt}</strong></span> : null}
                      {issue.reportedBy ? <span>ผู้รายงาน: <strong className="text-slate-800">{issue.reportedBy}</strong></span> : null}
                    </div>
                    {issue.description ? <p className="rounded-xl bg-white px-3 py-2 text-sm leading-6 text-slate-600 ring-1 ring-slate-100">{issue.description}</p> : null}
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone}`}>{status}</span>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed p-5 text-sm text-slate-500">{emptyText}</p>
      )}
    </section>
  )
}
