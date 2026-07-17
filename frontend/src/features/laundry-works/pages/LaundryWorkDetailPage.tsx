import { BagPanel } from '../components/BagPanel'
import { BottomActionBar } from '../components/BottomActionBar'
import { CountEntryPanel } from '../components/CountEntryPanel'
import { CountTable, type CountTableRow } from '../components/CountTable'
import { HistoryPanel } from '../components/HistoryPanel'
import { ImagePanel } from '../components/ImagePanel'
import { IssuePanel } from '../components/IssuePanel'
import { MainTaskPanel } from '../components/MainTaskPanel'
import { MutationFeedbackBanner } from '../components/MutationFeedbackBanner'
import { WorkHeader } from '../components/WorkHeader'
import { WorkSummaryCards } from '../components/WorkSummaryCards'
import { WorkTimeline } from '../components/WorkTimeline'
import { LaundryImageRuntimePanel } from '../runtime/LaundryImageRuntimePanel'
import { LaundryIssueRuntimePanel } from '../runtime/LaundryIssueRuntimePanel'
import { LaundryTimelineRuntimePanel } from '../runtime/LaundryTimelineRuntimePanel'
import { LaundryClaimRuntimePanel } from '../runtime/LaundryClaimRuntimePanel'
import { InboundCustodyRuntimePanel } from '../runtime/InboundCustodyRuntimePanel'
import { LaundryWorkRuntimeHost, type LaundryWorkRuntimeHostRenderProps } from '../runtime/LaundryWorkRuntimeHost'

const pageClassName = 'min-h-screen bg-slate-100/70'
const mainClassName = 'mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 pb-28 md:px-6 lg:px-8 xl:px-10'
const detailGridClassName = 'grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[390px_minmax(0,1fr)]'

const toPositiveQuantity = (value: CountTableRow['quantity']) => {
  const quantity = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(quantity) && quantity > 0 ? quantity : undefined
}

function LaundryWorkDetailContent({ projection, actions, state, loading, error, empty, requestId, feedback, itemTypes }: LaundryWorkRuntimeHostRenderProps) {
  const handleUpdateCountLine = async (row: CountTableRow) => {
    if (!row.id) return

    const quantity = toPositiveQuantity(row.quantity)
    if (!quantity) return

    const classificationOnly = ['ITEM_COUNTED', 'TYPE_SORTED'].includes(projection.work?.currentStatus || '')
    await actions.countLine.updateCountLine(row.id, {
      itemTypeId: row.itemTypeId,
      colorGroup: typeof row.color === 'string' && row.color.trim() ? row.color.trim() : undefined,
      ...(classificationOnly ? {} : { quantity }),
    })
  }

  const handleDeleteCountLine = async (row: CountTableRow) => {
    if (!row.id) return
    await actions.countLine.deleteCountLine(row.id)
  }

  if (loading) {
    return (
      <div className={pageClassName}>
        <main className={mainClassName}>
          <WorkHeader loading />
          <WorkSummaryCards loading />
          <div className={detailGridClassName}>
            <aside className="xl:sticky xl:top-25 xl:self-start">
              <WorkTimeline loading />
            </aside>
            <div className="flex min-w-0 flex-col gap-5">
              <MainTaskPanel loading />
              <BagPanel loading />
              <CountEntryPanel loading />
              <CountTable loading />
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
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
      <div className={pageClassName}>
        <main className={mainClassName}>
          <section className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-red-800 shadow-sm">
            <p className="text-base font-semibold">ไม่สามารถโหลดรายละเอียดงานซักได้</p>
            <p className="mt-2 text-sm">{error}</p>
            {requestId ? <p className="mt-3 text-xs text-red-600">requestId: {requestId}</p> : null}
          </section>
        </main>
        <BottomActionBar actions={actions.work} state={state} error={error} />
      </div>
    )
  }

  if (empty) {
    return (
      <div className={pageClassName}>
        <main className={mainClassName}>
          <section className="rounded-[28px] border bg-white p-6 shadow-sm">
            <p className="text-base font-semibold text-slate-950">ไม่พบข้อมูลงานซัก</p>
            <p className="mt-2 text-sm text-slate-500">ยังไม่มีข้อมูลที่พร้อมแสดงสำหรับ Work Detail นี้</p>
          </section>
        </main>
        <BottomActionBar actions={actions.work} state={state} />
      </div>
    )
  }

  return (
    <div className={pageClassName}>
      <main className={mainClassName}>
        <WorkHeader work={projection.work} status={projection.status} workspace={projection.workspace} meta={projection.meta} />

        <WorkSummaryCards items={projection.summaryCards} />

        <MutationFeedbackBanner feedback={feedback} />

        <div className={detailGridClassName}>
          <aside className="xl:sticky xl:top-25 xl:self-start">
            <WorkTimeline steps={projection.timeline} nextHint={projection.nextHint} />
          </aside>

          <div className="flex min-w-0 flex-col gap-5">
            <MainTaskPanel mainTaskPanel={projection.mainTaskPanel} />

            <BagPanel bags={projection.bags} actions={actions.bag} state={state} />

            <CountEntryPanel bags={projection.bags.filter((bag) => bag.status === 'OPENED')} itemTypes={itemTypes} action={actions.countLine.createCountLine} loading={state.isCreatingCountLine} error={null} />

            <CountTable
              rows={projection.countRows}
              columns={projection.countColumns}
              summaryItems={projection.countSummaryItems}
              remark={projection.countRemark}
              emptyText="ยังไม่มีรายการนับผ้า เริ่มต้นด้วยการเลือกถุง ระบุประเภทผ้าและจำนวน แล้วกด “เพิ่มรายการ”"
              rowActions={{
                canUpdate: actions.countLine.canUpdateCountLine,
                canDelete: actions.countLine.canDeleteCountLine,
                updating: state.isUpdatingCountLine,
                deleting: state.isDeletingCountLine,
                onUpdate: handleUpdateCountLine,
                onDelete: handleDeleteCountLine,
                classificationOnly: ['ITEM_COUNTED', 'TYPE_SORTED'].includes(projection.work?.currentStatus || ''),
                itemTypes,
              }}
            />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
              <LaundryIssueRuntimePanel
                workId={projection.work?.id}
                workStatus={projection.work?.currentStatus}
                bags={projection.bags}
                countLines={projection.countRows}
              />
              <LaundryImageRuntimePanel
                workId={projection.work?.id}
                workStatus={projection.work?.currentStatus}
              />
            </div>

            <LaundryTimelineRuntimePanel workId={projection.work?.id} />
            <LaundryClaimRuntimePanel workId={projection.work?.id} workStatus={projection.work?.currentStatus} />
            <InboundCustodyRuntimePanel workId={projection.work?.id} workStatus={projection.work?.currentStatus} />
            <HistoryPanel events={projection.history} />
          </div>
        </div>
      </main>

      <BottomActionBar actions={actions.work} state={state} />
    </div>
  )
}

export function LaundryWorkDetailPage() {
  return (
    <LaundryWorkRuntimeHost>
      {(runtime) => <LaundryWorkDetailContent {...runtime} />}
    </LaundryWorkRuntimeHost>
  )
}
