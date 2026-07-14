import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { AlertTriangle, ExternalLink, RotateCcw, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { getWorkspaceContext } from '../auth/authSession'
import { laundryIssueApi, type LaundryIssueDTO } from '../laundry-works/api/laundryIssueApi'

const PAGE_SIZE = 10
const issueTypes = ['DAMAGED', 'MISSING', 'COUNT_MISMATCH', 'RETURN_MISMATCH', 'OTHER'] as const
const statuses = ['OPEN', 'REVIEWING', 'RESOLVED', 'CANCELLED'] as const
const fieldClass = 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-base font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

const labels: Record<string, string> = {
  DAMAGED: 'ชำรุด', MISSING: 'สูญหาย', COUNT_MISMATCH: 'จำนวนไม่ตรง', RETURN_MISMATCH: 'ส่งคืนไม่ตรง', OTHER: 'อื่น ๆ',
  OPEN: 'เปิด', REVIEWING: 'กำลังตรวจสอบ', RESOLVED: 'แก้ไขแล้ว', CANCELLED: 'ยกเลิก',
}

function requestMeta(action: string) {
  const context = getWorkspaceContext()
  return { ...context, feature: 'laundry-work' as const, action, requestId: crypto.randomUUID(), createdAt: new Date().toISOString() }
}

export function IssueCenterPage() {
  const [issues, setIssues] = useState<LaundryIssueDTO[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [issueType, setIssueType] = useState('')
  const [activity, setActivity] = useState('true')
  const [skip, setSkip] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [target, setTarget] = useState<{ issue: LaundryIssueDTO; action: 'resolve' | 'reopen' } | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    const result = await laundryIssueApi.listGlobal({ search, status, issueType, active: activity === 'all' ? undefined : activity as 'true' | 'false', skip, take: PAGE_SIZE, meta: requestMeta('issue-center-list') })
    if (result.ok) { setIssues(result.data); setTotal(result.meta.pagination?.total || 0) }
    else setError(result.error.message)
    setLoading(false)
  }, [activity, issueType, search, skip, status])
  useEffect(() => { void load() }, [load])

  const submitSearch = (event: FormEvent) => { event.preventDefault(); setSkip(0); setSearch(searchInput.trim()) }
  const mutate = async () => {
    if (!target) return
    if (target.action === 'resolve' && !note.trim()) return
    setSaving(true); setError(null)
    const result = target.action === 'resolve'
      ? await laundryIssueApi.resolve({ issueId: target.issue.id, resolutionNote: note.trim(), meta: requestMeta('issue-center-resolve') })
      : await laundryIssueApi.reopen({ issueId: target.issue.id, meta: requestMeta('issue-center-reopen') })
    setSaving(false)
    if (!result.ok) { setError(result.error.message); return }
    setTarget(null); setNote(''); await load()
  }

  return <div className="space-y-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
    <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-black uppercase tracking-wide text-blue-700">Operational Issue Center</p>
      <h1 className="mt-2 text-3xl font-black">ศูนย์จัดการปัญหา</h1>
      <p className="mt-1 text-sm font-medium text-slate-500">ติดตามปัญหาจากงานซักทั้งหมด โดยการสร้างและแก้ไขรายละเอียดหลักยังอยู่ในหน้างานซัก</p>
    </section>

    <section className="rounded-[28px] bg-white p-4 shadow-sm sm:p-5" aria-label="ตัวกรองปัญหา">
      <form onSubmit={submitSearch} className="grid gap-3 lg:grid-cols-[minmax(15rem,2fr)_repeat(3,minmax(9rem,1fr))_auto]">
        <label className="relative"><span className="sr-only">ค้นหา</span><Search className="absolute left-4 top-3.5 text-slate-400" size={19}/><input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="เลขงาน รีสอร์ต หรือรายละเอียด" className={`${fieldClass} w-full pl-11`}/></label>
        <select aria-label="สถานะ" value={status} onChange={e => { setStatus(e.target.value); setSkip(0) }} className={fieldClass}><option value="">ทุกสถานะ</option>{statuses.map(value => <option key={value} value={value}>{labels[value]}</option>)}</select>
        <select aria-label="ประเภท" value={issueType} onChange={e => { setIssueType(e.target.value); setSkip(0) }} className={fieldClass}><option value="">ทุกประเภท</option>{issueTypes.map(value => <option key={value} value={value}>{labels[value]}</option>)}</select>
        <select aria-label="กลุ่มสถานะ" value={activity} onChange={e => { setActivity(e.target.value); setSkip(0) }} className={fieldClass}><option value="all">ทั้งหมด</option><option value="true">กำลังดำเนินการ</option><option value="false">เสร็จสิ้น/ยกเลิก</option></select>
        <button className="min-h-11 rounded-2xl bg-blue-700 px-5 font-black text-white">ค้นหา</button>
      </form>
    </section>

    {error ? <div role="alert" className="rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</div> : null}
    {loading ? <div aria-busy="true" className="rounded-2xl bg-white p-6 font-semibold text-slate-500">กำลังโหลดปัญหา...</div> : null}
    {!loading && !issues.length ? <div className="rounded-2xl bg-white p-6"><p className="font-black">ไม่พบปัญหา</p><p className="mt-1 text-sm text-slate-500">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p></div> : null}

    <section className="grid gap-4 xl:grid-cols-2" aria-live="polite">
      {issues.map(issue => {
        const terminalWork = ['CLOSED', 'CANCELLED'].includes(issue.work?.currentStatus || '')
        return <article key={issue.id} className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><AlertTriangle size={21}/></span><div><h2 className="font-black">{labels[issue.issueType] || issue.issueType}</h2><p className="text-sm font-bold text-slate-500">{labels[issue.status] || issue.status}</p></div></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">#{issue.id}</span></div>
          <p className="mt-4 whitespace-pre-line text-sm font-medium text-slate-700">{issue.description}</p>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><div><dt className="font-bold text-slate-400">งานซัก</dt><dd className="font-black">{issue.work?.workNo || `#${issue.workId}`}</dd></div><div><dt className="font-bold text-slate-400">ลูกค้า/รีสอร์ต</dt><dd className="font-black">{issue.resort?.name || `#${issue.resortId}`}</dd></div>{issue.reportedBy?.displayName ? <div><dt className="font-bold text-slate-400">ผู้รายงาน</dt><dd className="font-black">{issue.reportedBy.displayName}</dd></div> : null}{issue.claim ? <div><dt className="font-bold text-slate-400">เคลม</dt><dd className="font-black">{issue.claim.status}</dd></div> : null}</dl>
          <div className="mt-5 flex flex-wrap gap-2"><Link to={`/workspace/laundry/works/${issue.work?.id || issue.workId}`} className="flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 font-black text-blue-700"><ExternalLink size={18}/>เปิดรายละเอียดงาน</Link>{!terminalWork && ['OPEN','REVIEWING'].includes(issue.status) ? <button onClick={() => setTarget({ issue, action:'resolve' })} className="min-h-11 rounded-2xl bg-emerald-600 px-4 py-2 font-black text-white">แก้ไขแล้ว</button> : null}{!terminalWork && issue.status === 'RESOLVED' ? <button onClick={() => setTarget({ issue, action:'reopen' })} className="flex min-h-11 items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 font-black text-white"><RotateCcw size={18}/>เปิดอีกครั้ง</button> : null}</div>
        </article>
      })}
    </section>

    {total > PAGE_SIZE ? <nav aria-label="หน้ารายการปัญหา" className="flex items-center justify-between rounded-2xl bg-white p-4"><button disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip-PAGE_SIZE))} className="min-h-11 rounded-xl border px-4 font-bold disabled:opacity-40">ก่อนหน้า</button><span className="text-sm font-bold">{skip+1}–{Math.min(skip+PAGE_SIZE,total)} จาก {total}</span><button disabled={skip+PAGE_SIZE >= total} onClick={() => setSkip(skip+PAGE_SIZE)} className="min-h-11 rounded-xl border px-4 font-bold disabled:opacity-40">ถัดไป</button></nav> : null}

    {target ? <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-3 sm:items-center" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="issue-action-title" className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl"><div className="flex justify-between gap-3"><h2 id="issue-action-title" className="text-xl font-black">{target.action === 'resolve' ? 'ยืนยันการแก้ไขปัญหา' : 'เปิดปัญหาอีกครั้ง'}</h2><button aria-label="ปิด" onClick={() => setTarget(null)} className="flex h-11 w-11 items-center justify-center rounded-xl"><X/></button></div>{target.action === 'resolve' ? <label className="mt-4 block"><span className="text-sm font-bold">บันทึกการแก้ไข</span><textarea rows={4} maxLength={2000} value={note} onChange={e => setNote(e.target.value)} className={`${fieldClass} mt-2 w-full`}/></label> : <p className="mt-4 text-sm font-medium text-slate-600">สถานะจะกลับเป็น “เปิด” เพื่อดำเนินการต่อในงานซักเดิม</p>}<div className="mt-5 flex gap-3"><button onClick={() => setTarget(null)} className="min-h-11 flex-1 rounded-2xl border font-black">ยกเลิก</button><button disabled={saving || (target.action === 'resolve' && !note.trim())} onClick={() => void mutate()} className="min-h-11 flex-1 rounded-2xl bg-blue-700 font-black text-white disabled:opacity-50">{saving ? 'กำลังบันทึก...' : 'ยืนยัน'}</button></div></section></div> : null}
  </div>
}
