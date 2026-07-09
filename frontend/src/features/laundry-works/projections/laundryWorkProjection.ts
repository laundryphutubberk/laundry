import type { ApiFailure, LaundryWorkDetailDTO } from '../api/laundryWorkApi'
import type { LaundryWorkPolicyAction, LaundryWorkPolicyActionModel } from '../policies/laundryWork.policy'

export type LaundryWorkDetailProjectionInput = {
  detail?: LaundryWorkDetailDTO | null
  actionModel?: LaundryWorkPolicyActionModel
  loading?: boolean
  error?: ApiFailure['error'] | null
  requestId?: string
}

const statusLabels: Record<string, string> = {
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

const workflowSteps = [
  { key: 'receive_bags', label: 'รับถุง', backendStatus: 'BAG_RECEIVED' },
  { key: 'factory_receive', label: 'โรงซักรับถุง', backendStatus: 'FACTORY_RECEIVED' },
  { key: 'open_bag', label: 'เปิดถุง', backendStatus: 'BAG_OPENED' },
  { key: 'count_items', label: 'นับชิ้น', backendStatus: 'ITEM_COUNTED' },
  { key: 'sort_type', label: 'แยกประเภท', backendStatus: 'TYPE_SORTED' },
  { key: 'sort_color', label: 'แยกสี', backendStatus: 'COLOR_SORTED' },
  { key: 'record_data', label: 'บันทึกข้อมูล', backendStatus: 'DATA_RECORDED' },
  { key: 'return_work', label: 'ส่งกลับ', backendStatus: 'RETURNED' },
  { key: 'close_work', label: 'ปิดงาน', backendStatus: 'CLOSED' },
]

const formatDate = (value?: string | null) => {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const buildTimeline = (currentStatus?: string) => {
  const currentIndex = workflowSteps.findIndex((step) => step.backendStatus === currentStatus)

  return workflowSteps.map((step, index) => ({
    id: step.key,
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
    description: statusLabels[step.backendStatus] || step.backendStatus,
  }))
}

const buildMainTaskPanel = (currentStatus?: string, continueAction?: LaundryWorkPolicyAction, errorMessage?: string | null) => {
  const currentStep = workflowSteps.find((step) => step.backendStatus === currentStatus)
  const statusLabel = statusLabels[currentStatus || ''] || currentStatus

  if (errorMessage) {
    return {
      activeStepKey: currentStep?.key,
      title: 'ไม่สามารถโหลดงานหลักได้',
      description: errorMessage,
      mode: 'blocked' as const,
      blockerReason: errorMessage,
    }
  }

  if (!currentStep) {
    return {
      activeStepKey: undefined,
      title: statusLabel ? `สถานะปัจจุบัน: ${statusLabel}` : 'ยังไม่มีขั้นตอนปัจจุบัน',
      description: 'ระบบยังไม่มีข้อมูลขั้นตอนหลักสำหรับงานนี้',
      mode: 'read-only' as const,
    }
  }

  if (continueAction && !continueAction.allowed) {
    return {
      activeStepKey: currentStep.key,
      title: currentStep.label,
      description: `ขั้นตอนปัจจุบันของงานนี้คือ ${statusLabels[currentStep.backendStatus] || currentStep.backendStatus}`,
      mode: continueAction.message ? 'blocked' as const : 'read-only' as const,
      blockerReason: continueAction.message,
    }
  }

  return {
    activeStepKey: currentStep.key,
    title: currentStep.label,
    description: `ขั้นตอนปัจจุบันของงานนี้คือ ${statusLabels[currentStep.backendStatus] || currentStep.backendStatus}`,
    mode: 'interactive' as const,
  }
}

export function createLaundryWorkDetailProjection({
  detail,
  actionModel,
  loading = false,
  error = null,
  requestId,
}: LaundryWorkDetailProjectionInput) {
  const work = detail?.work
  const statusLabel = statusLabels[work?.currentStatus || ''] || work?.currentStatus || 'ไม่ระบุสถานะ'
  const issueCount = detail?.issues?.length ?? work?.issueCount ?? 0
  const countRows = (detail?.countLines || []).map((line) => ({
    id: line.id,
    type: line.itemTypeName || '-',
    category: line.category || '-',
    color: line.colorGroup || '-',
    quantity: line.quantity,
    weight: line.weight ?? '-',
  }))
  const totalQuantity = countRows.reduce((sum, row) => sum + toNumber(row.quantity), 0)
  const totalWeight = countRows.reduce((sum, row) => sum + toNumber(row.weight), 0)

  return {
    loading,
    error: error?.message || null,
    empty: !loading && !error && !work,
    requestId: requestId || error?.requestId,
    projection: {
      work: work
        ? {
            id: work.id,
            workNo: work.workNo,
            title: work.workNo,
            description: work.note || 'รายละเอียดงานซัก',
            resortName: work.resortName,
            currentStatus: work.currentStatus,
            receivedAt: formatDate(work.receivedDate),
            updatedAt: formatDate(work.updatedAt),
          }
        : null,
      status: {
        label: statusLabel,
      },
      workspace: {
        resortName: work?.resortName,
        workspaceLabel: 'Laundry Work Detail',
      },
      meta: {
        receivedAt: formatDate(work?.receivedDate),
        updatedAt: formatDate(work?.updatedAt),
      },
      timeline: buildTimeline(work?.currentStatus),
      nextHint: work ? `สถานะปัจจุบัน: ${statusLabel}` : undefined,
      mainTaskPanel: buildMainTaskPanel(work?.currentStatus, actionModel?.work.continue, error?.message || null),
      summaryCards: [
        { key: 'bag-count', label: 'จำนวนถุง', value: work?.bagCount ?? '-', unit: 'ถุง' },
        { key: 'count-lines', label: 'รายการที่นับ', value: detail?.countLines?.length ?? '-', unit: 'รายการ' },
        { key: 'issue-count', label: 'ปัญหา', value: issueCount, unit: 'รายการ', tone: issueCount > 0 ? 'warning' : 'success' },
        { key: 'status', label: 'สถานะ', value: statusLabel },
      ],
      countColumns: [
        { key: 'type', label: 'ประเภทผ้า' },
        { key: 'category', label: 'หมวดหมู่' },
        { key: 'color', label: 'สี' },
        { key: 'quantity', label: 'จำนวน', align: 'right' as const },
        { key: 'weight', label: 'น้ำหนัก', align: 'right' as const },
      ],
      countRows,
      countSummaryItems: [
        { key: 'line-count', label: 'รวมรายการ', value: countRows.length },
        { key: 'quantity-total', label: 'รวมจำนวน', value: totalQuantity || '-' },
      ],
      countRemark: totalWeight ? `น้ำหนักรวมประมาณ ${totalWeight} กก.` : 'รอตรวจสอบน้ำหนักรวม',
      issues: (detail?.issues || []).map((issue) => ({
        id: issue.id,
        issueType: issue.issueType,
        title: issue.issueType,
        description: issue.description || undefined,
        quantity: issue.quantity,
        itemTypeName: issue.itemTypeName,
        status: issue.status,
        reportedAt: formatDate(issue.reportedAt),
        reportedBy: issue.reportedBy,
      })),
      images: [],
      history: (detail?.statusLogs || []).map((event) => ({
        id: event.id,
        eventLabel: statusLabels[event.toStatus] || event.toStatus,
        note: event.note || undefined,
        timestamp: formatDate(event.changedAt),
        actorName: event.changedByName,
      })),
    },
    actions: {
      work: actionModel?.work,
      issue: actionModel?.issue,
      image: actionModel?.image,
    },
    state: {
      isBusy: loading,
      isSavingDraft: false,
      isContinuing: false,
    },
  }
}
