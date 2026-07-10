import { useState } from 'react'

import { useLaundryIssueController } from '../controllers/useLaundryIssueController'

const issueTypeOptions = [
  ['DAMAGED', 'ผ้าเสียหาย'],
  ['MISSING', 'ผ้าสูญหาย'],
  ['COUNT_MISMATCH', 'จำนวนไม่ตรง'],
  ['RETURN_MISMATCH', 'ส่งคืนไม่ตรง'],
  ['OTHER', 'อื่น ๆ'],
] as const

export function LaundryIssueRuntimePanel({ workId, workStatus }: { workId?: string | number; workStatus?: string }) {
  const runtime = useLaundryIssueController({ workId, workStatus })
  const [showForm, setShowForm] = useState(false)
  const [issueType, setIssueType] = useState<(typeof issueTypeOptions)[number][0]>('DAMAGED')
  const [quantity, setQuantity] = useState('1')
  const [description, setDescription] = useState('')

  const submitIssue = async () => {
    const normalizedQuantity = Number(quantity)
    if (!description.trim() || !Number.isInteger(normalizedQuantity) || normalizedQuantity < 0) return

    const created = await runtime.createIssue({
      issueType,
      quantity: normalizedQuantity,
      description: description.trim(),
    })

    if (created) {
      setDescription('')
      setQuantity('1')
      setShowForm(false)
    }
  }

  const editIssue = async (issueId: string | number, currentDescription?: string | null) => {
    const nextDescription = window.prompt('แก้ไขรายละเอียดปัญหา', currentDescription || '')?.trim()
    if (!nextDescription || nextDescription === currentDescription) return
    await runtime.updateIssue(issueId, { description: nextDescription })
  }

  const resolveIssue = async (issueId: string | number) => {
    const resolutionNote = window.prompt('ระบุรายละเอียดการแก้ไขปัญหา')?.trim()
    if (!resolutionNote) return
    await runtime.resolveIssue(issueId, resolutionNote)
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950">ปัญหาในงานซัก</h2>
          <p className="mt-1 text-sm text-slate-500">บันทึก ติดตาม และปิดปัญหาที่พบระหว่างการดำเนินงาน</p>
        </div>
        {runtime.policy.canCreate ? (
          <button type="button" onClick={() => setShowForm((value) => !value)} disabled={runtime.busy} className="rounded-2xl bg-blue-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {showForm ? 'ปิดแบบฟอร์ม' : 'เพิ่มปัญหา'}
          </button>
        ) : null}
      </div>

      {showForm ? (
        <div className="mt-5 grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            ประเภทปัญหา
            <select value={issueType} onChange={(event) => setIssueType(event.target.value as typeof issueType)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              {issueTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            จำนวน
            <input type="number" min="0" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            รายละเอียด
            <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
          </label>
          <button type="button" onClick={() => void submitIssue()} disabled={runtime.busy || !description.trim()} className="justify-self-end rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">
            {runtime.busy ? 'กำลังบันทึก...' : 'บันทึกปัญหา'}
          </button>
        </div>
      ) : null}

      {runtime.error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{runtime.error.message}</p> : null}

      {runtime.loading ? (
        <p className="mt-5 text-sm text-slate-500">กำลังโหลดปัญหา...</p>
      ) : runtime.issues.length ? (
        <div className="mt-5 grid gap-3">
          {runtime.issues.map((issue) => (
            <article key={issue.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-black text-slate-950">{issue.issueType}</p>
                  <p className="mt-1 text-sm text-slate-600">{issue.description}</p>
                  <p className="mt-2 text-xs text-slate-500">จำนวน {issue.quantity ?? 0} · สถานะ {issue.status}</p>
                </div>
                {issue.status !== 'RESOLVED' ? (
                  <div className="flex shrink-0 gap-2">
                    {runtime.policy.canUpdate ? (
                      <button type="button" onClick={() => void editIssue(issue.id, issue.description)} disabled={runtime.busy} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 disabled:opacity-50">
                        แก้ไข
                      </button>
                    ) : null}
                    {runtime.policy.canResolve ? (
                      <button type="button" onClick={() => void resolveIssue(issue.id)} disabled={runtime.busy} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 disabled:opacity-50">
                        แก้ไขแล้ว
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed p-5 text-sm text-slate-500">ยังไม่มีปัญหาที่บันทึกไว้</p>
      )}
    </section>
  )
}
