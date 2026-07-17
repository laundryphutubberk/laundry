import type { InboundCustodyStatus } from '../api/inboundCustodyApi'

export type InboundCustodyPolicyAction = {
  label: string
  allowed: boolean
  disabled?: boolean
  reasonCode?: string
  message?: string
}

const allow = (label: string): InboundCustodyPolicyAction => ({
  label,
  allowed: true,
})

const deny = (label: string, reasonCode: string, message: string): InboundCustodyPolicyAction => ({
  label,
  allowed: false,
  disabled: true,
  reasonCode,
  message,
})

export type InboundCustodyPolicyInput = {
  workStatus?: string
  custodyStatus?: InboundCustodyStatus | null
  workspaceType?: string
  loading?: boolean
  error?: string | null
}

export type InboundCustodyPolicyActionModel = {
  initiate: InboundCustodyPolicyAction
  confirmReceipt: InboundCustodyPolicyAction
  recordCountEvidence: InboundCustodyPolicyAction
  close: InboundCustodyPolicyAction
}

const inboundEligibleStatuses = new Set([
  'BAG_RECEIVED',
  'FACTORY_RECEIVED',
  'BAG_OPENED',
  'ITEM_COUNTED',
  'TYPE_SORTED',
  'COLOR_SORTED',
  'DATA_RECORDED',
])

export function getInboundCustodyActionModel({
  workStatus,
  custodyStatus,
  workspaceType,
  loading = false,
  error = null,
}: InboundCustodyPolicyInput): InboundCustodyPolicyActionModel {
  const isLaundryWorkspace = workspaceType === 'LAUNDRY'
  const busyOrErrored = loading || Boolean(error)
  const workEligible = inboundEligibleStatuses.has(workStatus || '')
  const terminalWork = ['CLOSED', 'CANCELLED'].includes(workStatus || '')

  const boundaryDenyReason = !isLaundryWorkspace
    ? ['LAUNDRY_WORKSPACE_REQUIRED', 'Laundry workspace is required for inbound custody operations.']
    : busyOrErrored
      ? ['DETAIL_NOT_READY', 'Work detail is not ready.']
      : terminalWork
        ? ['TERMINAL_WORK', 'Work is in terminal status.']
        : !workEligible
          ? ['WORK_NOT_ELIGIBLE', 'Work is not eligible for inbound custody tracking.']
          : null

  const canMutate = !boundaryDenyReason

  return {
    initiate: boundaryDenyReason
      ? deny('เริ่มต้นการรับฝาก', boundaryDenyReason[0], boundaryDenyReason[1])
      : custodyStatus
        ? deny('เริ่มต้นการรับฝาก', 'ALREADY_EXISTS', 'Inbound custody operation already exists for this work.')
        : allow('เริ่มต้นการรับฝาก'),

    confirmReceipt: boundaryDenyReason
      ? deny('ยืนยันรับผ้า', boundaryDenyReason[0], boundaryDenyReason[1])
      : !custodyStatus
        ? allow('ยืนยันรับผ้า')
        : custodyStatus === 'PENDING'
          ? allow('ยืนยันรับผ้า')
          : deny('ยืนยันรับผ้า', 'WRONG_STATUS', `Cannot confirm receipt when status is ${custodyStatus}.`),

    recordCountEvidence: boundaryDenyReason
      ? deny('บันทึกจำนวนผ้า', boundaryDenyReason[0], boundaryDenyReason[1])
      : custodyStatus === 'RECEIPT_CONFIRMED'
        ? allow('บันทึกจำนวนผ้า')
        : deny('บันทึกจำนวนผ้า', 'WRONG_STATUS', `Cannot record count evidence when status is ${custodyStatus || 'N/A'}.`),

    close: boundaryDenyReason
      ? deny('ปิดการรับฝาก', boundaryDenyReason[0], boundaryDenyReason[1])
      : custodyStatus === 'COUNT_EVIDENCE_RECORDED'
        ? allow('ปิดการรับฝาก')
        : deny('ปิดการรับฝาก', 'WRONG_STATUS', `Cannot close when status is ${custodyStatus || 'N/A'}.`),
  }
}
