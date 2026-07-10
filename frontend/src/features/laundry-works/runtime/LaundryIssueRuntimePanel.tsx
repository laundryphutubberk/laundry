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

type IssueFormErrors = {
  quantity?: string
  description?: string
  countLineId?: string
}

type LaundryIssueRuntimePanelProps = {
  workId?: string | number
  workStatus?: string
  bags?: IssueBagOption[]
  countLines?: IssueCountLineOption[]
}

const ISSUE_FORM_ID = 'laundry-issue-form'
const ISSUE_QUANTITY_ID = 'laundry-issue-quantity'
const ISSUE_COUNT_LINE_ID = 'laundry-issue-count-line'
const ISSUE_DESCRIPTION_ID = 'laundry-issue-description'

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
  const [formErrors, setFormErrors] = useState<IssueFormErrors>({})

  const availableCountLines = useMemo(
    () => (bagId ? countLines.filter((line) => String(line.bagId || '') === bagId) : countLines),
    [bagId, countLines],
  )

  const backendFieldErrors = runtime.error?.fieldErrors as Record<string, string | string[]> | undefined

  const resetForm = () => {
    setEditingIssueId(null)
    setIssueType('DAMAGED')
    setBagId('')
    setCountLineId('')
    setDescription('')
    setQuantity('1')
    setFormErrors({})
  }

  const closeForm = () => {
    if (runtime.busy) return
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
    setFormErrors({})
    setShowForm(true)
  }

  const handleCountLineChange = (nextCountLineId: string) => {
    setCountLineId(nextCountLineId)
    setFormErrors((current) => ({ ...current, countLineId: undefined }))
    if (!nextCountLineId) return

    const selectedCountLine = countLines.find((line) => String(line.id) === nextCountLineId)
    if (selectedCountLine?.bagId) setBagId(String(selectedCountLine.bagId))
  }

  const validateForm = () => {
    const nextErrors: IssueFormErrors = {}
    const normalizedQuantity = Number(quantity)
    const selectedCountLine = countLines.find((line) => String(line.id) === countLineId)

    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 0) {
      nextErrors.quantity = 'จำนวนต้องเป็นเลขจำนวนเต็มตั้งแต่ 0 ขึ้นไป'
    }

    if (!description.trim()) {
      nextErrors.description = 'กรุณาระบุรายละเอียดปัญหา'
    }

    if (selectedCountLine?.bagId && bagId && String(selectedCountLine.bagId) !== bagId) {
      nextErrors.countLineId = 'รายการนับที่เลือกไม่ได้อยู่ในถุงที่ระบุ'
    }

    setFormErrors(nextErrors)
    return { valid: Object.keys(nextErrors).length === 0, normalizedQuantity, selectedCountLine }
  }

  const submitIssue = async () => {
    if (runtime.busy) return

    const { valid, normalizedQuantity, selectedCountLine } = validateForm()
    if (!valid) return

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
    if (runtime.busy) return
    const resolutionNote = window.prompt('ระบุรายละเอียดการแก้ไขปัญหา')?.trim()
    if (!resolutionNote) return
    await runtime.resolveIssue(issueId, resolutionNote)
  }

  const cancelIssue = async (issueId: string | number) => {
    if (runtime.busy) return
    const confirmed = window.confirm('ยืนยันยกเลิกปัญหานี้หรือไม่ ระบบจะเก็บรายการไว้เป็นประวัติ')
    if (!confirmed) return
    await runtime.updateIssue(issueId, { status: 'CANCELLED' })
  }

  const canRenderForm = editingIssueId ? runtime.policy.canUpdate : runtime.policy.canCreate

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="laundry-issue-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="laundry-issue-title" className="text-xl font-black tracking-tight text-slate-950">ปัญหาในงานซัก</h2>
          <p className="mt-1 text-sm text-slate-500">บันทึก ติดตาม และปิดปัญหาที่พบระหว่างการดำเนินงาน</p>
        </div>
        {runtime.policy.canCreate ? (
          <button
            type="button"
            onClick={showForm ? closeForm : openCreateForm}
            disabled={runtime.busy}
            className="rounded-2xl bg-blue-900 px-4 py-2.5 text-sm font-bold text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            aria-expanded={showForm && canRenderForm}
            aria-controls={ISSUE_FORM_ID}
          >
            {showForm && canRenderForm ? 'ปิดแบบฟอร์ม' : 'เพิ่มปัญหา'}
          </button>
        ) : null}
      </div>

      {showForm && canRenderForm ? (
        <form
          id={ISSUE_FORM_ID}
          className="mt-5 grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            void submitIssue()
          }}
          noValidate
          aria-busy={runtime.busy}
        >
          <div className="sm:col-span-2">
            <p className="text-sm font-black text-blue-950">{editingIssueId ? 'แก้ไขและเชื่อมโยงปัญหา' : 'เพิ่มปัญหาใหม่'}</p>
            <p className="mt-1 text-xs text-blue-700">
              สามารถผูกกับระดับงาน ถุง หรือรายการนับ และล้างการเชื่อมโยงกลับเป็นระดับงานได้
            </p>
          </div>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            ประเภทปัญหา
            <select value={issueType} onChange={(event) => setIssueType(event.target.value as IssueType)} disabled={runtime.busy} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 disabled:cursor-not-allowed disabled:bg-slate-100">
              {issueTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <div className="grid gap-2 text-sm font-bold text-slate-700">
            <label htmlFor={ISSUE_QUANTITY_ID}>จำนวน</label>
            <input
              id={ISSUE_QUANTITY_ID}
              name="quantity"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={quantity}
              onChange={(event) => {
                setQuantity(event.target.value)
                setFormErrors((current) => ({ ...current, quantity: undefined }))
              }}
              disabled={runtime.busy}
              aria-invalid={Boolean(formErrors.quantity || backendFieldErrors?.quantity)}
              aria-describedby={formErrors.quantity || backendFieldErrors?.quantity ? `${ISSUE_QUANTITY_ID}-error` : undefined}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
            {formErrors.quantity || backendFieldErrors?.quantity ? (
              <p id={`${ISSUE_QUANTITY_ID}-error`} className="text-xs font-semibold text-red-700" role="alert">
                {formErrors.quantity || String(backendFieldErrors?.quantity)}
              </p>
            ) : null}
          </div>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            ถุงที่เกี่ยวข้อง (ไม่บังคับ)
            <select
              value={bagId}
              disabled={runtime.busy}
              onChange={(event) => {
                setBagId(event.target.value)
                setCountLineId('')
                setFormErrors((current) => ({ ...current, countLineId: undefined }))
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">ระดับงานซัก / ไม่ผูกกับถุง</option>
              {bags.map((bag) => <option key={bag.id} value={String(bag.id)}>{bag.bagNo || `Bag ${bag.id}`}</option>)}
            </select>
          </label>
          <div className="grid gap-2 text-sm font-bold text-slate-700">
            <label htmlFor={ISSUE_COUNT_LINE_ID}>รายการนับที่เกี่ยวข้อง (ไม่บังคับ)</label>
            <select
              id={ISSUE_COUNT_LINE_ID}
              value={countLineId}
              disabled={runtime.busy}
              onChange={(event) => handleCountLineChange(event.target.value)}
              aria-invalid={Boolean(formErrors.countLineId || backendFieldErrors?.countLineId)}
              aria-describedby={formErrors.countLineId || backendFieldErrors?.countLineId ? `${ISSUE_COUNT_LINE_ID}-error` : undefined}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">ไม่ผูกกับรายการนับ</option>
              {availableCountLines.map((line) => (
                <option key={line.id} value={String(line.id)}>
                  {[line.bagNo, line.itemTypeName || line.type, line.colorGroup || line.color].filter(Boolean).join(' · ') || `Count Line ${line.id}`}
                </option>
              ))}
            </select>
            {formErrors.countLineId || backendFieldErrors?.countLineId ? (
              <p id={`${ISSUE_COUNT_LINE_ID}-error`} className="text-xs font-semibold text-red-700" role="alert">
                {formErrors.countLineId || String(backendFieldErrors?.countLineId)}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
            <label htmlFor={ISSUE_DESCRIPTION_ID}>รายละเอียด <span className="text-red-600" aria-hidden="true">*</span></label>
            <textarea
              id={ISSUE_DESCRIPTION_ID}
              name="description"
              rows={3}
              value={description}
              disabled={runtime.busy}
              required
              maxLength={2000}
              onChange={(event) => {
                setDescription(event.target.value)
                setFormErrors((current) => ({ ...current, description: undefined }))
              }}
              aria-invalid={Boolean(formErrors.description || backendFieldErrors?.description)}
              aria-describedby={formErrors.description || backendFieldErrors?.description ? `${ISSUE_DESCRIPTION_ID}-error` : undefined}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
            {formErrors.description || backendFieldErrors?.description ? (
              <p id={`${ISSUE_DESCRIPTION_ID}-error`} className="text-xs font-semibold text-red-700" role="alert">
                {formErrors.description || String(backendFieldErrors?.description)}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={runtime.busy || !description.trim()}
            className="justify-self-end rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-black text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
          >
            {runtime.busy ? 'กำลังบันทึก...' : editingIssueId ? 'บันทึกการแก้ไข' : 'บันทึกปัญหา'}
          </button>
        </form>
      ) : null}

      {runtime.error ? (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <p className="font-bold">ไม่สามารถดำเนินการกับปัญหาได้</p>
          <p className="mt-1">{runtime.error.message}</p>
          {runtime.error.requestId ? <p className="mt-2 break-all text-xs">รหัสอ้างอิง: {runtime.error.requestId}</p> : null}
        </div>
      ) : null}

      {runtime.loading ? (
        <p className="mt-5 text-sm text-slate-500" role="status">กำลังโหลดปัญหา...</p>
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
                        <button type="button" onClick={() => openEditForm(issue)} disabled={runtime.busy} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
                          แก้ไข / เชื่อมโยง
                        </button>
                      ) : null}
                      {runtime.policy.canResolve ? (
                        <button type="button" onClick={() => void resolveIssue(issue.id)} disabled={runtime.busy} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50">
                          แก้ไขแล้ว
                        </button>
                      ) : null}
                      {runtime.policy.canUpdate ? (
                        <button type="button" onClick={() => void cancelIssue(issue.id)} disabled={runtime.busy} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50">
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
