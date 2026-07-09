import type { ApiFailure, LaundryWorkDetailDTO } from '../api/laundryWorkApi'
import type { LaundryWorkWorkspaceScope } from '../state/laundryWork.store'

export type LaundryWorkDetailProjectionInput = {
  detail?: LaundryWorkDetailDTO | null
  loading?: boolean
  error?: ApiFailure['error'] | string | null
  workspaceScope: LaundryWorkWorkspaceScope
}

const workflowSteps = [
  { key: 'receive_bags', label: 'รับถุง', status: 'BAG_RECEIVED' },
  { key: 'factory_receive', label: 'โรงซักรับถุง', status: 'FACTORY_RECEIVED' },
  { key: 'open_bag', label: 'เปิดถุง', status: 'BAG_OPENED' },
  { key: 'count_items', label: 'นับชิ้น', status: 'ITEM_COUNTED' },
  { key: 'sort_type', label: 'แยกประเภท', status: 'TYPE_SORTED' },
  { key: 'sort_color', label: 'แยกสี', status: 'COLOR_SORTED' },
  { key: 'record_data', label: 'บันทึกข้อมูล', status: 'DATA_RECORDED' },
  { key: 'return_work', label: 'ส่งกลับ', status: 'RETURNED' },
  { key: 'close_work', label: 'ปิดงาน', status: 'CLOSED' },
]

const statusLabels: Record<string, string> = {
  DRAFT: 'ฉบับร่าง',
  BAG_RECEIVED: 'รับถุงแล้ว',
  FACTORY_RECEIVED: 'โรงซักรับถุงแล้ว',
  BAG_OPENED: 'เปิดถุงแล้ว',
  ITEM_COUNTED: 'นับชิ้นแล้ว',
  TYPE_SORTED: 'แยกประเภทแล้ว',
  COLOR_SORTED: 'แยกสีแล้ว',
  DATA_RECORDED: 'บันทึกข้อมูลแล้ว',
  RETURNED: 'ส่งกลับแล้ว',
  CLOSED: 'ปิดงานแล้ว',
  CANCELLED: 'ยกเลิก',
}

function formatDate(value?: string | null) {
  if (!value) return '-'

  return value
}

function getErrorMessage(error?: ApiFailure['error'] | string | null) {
  if (!error) return null
  if (typeof error === 'string') return error

  return error.requestId ? `${error.message} (requestId: ${error.requestId})` : error.message
}

function buildTimeline(currentStatus?: string) {
  const currentIndex = workflowSteps.findIndex((step) => step.status === currentStatus)

  return workflowSteps.map((step, index) => ({
    key: step.key,
    label: step.label,
    state: currentStatus === 'CANCELLED'
      ? 'cancelled'
      : currentIndex === -1
        ? 'pending'
        : index < currentIndex
          ? 'completed'
          : index === currentIndex
            ? 'current'
            : 'pending',
    description: step.status === currentStatus ? 'ขั้นตอนปัจจุบัน' : undefined,
  }))
}

export function buildLaundryWorkDetailProjection({
  detail,
  loading = false,
  error = null,
  workspaceScope,
}: LaundryWorkDetailProjectionInput) {
  const work = detail?.work
  const errorMessage = getErrorMessage(error)
  const currentStatus = work?.currentStatus || 'DRAFT'
  const statusLabel = statusLabels[currentStatus] || currentStatus
  const countLines = detail?.countLines || []
  const issues = detail?.issues || []
  const history = detail?.statusLogs || []
  const countedQuantity = countLines.reduce((total, line) => total + Number(line.quantity || 0), 0)
  const issueQuantity = issues.reduce((total, issue) => total + Number(issue.quantity || 0), 0)

  return {
    work: work
      ? {
          id: work.id,
          workNo: work.workNo,
          title: work.workNo,
          description: work.note || 'ภาพรวมงานซักและสถานะปัจจุบัน',
          resortName: work.resortName,
          currentStatus,
          receivedAt: formatDate(work.receivedDate),
          updatedAt: formatDate(work.updatedAt),
          note: work.note || undefined,
        }
      : {
          title: 'Laundry Work',
          description: loading ? 'กำลังโหลดข้อมูลงานซัก' : 'ไม่พบข้อมูลงานซัก',
        },
    status: {
      label: statusLabel,
    },
    workspace: {
      resortName: work?.resortName,
      workspaceLabel: workspaceScope.workspaceType === 'RESORT' ? 'Resort Workspace' : 'Laundry Workspace',
    },
    meta: {
      receivedAt: formatDate(work?.receivedDate),
      updatedAt: formatDate(work?.updatedAt),
    },
    timeline: work ? buildTimeline(currentStatus) : [],
    nextHint: work ? 'เลือก action ด้านล่างเพื่อไปขั้นตอนถัดไปตาม policy' : undefined,
    summaryCards: [
      { key: 'bag-count', label: 'จำนวนถุง', value: work?.bagCount ?? '-', unit: 'ถุง' },
      { key: 'counted-items', label: 'นับแล้วทั้งหมด', value: work ? countedQuantity : '-', unit: 'ชิ้น' },
      { key: 'issue-items', label: 'ชิ้นที่มีปัญหา', value: work ? issueQuantity : '-', unit: 'ชิ้น', tone: issueQuantity ? 'warning' : 'default' },
      { key: 'work-status', label: 'สถานะงาน', value: statusLabel },
    ],
    countRows: countLines.map((line) => ({
      id: line.id,
      type: line.itemTypeName || '-',
      category: line.category || '-',
      color: line.colorGroup || '-',
      quantity: line.quantity ?? '-',
      weight: line.weight || '-',
    })),
    countColumns: [
      { key: 'type', label: 'ประเภทผ้า' },
      { key: 'category', label: 'หมวดหมู่' },
      { key: 'color', label: 'สี' },
      { key: 'quantity', label: 'จำนวน', align: 'right' },
      { key: 'weight', label: 'น้ำหนัก', align: 'right' },
    ],
    issues: issues.map((issue) => ({
      id: issue.id,
      issueType: issue.issueType,
      description: issue.description || undefined,
      quantity: issue.quantity,
      itemTypeName: issue.itemTypeName,
      status: issue.status,
      reportedAt: formatDate(issue.reportedAt),
      reportedBy: issue.reportedBy,
    })),
    images: [],
    history: history.map((event) => ({
      id: event.id,
      eventLabel: event.toStatus,
      description: event.note || undefined,
      timestamp: formatDate(event.changedAt),
      actorName: event.changedByName || undefined,
    })),
    loading,
    error: errorMessage,
    empty: !loading && !error && !work,
  }
}
