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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-busy="true">
        <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 space-y-3">
          {[0, 1].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-800 shadow-sm">
        <h2 className="text-lg font-bold">ปัญหา/หมายเหตุ</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">ปัญหา/หมายเหตุ</h2>
          <p className="mt-1 text-sm text-slate-500">แสดงปัญหาที่ถูกบันทึกไว้อย่างชัดเจน</p>
        </div>
        {canCreateIssue ? (
          <button
            type="button"
            onClick={onCreateIssue}
            disabled={createAction?.disabled || createAction?.loading}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createAction?.loading ? 'กำลังดำเนินการ...' : createAction?.label || 'เพิ่มปัญหา'}
          </button>
        ) : null}
      </div>

      {issues.length ? (
        <div className="mt-4 grid gap-3">
          {issues.map((issue, index) => (
            <article key={issue.id || index} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{issue.title || issue.issueType || issue.type || 'ปัญหา'}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                    {issue.quantity !== undefined && issue.quantity !== null ? <span>จำนวน: {issue.quantity}</span> : null}
                    {issue.itemTypeName ? <span>รายการ: {issue.itemTypeName}</span> : null}
                    {issue.reportedAt ? <span>{issue.reportedAt}</span> : null}
                    {issue.reportedBy ? <span>โดย {issue.reportedBy}</span> : null}
                  </div>
                  {issue.description ? <p className="mt-2 text-sm text-slate-600">{issue.description}</p> : null}
                </div>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  {issue.status || 'OPEN'}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed p-4 text-sm text-slate-500">{emptyText}</p>
      )}
    </section>
  )
}
