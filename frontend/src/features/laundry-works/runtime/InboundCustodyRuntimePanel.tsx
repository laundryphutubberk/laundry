import { useState } from 'react'
import { useInboundCustodyController } from '../controllers/useInboundCustodyController'

const statusLabels: Record<string, string> = {
  PENDING: 'รอยืนยันรับผ้า',
  RECEIPT_CONFIRMED: 'ยืนยันรับผ้าแล้ว',
  COUNT_EVIDENCE_RECORDED: 'บันทึกจำนวนผ้าแล้ว',
  CLOSED: 'ปิดการรับฝากแล้ว',
}

const statusTones: Record<string, string> = {
  PENDING: 'text-amber-700 bg-amber-50 border-amber-200',
  RECEIPT_CONFIRMED: 'text-blue-700 bg-blue-50 border-blue-200',
  COUNT_EVIDENCE_RECORDED: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  CLOSED: 'text-green-700 bg-green-50 border-green-200',
}

export function InboundCustodyRuntimePanel({
  workId,
  workStatus,
}: {
  workId?: string | number
  workStatus?: string
}) {
  const r = useInboundCustodyController(workId, workStatus)
  const [countInput, setCountInput] = useState('')

  const handleRecordCount = async () => {
    const count = countInput ? parseInt(countInput, 10) : undefined
    await r.recordCountEvidence(count)
    setCountInput('')
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black">การรับฝากผ้า (Inbound Custody)</h2>

      {r.loading ? (
        <p className="mt-4 text-sm text-slate-500">กำลังโหลด...</p>
      ) : null}

      {r.error ? (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
          {r.error}
        </p>
      ) : null}

      {r.custody ? (
        <div className="mt-4">
          <div className={`rounded-xl border p-3 text-sm ${statusTones[r.custody.status] || 'text-slate-700 bg-slate-50 border-slate-200'}`}>
            <span className="font-bold">สถานะ:</span>{' '}
            {statusLabels[r.custody.status] || r.custody.status}
          </div>

          {r.custody.countTotalItems > 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              จำนวนผ้าทั้งหมด: <span className="font-bold">{r.custody.countTotalItems}</span> ชิ้น
            </p>
          ) : null}

          {r.custody.receiptConfirmedAt ? (
            <p className="mt-1 text-xs text-slate-400">
              ยืนยันรับผ้าเมื่อ: {new Date(r.custody.receiptConfirmedAt).toLocaleString('th-TH')}
            </p>
          ) : null}

          {r.custody.closedAt ? (
            <p className="mt-1 text-xs text-slate-400">
              ปิดเมื่อ: {new Date(r.custody.closedAt).toLocaleString('th-TH')}
            </p>
          ) : null}
        </div>
      ) : !r.loading ? (
        <p className="mt-4 text-sm text-slate-500">ยังไม่มีรายการรับฝากผ้า</p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {r.policy.initiate.allowed ? (
          <button
            type="button"
            disabled={r.pending}
            onClick={() => void r.initiate()}
            className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {r.pending ? 'กำลังดำเนินการ...' : r.policy.initiate.label}
          </button>
        ) : null}

        {r.policy.confirmReceipt.allowed ? (
          <button
            type="button"
            disabled={r.pending}
            onClick={() => void r.confirmReceipt()}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {r.pending ? 'กำลังดำเนินการ...' : r.policy.confirmReceipt.label}
          </button>
        ) : null}

        {r.policy.recordCountEvidence.allowed ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={0}
              value={countInput}
              onChange={(e) => setCountInput(e.target.value)}
              placeholder="จำนวนผ้าทั้งหมด"
              className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={r.pending}
              onClick={() => void handleRecordCount()}
              className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {r.pending ? 'กำลังบันทึก...' : r.policy.recordCountEvidence.label}
            </button>
          </div>
        ) : null}

        {r.policy.close.allowed ? (
          <button
            type="button"
            disabled={r.pending}
            onClick={() => void r.close()}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {r.pending ? 'กำลังดำเนินการ...' : r.policy.close.label}
          </button>
        ) : null}
      </div>
    </section>
  )
}
