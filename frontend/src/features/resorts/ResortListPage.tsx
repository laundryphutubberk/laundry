import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, X } from 'lucide-react'

import { getWorkspaceContext } from '../auth/authSession'
import { canManageResorts } from './policies/resort.policy'
import { createResort, listResorts, updateResort, type ResortDTO, type ResortInput } from './resortApi'

const PAGE_SIZE = 10
const fieldClassName = 'mt-2 min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100'

function ResortEditor({ resort, onClose, onSaved }: { resort?: ResortDTO | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(resort?.name || '')
  const [contactName, setContactName] = useState(resort?.contactName || '')
  const [contactPhone, setContactPhone] = useState(resort?.contactPhone || '')
  const [address, setAddress] = useState(resort?.address || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) return
    const input: ResortInput & { name: string } = { name: name.trim(), contactName: contactName.trim(), contactPhone: contactPhone.trim(), address: address.trim() }
    setSaving(true)
    setError(null)
    try {
      if (resort) await updateResort(resort.id, input)
      else await createResort(input)
      await onSaved()
      onClose()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save Resort')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="resort-editor-title">
      <div className="flex min-h-full items-center justify-center py-[env(safe-area-inset-top)]">
        <form onSubmit={submit} className="w-full max-w-2xl rounded-[28px] bg-white p-5 shadow-2xl sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-sm font-black uppercase tracking-wide text-blue-700">Resort master data</p><h2 id="resort-editor-title" className="mt-1 text-2xl font-black text-slate-950">{resort ? 'แก้ไขรีสอร์ต' : 'เพิ่มรีสอร์ตใหม่'}</h2></div>
            <button type="button" onClick={onClose} disabled={saving} aria-label="ปิดแบบฟอร์ม" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-slate-100"><X aria-hidden="true" /></button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="text-sm font-bold text-slate-700">ชื่อรีสอร์ต</span><input value={name} onChange={(event) => setName(event.target.value)} disabled={saving} maxLength={200} required autoFocus className={fieldClassName} /></label>
            <label><span className="text-sm font-bold text-slate-700">ผู้ติดต่อ</span><input value={contactName} onChange={(event) => setContactName(event.target.value)} disabled={saving} maxLength={200} className={fieldClassName} /></label>
            <label><span className="text-sm font-bold text-slate-700">เบอร์โทร</span><input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} disabled={saving} maxLength={50} className={fieldClassName} /></label>
            <label className="sm:col-span-2"><span className="text-sm font-bold text-slate-700">ที่อยู่</span><textarea value={address} onChange={(event) => setAddress(event.target.value)} disabled={saving} maxLength={1000} rows={4} className={`${fieldClassName} py-3`} /></label>
          </div>
          {error ? <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-slate-200 px-5 py-2 font-bold text-slate-700">ยกเลิก</button><button type="submit" disabled={saving || !name.trim()} className="min-h-11 rounded-xl bg-blue-700 px-5 py-2 font-black text-white disabled:opacity-50">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button></div>
        </form>
      </div>
    </div>
  )
}

export function ResortListPage() {
  const session = useMemo(() => getWorkspaceContext(), [])
  const canManage = canManageResorts(session.actorRole, session.workspaceType)
  const [resorts, setResorts] = useState<ResortDTO[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [skip, setSkip] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<'create' | ResortDTO | null>(null)
  const [statusTarget, setStatusTarget] = useState<ResortDTO | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const loadResorts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listResorts({ search, active: activeFilter === 'all' ? undefined : activeFilter === 'active', skip, take: PAGE_SIZE })
      setResorts(result.items)
      setTotal(result.pagination?.total || 0)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load resorts')
    } finally {
      setLoading(false)
    }
  }, [activeFilter, search, skip])

  useEffect(() => { void loadResorts() }, [loadResorts])

  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSkip(0); setSearch(searchInput.trim()) }
  const changeActiveFilter = (value: 'all' | 'active' | 'inactive') => { setSkip(0); setActiveFilter(value) }

  const changeStatus = async (resort: ResortDTO) => {
    if (resort.active) { setStatusTarget(resort); return }
    setUpdatingStatus(true); setError(null)
    try { await updateResort(resort.id, { active: true }); await loadResorts() }
    catch (statusError) { setError(statusError instanceof Error ? statusError.message : 'Unable to reactivate Resort') }
    finally { setUpdatingStatus(false) }
  }

  const confirmDeactivation = async () => {
    if (!statusTarget) return
    setUpdatingStatus(true); setError(null)
    try { await updateResort(statusTarget.id, { active: false }); setStatusTarget(null); await loadResorts() }
    catch (statusError) { setError(statusError instanceof Error ? statusError.message : 'Unable to deactivate Resort'); setStatusTarget(null) }
    finally { setUpdatingStatus(false) }
  }

  const pageStart = total ? skip + 1 : 0
  const pageEnd = Math.min(skip + resorts.length, total)
  const noResults = !loading && !error && resorts.length === 0

  return (
    <div className="min-h-screen bg-slate-100/70">
      <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 md:px-6 lg:px-8 xl:px-10">
        <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-black uppercase tracking-wide text-blue-700">Laundry Workspace</p><h1 className="mt-2 text-3xl font-black text-slate-950">ลูกค้า / รีสอร์ต</h1><p className="mt-1 text-sm font-medium text-slate-500">จัดการข้อมูลรีสอร์ตที่ใช้กับ Laundry Work</p></div>{canManage ? <button type="button" onClick={() => setEditor('create')} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-2.5 text-sm font-black text-white"><Plus size={19} aria-hidden="true" />เพิ่มรีสอร์ต</button> : null}</div></section>

        <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-sm"><form onSubmit={submitSearch} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-end"><label><span className="text-sm font-bold text-slate-700">ค้นหา</span><div className="relative mt-2"><Search size={18} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} maxLength={100} placeholder="ชื่อ ผู้ติดต่อ เบอร์โทร หรือที่อยู่" className={`${fieldClassName} mt-0 pl-11`} /></div></label><label><span className="text-sm font-bold text-slate-700">สถานะ</span><select value={activeFilter} onChange={(event) => changeActiveFilter(event.target.value as 'all' | 'active' | 'inactive')} className={fieldClassName}><option value="all">ทั้งหมด</option><option value="active">ใช้งาน</option><option value="inactive">ไม่ใช้งาน</option></select></label><button type="submit" className="min-h-11 rounded-xl bg-slate-950 px-5 py-2 font-black text-white">ค้นหา</button></form></section>

        {error ? <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-slate-50 px-5 py-4"><p className="text-lg font-black text-slate-950">รายการรีสอร์ต</p><p className="text-sm font-semibold text-slate-500">{pageStart}-{pageEnd} จาก {total}</p></div>
          {loading ? <div className="p-6 text-sm font-semibold text-slate-500" aria-busy="true">กำลังโหลดรีสอร์ต...</div> : null}
          {noResults ? <div className="p-6"><p className="font-bold text-slate-900">{search || activeFilter !== 'all' ? 'ไม่พบรีสอร์ตที่ตรงกับการค้นหา' : 'ยังไม่มีรีสอร์ต'}</p><p className="mt-1 text-sm text-slate-500">ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ</p></div> : null}
          {!loading && resorts.length ? <div className="divide-y divide-slate-100">{resorts.map((resort) => <article key={resort.id} className="grid min-w-0 gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1.3fr)_220px_180px_110px_210px] lg:items-center"><div className="min-w-0"><p className="break-words text-base font-black text-slate-950">{resort.name}</p><p className="mt-1 break-words text-sm font-medium text-slate-500">{resort.address || 'ไม่มีที่อยู่'}</p></div><p className="break-words text-sm font-semibold text-slate-600">{resort.contactName || '-'}</p><p className="break-all text-sm font-semibold text-slate-600">{resort.contactPhone || '-'}</p><span className={`w-fit rounded-xl px-3 py-1 text-xs font-black ${resort.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{resort.active ? 'ACTIVE' : 'INACTIVE'}</span>{canManage ? <div className="flex flex-wrap gap-2 lg:justify-end"><button type="button" onClick={() => setEditor(resort)} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700"><Pencil size={16} aria-hidden="true" />แก้ไข</button><button type="button" disabled={updatingStatus} onClick={() => void changeStatus(resort)} className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-bold ${resort.active ? 'border-red-200 text-red-700' : 'border-emerald-200 text-emerald-700'}`}>{resort.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}</button></div> : null}</article>)}</div> : null}
          <div className="flex flex-col gap-3 border-t bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-slate-500">หน้า {Math.floor(skip / PAGE_SIZE) + 1}</p><div className="grid grid-cols-2 gap-2 sm:flex"><button type="button" disabled={loading || skip === 0} onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))} className="min-h-11 rounded-xl border bg-white px-4 py-2 font-bold disabled:opacity-40">ก่อนหน้า</button><button type="button" disabled={loading || skip + PAGE_SIZE >= total} onClick={() => setSkip(skip + PAGE_SIZE)} className="min-h-11 rounded-xl border bg-white px-4 py-2 font-bold disabled:opacity-40">ถัดไป</button></div></div>
        </section>
      </main>
      {editor ? <ResortEditor resort={editor === 'create' ? null : editor} onClose={() => setEditor(null)} onSaved={loadResorts} /> : null}
      {statusTarget ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="deactivate-resort-title"><section className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"><h2 id="deactivate-resort-title" className="text-xl font-black">ปิดใช้งาน {statusTarget.name}?</h2><p className="mt-3 text-sm leading-6 text-slate-600">รีสอร์ตจะไม่ปรากฏในตัวเลือกสร้าง Laundry Work ใหม่ แต่ข้อมูลและประวัติงานเดิมจะยังคงอยู่ ระบบจะปฏิเสธหากยังมีงานที่กำลังดำเนินการ</p><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={updatingStatus} onClick={() => setStatusTarget(null)} className="min-h-11 rounded-xl border px-5 py-2 font-bold">ยกเลิก</button><button type="button" disabled={updatingStatus} onClick={() => void confirmDeactivation()} className="min-h-11 rounded-xl bg-red-700 px-5 py-2 font-black text-white disabled:opacity-50">{updatingStatus ? 'กำลังดำเนินการ...' : 'ยืนยันปิดใช้งาน'}</button></div></section></div> : null}
    </div>
  )
}
