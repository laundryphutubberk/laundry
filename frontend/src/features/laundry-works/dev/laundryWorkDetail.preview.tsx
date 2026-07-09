import { BottomActionBar } from '../components/BottomActionBar'
import { CountTable } from '../components/CountTable'
import { HistoryPanel } from '../components/HistoryPanel'
import { ImagePanel } from '../components/ImagePanel'
import { IssuePanel } from '../components/IssuePanel'
import { LaundryWorkspaceShell } from '../components/LaundryWorkspaceShell'
import { MainTaskPanel } from '../components/MainTaskPanel'
import { WorkHeader } from '../components/WorkHeader'
import { WorkSummaryCards } from '../components/WorkSummaryCards'
import { WorkTimeline } from '../components/WorkTimeline'
import { laundryWorkDetailMock } from './laundryWorkDetail.mock'

export function LaundryWorkDetailPreview() {
  const { projection, actions, state } = laundryWorkDetailMock

  return (
    <LaundryWorkspaceShell>
      <div className="min-h-screen bg-slate-100/70 text-slate-950">
        <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 pb-28 md:px-6 lg:px-8 xl:px-10">
          <section className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-blue-900 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide">Development Preview</p>
            <h1 className="mt-1 text-lg font-bold">Laundry Work Detail</h1>
            <p className="mt-1 text-sm text-blue-700">
              Preview-only host using mock projection, action model, and state model. No API, store, runtime, or backend.
            </p>
          </section>

          <WorkHeader
            work={projection.work}
            status={projection.status}
            workspace={projection.workspace}
            meta={projection.meta}
          />

          <WorkSummaryCards items={projection.summaryCards} />

          <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[390px_minmax(0,1fr)]">
            <aside className="xl:sticky xl:top-25 xl:self-start">
              <WorkTimeline steps={projection.timeline} nextHint={projection.nextHint} />
            </aside>

            <div className="flex min-w-0 flex-col gap-5">
              <MainTaskPanel mainTaskPanel={projection.mainTaskPanel} />

              <CountTable
                rows={projection.countRows}
                columns={projection.countColumns}
                summaryItems={projection.countSummaryItems}
                remark={projection.countRemark}
              />

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
                <IssuePanel issues={projection.issues} actions={actions.issue} />
                <ImagePanel images={projection.images} actions={actions.image} />
              </div>

              <HistoryPanel events={projection.history} />
            </div>
          </div>
        </main>

        <BottomActionBar actions={actions.work} state={state} />
      </div>
    </LaundryWorkspaceShell>
  )
}
