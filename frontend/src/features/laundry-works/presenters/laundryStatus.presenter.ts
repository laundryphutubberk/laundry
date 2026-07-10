export type LaundryStatusTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger'

export type LaundryStatusPresentation = {
  code: string
  label: string
  tone: LaundryStatusTone
  description: string
  badgeClassName: string
}

const toneBadgeClassName: Record<LaundryStatusTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
}

const statusDefinitions: Record<string, Omit<LaundryStatusPresentation, 'code' | 'badgeClassName'>> = {
  DRAFT: {
    label: 'ร่างงาน',
    tone: 'neutral',
    description: 'งานถูกสร้างแล้วและยังไม่เริ่มกระบวนการรับเข้า',
  },
  BAG_RECEIVED: {
    label: 'รับถุงแล้ว',
    tone: 'info',
    description: 'รับถุงจากรีสอร์ตเข้าสู่งานเรียบร้อยแล้ว',
  },
  FACTORY_RECEIVED: {
    label: 'โรงซักรับแล้ว',
    tone: 'info',
    description: 'โรงซักยืนยันการรับงานเข้าสู่พื้นที่ปฏิบัติงานแล้ว',
  },
  BAG_OPENED: {
    label: 'เปิดถุงแล้ว',
    tone: 'warning',
    description: 'เปิดถุงและพร้อมตรวจนับรายการผ้า',
  },
  ITEM_COUNTED: {
    label: 'นับชิ้นแล้ว',
    tone: 'warning',
    description: 'บันทึกจำนวนผ้าที่ตรวจนับแล้ว',
  },
  TYPE_SORTED: {
    label: 'แยกประเภทแล้ว',
    tone: 'warning',
    description: 'แยกผ้าตามประเภทเรียบร้อยแล้ว',
  },
  COLOR_SORTED: {
    label: 'แยกสีแล้ว',
    tone: 'warning',
    description: 'แยกผ้าตามกลุ่มสีเรียบร้อยแล้ว',
  },
  DATA_RECORDED: {
    label: 'บันทึกข้อมูลแล้ว',
    tone: 'info',
    description: 'ข้อมูลปฏิบัติงานที่จำเป็นถูกบันทึกแล้ว',
  },
  RETURNED: {
    label: 'ส่งกลับแล้ว',
    tone: 'success',
    description: 'ส่งงานกลับไปยังรีสอร์ตแล้ว',
  },
  CLOSED: {
    label: 'ปิดงานแล้ว',
    tone: 'success',
    description: 'งานเสร็จสมบูรณ์และถูกปิดแล้ว',
  },
  CANCELLED: {
    label: 'ยกเลิก',
    tone: 'danger',
    description: 'งานถูกยกเลิกและเก็บไว้เป็นประวัติ',
  },
  RECEIVED: {
    label: 'รับเข้าแล้ว',
    tone: 'info',
    description: 'ถุงถูกบันทึกรับเข้าในงานแล้ว',
  },
  OPENED: {
    label: 'เปิดแล้ว',
    tone: 'warning',
    description: 'ถุงถูกเปิดเพื่อดำเนินงานแล้ว',
  },
  COUNTED: {
    label: 'นับแล้ว',
    tone: 'success',
    description: 'รายการภายในถุงถูกตรวจนับแล้ว',
  },
}

export function presentLaundryStatus(status?: string | null): LaundryStatusPresentation {
  const code = status?.trim().toUpperCase() || 'UNKNOWN'
  const definition = statusDefinitions[code] || {
    label: status?.trim() || 'ไม่ระบุสถานะ',
    tone: 'neutral' as const,
    description: 'ยังไม่มีคำอธิบายสำหรับสถานะนี้',
  }

  return {
    code,
    ...definition,
    badgeClassName: toneBadgeClassName[definition.tone],
  }
}
