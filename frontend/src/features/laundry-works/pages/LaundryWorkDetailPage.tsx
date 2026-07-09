import { BottomActionBar } from '../components/BottomActionBar'
import { CountTable } from '../components/CountTable'
import { HistoryPanel } from '../components/HistoryPanel'
import { ImagePanel } from '../components/ImagePanel'
import { IssuePanel } from '../components/IssuePanel'
import { WorkHeader } from '../components/WorkHeader'
import { WorkSummaryCards } from '../components/WorkSummaryCards'
import { WorkTimeline } from '../components/WorkTimeline'
import { useLaundryWorkController } from '../controllers/useLaundryWorkController'

export function LaundryWorkDetailPage() {
  const { projection, actions, state, loading, error, empty, requestId } = useLaundryWorkController()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 pb-24 md:px-6 md:py-6">
          <WorkHeader loading />
          <WorkSummaryCards loading />
          <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="xl:sticky xl:top-4 xl:self-start">
              <WorkTimeline loading />
            </aside>
            <div className="flex flex-col gap-4">
              <CountTable loading />
              <div className="grid gap-4 lg:grid-cols-2">
                <IssuePanel loading />
                <ImagePanel loading />
              </div>
              <HistoryPanel loading />
            </div>
          </div>
        </main>
        <BottomActionBar actions={actions.work} state={state} loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 pb-24 md:px-6 md:py-6">
          <section className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800 shadow-sm">
            <p className="text-sm font-semibold">ไม่สามารถโหลดรายละเอียดงานซักได้</p>
            <p className="mt-1 text-sm">{error}</p>
            {requestId ? <p className="mt-2 text-xs text-red-600">requestId: {requestId}</p> : null}
          </section>
        </main>
        <BottomActionBar actions={actions.work} state={state} error={error} />
      </div>
    )
  }

  if (empty) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 pb-24 md:px-6 md:py-6">
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">ไม่พบข้อมูลงานซัก</p>
            <p className="mt-1 text-sm text-slate-500">ยังไม่มีข้อมูลที่พร้อมแสดงสำหรับ Work Detail นี้</p>
          </section>
        </main>
        <BottomActionBar actions={actions.work} state={state} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 pb-24 md:px-6 md:py-6">
        <WorkHeader work={projection.work} status={projection.status} workspace={projection.workspace} meta={projection.meta} />

        <WorkSummaryCards items={projection.summaryCards} />

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-4 xl:self-start">
            <WorkTimeline steps={projection.timeline} nextHint={projection.nextHint} />
          </aside>

          <div className="flex flex-col gap-4">
            <CountTable rows={projection.countRows} columns={projection.countColumns} />

            <div className="grid gap-4 lg:grid-cols-2">
              <IssuePanel issues={projection.issues} actions={actions.issue} />
              <ImagePanel images={projection.images} actions={actions.image} />
            </div>

            <HistoryPanel events={projection.history} />
          </div>
        </div>
      </main>

      <BottomActionBar actions={actions.work} state={state} />
    </div>
  )
}
