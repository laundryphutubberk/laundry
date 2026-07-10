import { useMemo, useState } from 'react'

import type { LaundryIssueDTO } from '../api/laundryIssueApi'
import type { LaundryIssueCreateForm, LaundryIssueRuntime, LaundryIssueUpdateForm } from '../hooks/useLaundryIssueRuntime'

export type LaundryIssueBagOption = {
  id: string | number
  bagNo?: string
}

export type LaundryIssueCountLineOption = {
  id: string | number
  type?: string
  color?: string
  quantity?: number | string
}

export type LaundryIssueFlowPanelProps = LaundryIssueRuntime & {
  bags?: LaundryIssueBagOption[]
  countLines?: LaundryIssueCountLineOption[]
}

const issueTypeOptions = [
  ['DAMAGED', 'ชำรุด'],
  ['MISSING', 'สูญหาย'],
  ['COUNT_MISMATCH', 'จำนวนนับไม่ตรง'],
  ['RETURN_MISMATCH', 'จำนวนส่งคืนไม่ตรง'],
  ['OTHER', 'อื่น ๆ'],
] as const

const statusLabels: Record<string, string> = {
  OPEN: 'เปิดอยู่',
  REVIEWING: 'กำลังตรวจสอบ',
  RESOLVED: 'แก้ไขแล้ว',
  CANCELLED: 'ยกเลิก',
}

const emptyCreateForm = (): LaundryIssueCreateForm => ({
  issueType: 'DAMAGED',
  quantity: 0,
  description: '',
})

export function LaundryIssueFlowPanel({
  issues,
  loading,
  error,
  requestId,
  state,
  policy,
  actions,
  bags = [],
  countLines = [],
}: LaundryIssueFlowPanelProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<LaundryIssueCreateForm>(emptyCreateForm)
  const [editingIssue, setEditingIssue] = useState<LaundryIssueDTO | null>(null)
  const [editForm, setEditForm] = useState<LaundryIssueUpdateForm>({})
  const [resolvingIssue, setResolvingIssue] = useState<LaundryIssueDTO | null>(null)
  const [resolutionNote, setResolutionNote] = useState('')

  const openCount = useMemo(
    () => issues.filter((issue) => !['RESOLVED', 'CANCELLED'].includes(issue.status)).length,
    [issues],
  )

  const submitCreate = async () => {
    if (!createForm.description.trim()) return
    const created = await actions.createIssue({
      ...createForm,
      description: createForm.description.trim(),
      quantity: Number(createForm.quantity || 0),
    })
    if (!created) return
    setCreateForm(emptyCreateForm())
    setShowCreate(false)
  }

  const openEdit = (issue: LaundryIssueDTO) => {
    setEditingIssue(issue)
    setEditForm({
      bagId: issue.bagId ?? null,
      countLineId: issue.countLineId ?? null,
      issueType: issue.issueType as LaundryIssueUpdateForm['issueType'],
      quantity: issue.quantity || 0,
      description: issue.description || '',
      status: issue.status === 'REVIEWING' || issue.status === 'CANCELLED' ? issue.status : 'OPEN',
    })
  }

  const submitEdit = async () => {
    if (!editingIssue?.id || !editForm.description?.trim()) return
    const updated = await actions.updateIssue(editingIssue.id, {
      ...editForm,
      description: editForm.description.trim(),
      quantity: Number(editForm.quantity || 0),
    })
    if (!updated) return
    setEditingIssue(null)
    setEditForm({})
  }

  const submitResolve = async () => {
    if (!resolvingIssue?.id || !resolutionNote.trim()) return
    const resolved = await actions.resolveIssue(resolvingIssue.id, resolutionNote.trim())
    if (!resolved) return
    setResolvingIssue(null)
    setResolutionNote('')
  }

  if (loading) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" aria-busy="true">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950">ปัญหาระหว่างงานซัก</h2>
          <p className="mt-1 text-sm text-slate-500">เปิดอยู่ {openCount} รายการ จากทั้งหมด {issues.length} รายการ</p>
        </div>
        {policy.canCreate ? (
          <button
            type="button"
            onClick={() => setShowCreate((value) => !value)}
            disabled={state.creating}
            className="rounded-2xl bg-blue-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state.creating ? 'กำลังบันทึก...' : showCreate ? 'ปิดแบบฟอร์ม' : 'เพิ่มปัญหา'}
          </button>
        ) : null}
      </div>

      {policy.reason ? <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{policy.reason}</p> : null}
      {error ? (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{error}</p>
          {requestId ? <p className="mt-1 text-xs text-red-600">requestId: {requestId}</p> : null}
        </div>
      ) : null}

      {showCreate ? (
        <div className="mt-5 grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 md:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">
            ประเภทปัญหา
            <select
              value={createForm.issueType}
              onChange={(event) => setCreateForm((current) => ({ ...current, issueType: event.target.value as LaundryIssueCreateForm['issueType'] }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            >
              {issueTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">
            จำนวน
            <input
              type="number"
              min="0"
              value={createForm.quantity}
              onChange={(event) => setCreateForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            />
          </label>
          <label className="text-sm font-bold text-slate-700">
            ผูกกับถุง
            <select
              value={createForm.bagId || ''}
              onChange={(event) => setCreateForm((current) => ({ ...current, bagId: event.target.value || undefined }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            >
              <option value="">ไม่ระบุ</option>
              {bags.map((bag) => <option key={bag.id} value={bag.id}>{bag.bagNo || `Bag ${bag.id}`}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">
            ผูกกับรายการนับ
            <select
              value={createForm.countLineId || ''}
              onChange={(event) => setCreateForm((current) => ({ ...current, countLineId: event.target.value || undefined }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            >
              <option value="">ไม่ระบุ</option>
              {countLines.map((line) => <option key={line.id} value={line.id}>{line.type || `Line ${line.id}`} · {line.color || '-'} · {line.quantity || 0}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700 md:col-span-2">
            รายละเอียด
            <textarea
              rows={3}
              value={createForm.description}
              onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button type="button" onClick={submitCreate} disabled={state.creating || !createForm.description.trim()} className="rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50">บันทึกปัญหา</button>
          </div>
        </div>
      ) : null}

      {issues.length ? (
        <div className="mt-5 grid gap-3">
          {issues.map((issue) => (
            <article key={issue.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black text-slate-950">{issue.issueType}</p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">{statusLabels[issue.status] || issue.status}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{issue.description || '-'}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>จำนวน: {issue.quantity || 0}</span>
                    {issue.bagId ? <span>Bag ID: {issue.bagId}</span> : null}
                    {issue.countLineId ? <span>Count Line ID: {issue.countLineId}</span> : null}
                    {issue.reportedBy ? <span>ผู้รายงาน: {issue.reportedBy}</span> : null}
                  </div>
                </div>
                {!['RESOLVED', 'CANCELLED'].includes(issue.status) ? (
                  <div className="flex gap-2">
                    {policy.canUpdate ? <button type="button" onClick={() => openEdit(issue)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold">แก้ไข</button> : null}
                    {policy.canResolve ? <button type="button" onClick={() => setResolvingIssue(issue)} className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white">แก้ไขแล้ว</button> : null}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : <p className="mt-5 rounded-2xl border border-dashed p-5 text-sm text-slate-500">ยังไม่มีปัญหาที่บันทึกไว้</p>}

      {editingIssue ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-black">แก้ไขปัญหา</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold">สถานะ
                <select value={editForm.status || 'OPEN'} onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value as LaundryIssueUpdateForm['status'] }))} className="mt-2 w-full rounded-xl border px-3 py-2.5">
                  <option value="OPEN">เปิดอยู่</option><option value="REVIEWING">กำลังตรวจสอบ</option><option value="CANCELLED">ยกเลิก</option>
                </select>
              </label>
              <label className="text-sm font-bold">จำนวน
                <input type="number" min="0" value={editForm.quantity || 0} onChange={(event) => setEditForm((current) => ({ ...current, quantity: Number(event.target.value) }))} className="mt-2 w-full rounded-xl border px-3 py-2.5" />
              </label>
              <label className="text-sm font-bold md:col-span-2">รายละเอียด
                <textarea rows={4} value={editForm.description || ''} onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))} className="mt-2 w-full rounded-xl border px-3 py-2.5" />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingIssue(null)} className="rounded-xl border px-4 py-2">ยกเลิก</button>
              <button type="button" onClick={submitEdit} disabled={state.updatingIssueId === editingIssue.id || !editForm.description?.trim()} className="rounded-xl bg-blue-900 px-4 py-2 font-bold text-white disabled:opacity-50">บันทึก</button>
            </div>
          </div>
        </div>
      ) : null}

      {resolvingIssue ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-black">ยืนยันการแก้ไขปัญหา</h3>
            <textarea rows={4} value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} placeholder="ระบุวิธีแก้ไขหรือผลการตรวจสอบ" className="mt-4 w-full rounded-xl border px-3 py-2.5" />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setResolvingIssue(null)} className="rounded-xl border px-4 py-2">ยกเลิก</button>
              <button type="button" onClick={submitResolve} disabled={state.resolvingIssueId === resolvingIssue.id || !resolutionNote.trim()} className="rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white disabled:opacity-50">ยืนยันแก้ไขแล้ว</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
