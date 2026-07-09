import { BottomActionBar } from '../components/BottomActionBar'
import { CountTable } from '../components/CountTable'
import { HistoryPanel } from '../components/HistoryPanel'
import { ImagePanel } from '../components/ImagePanel'
import { IssuePanel } from '../components/IssuePanel'
import { WorkHeader } from '../components/WorkHeader'
import { WorkSummaryCards } from '../components/WorkSummaryCards'
import { WorkTimeline } from '../components/WorkTimeline'

const defaultProjection = {
  work: {
    title: 'Laundry Work',
    description: 'หน้ารายละเอียดงานซัก',
  },
  status: {
    label: 'Draft',
  },
  workspace: {},
  meta: {},
  timeline: [],
  summaryCards: [],
  countRows: [],
  issues: [],
  images: [],
  history: [],
}

export function LaundryWorkDetailPage({ projection = defaultProjection, actions = {}, state = {} }) {
  const view = { ...defaultProjection, ...projection }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 pb-24 md:px-6 md:py-6">
        <WorkHeader work={view.work} status={view.status} workspace={view.workspace} meta={view.meta} />

        <WorkSummaryCards items={view.summaryCards} />

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-4 xl:self-start">
            <WorkTimeline steps={view.timeline} nextHint={view.nextHint} />
          </aside>

          <div className="flex flex-col gap-4">
            <CountTable rows={view.countRows} columns={view.countColumns} />

            <div className="grid gap-4 lg:grid-cols-2">
              <IssuePanel issues={view.issues} actions={actions.issue} />
              <ImagePanel images={view.images} actions={actions.image} />
            </div>

            <HistoryPanel events={view.history} />
          </div>
        </div>
      </main>

      <BottomActionBar actions={actions.work} state={state} />
    </div>
  )
}
