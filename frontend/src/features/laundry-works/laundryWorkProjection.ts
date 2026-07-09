import type { ApiFailure, LaundryWorkDetailDTO } from './api/laundryWorkApi'
import type { LaundryWorkPolicyActionModel } from './laundryWork.policy'
import type { LaundryWorkWorkspaceScope } from './laundryWork.store'

export type LaundryWorkDetailProjectionInput = {
  detail?: LaundryWorkDetailDTO | null
  loading?: boolean
  error?: ApiFailure['error'] | null
  workspaceScope: LaundryWorkWorkspaceScope
  actionModel: LaundryWorkPolicyActionModel
}

function formatDate(value?: string | null) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    DRAFT: 'ร่างงาน',
    BAG_RECEIVED: 'รับถุงแล้ว',
    FACTORY_RECEIVED: 'โรงซักรับแล้ว',
    BAG_OPENED: 'เปิดถุงแล้ว',
    ITEM_COUNTED: 'นับชิ้นแล้ว',
    TYPE_SORTED: 'แยกประเภทแล้ว',
    COLOR_SORTED: 'แยกสีแล้ว',
    DATA_RECORDED: 'บันทึกข้อมูลแล้ว',
    RETURNED: 'ส่งกลับแล้ว',
    CLOSED: 'ปิดงานแล้ว',
    CANCELLED: 'ยกเลิก',
  }

  return labels[status || ''] || status || 'ไม่ระบุสถานะ'
}

function buildTimeline(status?: string) {
  const steps = [
    ['BAG_RECEIVED', 'รับถุง'],
    ['FACTORY_RECEIVED', 'โรงซักรับถุง'],
    ['BAG_OPENED', 'เปิดถุง'],
    ['ITEM_COUNTED', 'นับชิ้น'],
    ['TYPE_SORTED', 'แยกประเภท'],
    ['COLOR_SORTED', 'แยกสี'],
    ['DATA_RECORDED', 'บันทึกข้อมูล'],
    ['RETURNED', 'ส่งกลับ'],
    ['CLOSED', 'ปิดงาน'],
  ]
  const currentIndex = Math.max(steps.findIndex(([key]) => key === status), 0)

  return steps.map(([key, label], index) => ({
    key,
    label,
    state: status === 'CANCELLED' ? 'cancelled' : index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'pending',
  }))
}

export function projectLaundryWorkDetail(input: LaundryWorkDetailProjectionInput) {
  const { detail, loading = false, error = null, workspaceScope, actionModel } = input
  const work = detail?.work
  const safeError = error ? `${error.message}${error.requestId ? ` (requestId: ${error.requestId})` : ''}` : null

  return {
    loading,
    error: safeError,
    empty: !loading && !error && !work,
    work: work
      ? {
          id: work.id,
          workNo: work.workNo,
          resortId: work.resortId,
          resortName: work.resortName,
          currentStatus: work.currentStatus,
          status: work.currentStatus,
          note: work.note,
          receivedAt: formatDate(work.receivedDate),
          updatedAt: formatDate(work.updatedAt),
          title: work.workNo,
          description: work.note || 'ภาพรวมงานซักและสถานะปัจจุบัน',
        }
      : {
          title: 'Laundry Work',
          description: 'ยังไม่มีข้อมูลงานซัก',
        },
    status: {
      label: statusLabel(work?.currentStatus),
    },
    workspace: {
      workspaceLabel: workspaceScope.workspaceType === 'RESORT' ? 'Resort Workspace' : 'Laundry Workspace',
      resortName: work?.resortName,
    },
    meta: {
      receivedAt: formatDate(work?.receivedDate),
      updatedAt: formatDate(work?.updatedAt),
    },
    timeline: buildTimeline(work?.currentStatus),
    nextHint: work ? 'ดำเนินงานตามขั้นตอนที่ policy อนุญาต' : 'เลือกงานซักเพื่อเริ่มทำงาน',
    summaryCards: [
      { key: 'bag-count', label: 'จำนวนถุง', value: work?.bagCount ?? '-' },
      { key: 'issue-count', label: 'ปัญหา', value: work?.issueCount ?? '-', tone: work?.issueCount ? 'warning' : 'default' },
      { key: 'status', label: 'สถานะ', value: statusLabel(work?.currentStatus) },
      { key: 'resort', label: 'รีสอร์ต', value: work?.resortName || '-' },
    ],
    countRows: (detail?.countLines || []).map((line) => ({
      id: line.id,
      type: line.itemTypeName || '-',
      category: line.category || '-',
      color: line.colorGroup || '-',
      quantity: line.quantity,
      weight: line.weight || '-',
    })),
    countColumns: undefined,
    issues: detail?.issues || [],
    images: [],
    history: (detail?.statusLogs || []).map((log) => ({
      id: log.id,
      label: log.toStatus,
      eventLabel: statusLabel(log.toStatus),
      timestamp: formatDate(log.changedAt),
      actorName: log.changedByName,
      note: log.note,
    })),
    actions: actionModel,
  }
}
