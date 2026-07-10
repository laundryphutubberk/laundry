import { useMemo, useState } from 'react'

import { useLaundryIssueController } from '../controllers/useLaundryIssueController'

const issueTypeOptions = [
  ['DAMAGED', 'ผ้าเสียหาย'],
  ['MISSING', 'ผ้าสูญหาย'],
  ['COUNT_MISMATCH', 'จำนวนไม่ตรง'],
  ['RETURN_MISMATCH', 'ส่งคืนไม่ตรง'],
  ['OTHER', 'อื่น ๆ'],
] as const

type IssueType = (typeof issueTypeOptions)[number][0]

type IssueBagOption = {
  id?: string | number
  bagNo?: string
}

type IssueCountLineOption = {
  id?: string | number
  bagId?: string | number | null
  bagNo?: string
  type?: string
  itemTypeName?: string
  color?: string
  colorGroup?: string
}

type EditableIssue = {
  id: string | number
  issueType?: string
  bagId?: string | number | null
  countLineId?: string | number | null
  quantity?: number | null
  description?: string | null
}

type LaundryIssueRuntimePanelProps = {
  workId?: string | number
  workStatus?: string
  bags?: IssueBagOption[]
  countLines?: IssueCountLineOption[]
}

const isMutableIssueStatus = (status?: string | null) => !['RESOLVED', 'CANCELLED'].includes(status || '')

export function LaundryIssueRuntimePanel({ workId, workStatus, bags = [], countLines = [] }: LaundryIssueRuntimePanelProps) {
  const runtime = useLaundryIssueController({ workId, workStatus })
  const [showForm, setShowForm] = useState(false)
  const [editingIssueId, setEditingIssueId] = useState<string | number | null>(null)
  const [issueType, setIssueType] = useState<IssueType>('DAMAGED')
  const [bagId, setBagId] = useState('')
  const [countLineId, setCountLineId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [description, setDescription] = useState('')

  const availableCountLines = useMemo(
    () => (bagId ? countLines.filter((line) => String(line.bagId || '') === bagId) : countLines),
    [bagId, countLines],
  )

  const resetForm = () => {
    setEditingIssueId(null)
    setIssueType('DAMAGED')
    setBagId('')
    setCountLineId('')
    setDescription('')
    setQuantity('1')
  }

  const closeForm = () => {
    resetForm()
    setShowForm(false)
  }

  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (issue: EditableIssue) => {
    setEditingIssueId(issue.id)
    setIssueType((issue.issueType as IssueType) || 'DAMAGED')
    setBagId(issue.bagId ? String(issue.bagId) : '')
    setCountLineId(issue.countLineId ? String(issue.countLineId) : '')
    setQuantity(String(issue.quantity ?? 0))
    setDescription(issue.description || '')
    setShowForm(true)
  }

  const handleCountLineChange = (nextCountLineId: string) => {
    setCountLineId(nextCountLineId)
    if (!nextCountLineId) return

    const selectedCountLine = countLines.find((line) => String(line.id) === nextCountLineId)
    if (selectedCountLine?.bagId) setBagId(String(selectedCountLine.bagId))
  }

  const submitIssue = async () => {
    const normalizedQuantity = Number(quantity)
    if (!description.trim() || !Number.isInteger(normalizedQuantity) || normalizedQuantity < 0) return

    const selectedCountLine = countLines.find((line) => String(line.id) === countLineId)
    const payload = {
      issueType,
      bagId: bagId ? Number(bagId) : null,
      countLineId: countLineId ? Number(countLineId) : null,
      colorGroup: selectedCountLine?.colorGroup || selectedCountLine?.color || undefined,
      quantity: normalizedQuantity,
      description: description.trim(),
    }

    const saved = editingIssueId
      ? await runtime.updateIssue(editingIssueId, payload)
      : await runtime.createIssue({
          ...payload,
          bagId: payload.bagId ?? undefined,
          countLineId: payload.countLineId ?? undefined,
        })

    if (saved) closeForm()
  }

  const resolveIssue = async (issueId: string | number) => {
    const resolutionNote = window.prompt('ระบุรายละเอียดการแก้ไขปัญหา')?.trim()
    if (!resolutionNote) return
    await runtime.resolveIssue(issueId, resolutionNote)
  }

  const cancelIssue = async (issueId: string | number) => {
    const confirmed = window.confirm('ยืนยันยกเลิกปัญหานี้หรือไม่ ระบบจะเก็บรายการไว้เป็นประวัติ')
    if (!confirmed) return
    await runtime.updateIssue(issueId, { status: 'CANCELLED' })
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950">ปัญหาในงานซัก</h2>
          <p className="mt-1 text-sm text-slate-500">บันทึก ติดตาม และปิดปัญหาที่พบระหว่างการดำเนินงาน</p>
        </div>
        {runtime.policy.canCreate ? (
          <button
            type="button"
            onClick={showForm ? closeForm : openCreateForm}
            disabled={runtime.busy}
            className="rounded-2xl bg-blue-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {showForm ? 'ปิดแบบฟอร์ม' : 'เพิ่มปัญหา'}
          </button>
        ) : null}
      </div>

      {showForm ? (
        <div className="mt-5 grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-sm font-black text-blue-950">{editingIssueId ? 'แก้ไขและเชื่อมโยงปัญหา' : 'เพิ่มปัญหาใหม่'}</p>
            <p className="mt-1 text-xs text-blue-700">
              สามารถผูกกับระดับงาน ถุง หรือรายการนับ และล้างการเชื่อมโยงกลับเป็นระดับงานได้
            </p>
          </div>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            ประเภทปัญหา
            <select value={issueType} onChange={(event) => setIssueType(event.target.value as IssueType)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              {issueTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            จำนวน
            <input type="number" min="0" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            ถุงที่เกี่ยวข้อง (ไม่บังคับ)
            <select
              value={bagId}
              onChange={(event) => {
                setBagId(event.target.value)
                setCountLineId('')
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            >
              <option value="">ระดับงานซัก / ไม่ผูกกับถุง</option>
              {bags.map((bag) => <option key={bag.id} value={String(bag.id)}>{bag.bagNo || `Bag ${bag.id}`}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            รายการนับที่เกี่ยวข้อง (ไม่บังคับ)
            <select value={countLineId} onChange={(event) => handleCountLineChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <option value="">ไม่ผูกกับรายการนับ</option>
              {availableCountLines.map((line) => (
                <option key={line.id} value={String(line.id)}>
                  {[line.bagNo, line.itemTypeName || line.type, line.colorGroup || line.color].filter(Boolean).join(' · ') || `Count Line ${line.id}`}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
            รายละเอียด
            <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
          </label>
          <button
            type="button"
            onClick={() => void submitIssue()}
            disabled={runtime.busy || !description.trim()}
            className="justify-self-end rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50 sm:col-span-2"
          >
            {runtime.busy ? 'กำลังบันทึก...' : editingIssueId ? 'บันทึกการแก้ไข' : 'บันทึกปัญหา'}
          </button>
        </div>
      ) : null}

      {runtime.error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{runtime.error.message}</p> : null}

      {runtime.loading ? (
        <p className="mt-5 text-sm text-slate-500">กำลังโหลดปัญหา...</p>
      ) : runtime.issues.length ? (
        <div className="mt-5 grid gap-3">
          {runtime.issues.map((issue) => {
            const mutable = isMutableIssueStatus(issue.status)

            return (
              <article key={issue.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-black text-slate-950">{issue.issueType}</p>
                    <p className="mt-1 break-words text-sm text-slate-600">{issue.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      จำนวน {issue.quantity ?? 0} · สถานะ {issue.status}
                      {issue.bagId ? ` · Bag #${issue.bagId}` : ' · ระดับงานซัก'}
                      {issue.countLineId ? ` · Count Line #${issue.countLineId}` : ''}
                    </p>
                  </div>
                  {mutable ? (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {runtime.policy.canUpdate ? (
                        <button type="button" onClick={() => openEditForm(issue)} disabled={runtime.busy} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 disabled:opacity-50">
                          แก้ไข / เชื่อมโยง
                        </button>
                      ) : null}
                      {runtime.policy.canResolve ? (
                        <button type="button" onClick={() => void resolveIssue(issue.id)} disabled={runtime.busy} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 disabled:opacity-50">
                          แก้ไขแล้ว
                        </button>
                      ) : null}
                      {runtime.policy.canUpdate ? (
                        <button type="button" onClick={() => void cancelIssue(issue.id)} disabled={runtime.busy} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 disabled:opacity-50">
                          ยกเลิกปัญหา
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed p-5 text-sm text-slate-500">ยังไม่มีปัญหาที่บันทึกไว้</p>
      )}
    </section>
  )
}
