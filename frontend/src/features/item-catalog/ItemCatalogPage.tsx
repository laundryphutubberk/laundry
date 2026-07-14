import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, X } from 'lucide-react'

import { getWorkspaceContext } from '../auth/authSession'
import { canManageItemCatalog } from './itemCatalog.policy'
import { createLaundryItemType, listLaundryItemTypes, updateLaundryItemType, type LaundryItemTypeDTO, type LaundryItemTypeInput } from './itemCatalogApi'

const PAGE_SIZE = 10
const fieldClassName = 'mt-2 min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-base font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100'

function ItemTypeEditor({ item, onClose, onSaved }: { item?: LaundryItemTypeDTO | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(item?.name || '')
  const [category, setCategory] = useState(item?.category || '')
  const [weight, setWeight] = useState(item?.weightPerPieceKg == null ? '' : String(item.weightPerPieceKg))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsedWeight = weight.trim() ? Number(weight) : null
    if (!name.trim() || (parsedWeight !== null && (!Number.isFinite(parsedWeight) || parsedWeight <= 0))) return
    const input: LaundryItemTypeInput & { name: string } = { name: name.trim(), category: category.trim() || null, weightPerPieceKg: parsedWeight }
    setSaving(true); setError(null)
    try {
      if (item) await updateLaundryItemType(item.id, input)
      else await createLaundryItemType(input)
      await onSaved(); onClose()
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save item type') }
    finally { setSaving(false) }
  }

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="item-editor-title">
    <div className="flex min-h-full items-center justify-center py-[env(safe-area-inset-top)]">
      <form onSubmit={submit} className="w-full max-w-2xl rounded-[28px] bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-wide text-blue-700">Laundry Item Master</p><h2 id="item-editor-title" className="mt-1 text-2xl font-black">{item ? 'แก้ไขรายการผ้า' : 'เพิ่มรายการผ้า'}</h2></div><button type="button" onClick={onClose} disabled={saving} aria-label="ปิดแบบฟอร์ม" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-slate-100"><X /></button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="text-sm font-bold text-slate-700">ชื่อรายการผ้า</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={200} required autoFocus disabled={saving} className={fieldClassName} /></label>
          <label><span className="text-sm font-bold text-slate-700">หมวดหมู่</span><input value={category} onChange={(event) => setCategory(event.target.value)} maxLength={200} disabled={saving} className={fieldClassName} /></label>
          <label><span className="text-sm font-bold text-slate-700">น้ำหนักต่อชิ้น (กก.)</span><input type="number" min="0.001" max="999.999" step="0.001" value={weight} onChange={(event) => setWeight(event.target.value)} disabled={saving} className={fieldClassName} /></label>
        </div>
        {error ? <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border px-5 py-2 font-bold">ยกเลิก</button><button type="submit" disabled={saving || !name.trim()} className="min-h-11 rounded-xl bg-blue-700 px-5 py-2 font-black text-white disabled:opacity-50">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button></div>
      </form>
    </div>
  </div>
}

export function ItemCatalogPage() {
  const session = useMemo(() => getWorkspaceContext(), [])
  const canManage = canManageItemCatalog(session.actorRole, session.workspaceType)
  const [items, setItems] = useState<LaundryItemTypeDTO[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [skip, setSkip] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<'create' | LaundryItemTypeDTO | null>(null)
  const [statusTarget, setStatusTarget] = useState<LaundryItemTypeDTO | null>(null)
  const [updating, setUpdating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const result = await listLaundryItemTypes({ search, active: activeFilter === 'all' ? 'all' : activeFilter === 'active', skip, take: PAGE_SIZE })
      setItems(result.items); setTotal(result.pagination?.total || 0)
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Unable to load item catalog') }
    finally { setLoading(false) }
  }, [activeFilter, search, skip])
  useEffect(() => { void load() }, [load])

  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSkip(0); setSearch(searchInput.trim()) }
  const changeFilter = (value: 'all' | 'active' | 'inactive') => { setSkip(0); setActiveFilter(value) }
  const changeStatus = async (item: LaundryItemTypeDTO) => {
    if (item.active) { setStatusTarget(item); return }
    setUpdating(true); setError(null)
    try { await updateLaundryItemType(item.id, { active: true }); await load() }
    catch (statusError) { setError(statusError instanceof Error ? statusError.message : 'Unable to reactivate item') }
    finally { setUpdating(false) }
  }
  const confirmDeactivation = async () => {
    if (!statusTarget) return
    setUpdating(true); setError(null)
    try { await updateLaundryItemType(statusTarget.id, { active: false }); setStatusTarget(null); await load() }
    catch (statusError) { setError(statusError instanceof Error ? statusError.message : 'Unable to deactivate item'); setStatusTarget(null) }
    finally { setUpdating(false) }
  }

  const noResults = !loading && !error && items.length === 0
  return <div className="min-h-screen bg-slate-100/70"><main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 md:px-6 lg:px-8 xl:px-10">
    <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-black uppercase tracking-wide text-blue-700">Laundry Workspace</p><h1 className="mt-2 text-3xl font-black">รายการผ้า</h1><p className="mt-1 text-sm font-medium text-slate-500">จัดการข้อมูลประเภทผ้าที่ใช้ในการนับงานซัก</p></div>{canManage ? <button type="button" onClick={() => setEditor('create')} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-2.5 text-sm font-black text-white"><Plus size={19} />เพิ่มรายการผ้า</button> : null}</div></section>
    <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-sm"><form onSubmit={submitSearch} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-end" role="search"><label><span className="text-sm font-bold text-slate-700">ค้นหา</span><div className="relative mt-2"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} maxLength={100} placeholder="ชื่อหรือหมวดหมู่" className={`${fieldClassName} mt-0 pl-11`} /></div></label><label><span className="text-sm font-bold text-slate-700">สถานะ</span><select value={activeFilter} onChange={(event) => changeFilter(event.target.value as 'all' | 'active' | 'inactive')} className={fieldClassName}><option value="all">ทั้งหมด</option><option value="active">ใช้งาน</option><option value="inactive">ไม่ใช้งาน</option></select></label><button type="submit" className="min-h-11 rounded-xl bg-slate-950 px-5 py-2 font-black text-white">ค้นหา</button></form></section>
    {error ? <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
    <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2 border-b bg-slate-50 px-5 py-4"><p className="text-lg font-black">รายการประเภทผ้า</p><p className="text-sm font-semibold text-slate-500">{total ? skip + 1 : 0}-{Math.min(skip + items.length, total)} จาก {total}</p></div>
      {loading ? <div className="p-6 text-sm font-semibold text-slate-500" aria-busy="true">กำลังโหลดรายการผ้า...</div> : null}
      {noResults ? <div className="p-6"><p className="font-bold">{search || activeFilter !== 'all' ? 'ไม่พบรายการที่ตรงกับตัวกรอง' : 'ยังไม่มีรายการผ้า'}</p><p className="mt-1 text-sm text-slate-500">ลองเปลี่ยนคำค้นหาหรือสถานะ</p></div> : null}
      {!loading && items.length ? <div className="divide-y divide-slate-100">{items.map((item) => <article key={item.id} className="grid min-w-0 gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1.3fr)_220px_180px_110px_210px] lg:items-center"><div className="min-w-0"><p className="break-words text-base font-black">{item.name}</p><p className="mt-1 text-sm font-medium text-slate-500">ID {item.id}</p></div><p className="break-words text-sm font-semibold text-slate-600">{item.category || 'ไม่มีหมวดหมู่'}</p><p className="text-sm font-semibold text-slate-600">{item.weightPerPieceKg == null ? '-' : `${item.weightPerPieceKg} กก./ชิ้น`}</p><span className={`w-fit rounded-xl px-3 py-1 text-xs font-black ${item.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{item.active ? 'ACTIVE' : 'INACTIVE'}</span>{canManage ? <div className="flex flex-wrap gap-2 lg:justify-end"><button type="button" onClick={() => setEditor(item)} className="flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><Pencil size={16} />แก้ไข</button><button type="button" disabled={updating} onClick={() => void changeStatus(item)} className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-bold ${item.active ? 'border-red-200 text-red-700' : 'border-emerald-200 text-emerald-700'}`}>{item.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}</button></div> : null}</article>)}</div> : null}
      <div className="flex flex-col gap-3 border-t bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-slate-500">หน้า {Math.floor(skip / PAGE_SIZE) + 1}</p><div className="grid grid-cols-2 gap-2 sm:flex"><button type="button" disabled={loading || skip === 0} onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))} className="min-h-11 rounded-xl border bg-white px-4 py-2 font-bold disabled:opacity-40">ก่อนหน้า</button><button type="button" disabled={loading || skip + PAGE_SIZE >= total} onClick={() => setSkip(skip + PAGE_SIZE)} className="min-h-11 rounded-xl border bg-white px-4 py-2 font-bold disabled:opacity-40">ถัดไป</button></div></div>
    </section>
  </main>
  {editor ? <ItemTypeEditor item={editor === 'create' ? null : editor} onClose={() => setEditor(null)} onSaved={load} /> : null}
  {statusTarget ? <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="deactivate-item-title"><div className="flex min-h-full items-center justify-center"><section className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"><h2 id="deactivate-item-title" className="text-xl font-black">ปิดใช้งาน {statusTarget.name}?</h2><p className="mt-3 text-sm leading-6 text-slate-600">รายการนี้จะไม่ปรากฏสำหรับการนับงานใหม่ แต่ประวัติงานเดิมยังคงอ่านได้</p><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={updating} onClick={() => setStatusTarget(null)} className="min-h-11 rounded-xl border px-5 py-2 font-bold">ยกเลิก</button><button type="button" disabled={updating} onClick={() => void confirmDeactivation()} className="min-h-11 rounded-xl bg-red-700 px-5 py-2 font-black text-white disabled:opacity-50">ยืนยันปิดใช้งาน</button></div></section></div></div> : null}
  </div>
}
