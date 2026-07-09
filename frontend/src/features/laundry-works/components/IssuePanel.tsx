export function IssuePanel({ issues = [], actions }) {
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">ปัญหาที่พบ</h2>
          <p className="mt-1 text-sm text-slate-500">แสดงปัญหาที่ถูกบันทึกไว้อย่างชัดเจน</p>
        </div>
        {actions?.canCreateIssue ? (
          <button type="button" onClick={actions.onCreateIssue} className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            เพิ่มปัญหา
          </button>
        ) : null}
      </div>

      {issues.length ? (
        <div className="mt-4 grid gap-3">
          {issues.map((issue, index) => (
            <article key={issue.id || index} className="rounded-xl border bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{issue.title || issue.type || 'ปัญหา'}</p>
                  {issue.description ? <p className="mt-1 text-sm text-slate-500">{issue.description}</p> : null}
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600">
                  {issue.status || 'open'}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed p-4 text-sm text-slate-500">ยังไม่มีปัญหาที่บันทึกไว้</p>
      )}
    </section>
  )
}
