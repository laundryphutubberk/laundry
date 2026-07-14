import { type FormEvent, useEffect, useState } from 'react'
import type { WorkspaceSettings, WorkspaceSettingsInput } from './workspaceSettingsApi'
const field = 'mt-1 min-h-11 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-base font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100'

export function WorkspaceProfileForm({ settings, editable, saving, onSave }: { settings: WorkspaceSettings; editable: boolean; saving: boolean; onSave: (input: WorkspaceSettingsInput) => Promise<void> }) {
  const [input, setInput] = useState<WorkspaceSettingsInput>({ tenantDisplayName: '', legalName: null, timezone: 'Asia/Bangkok', workspaceDisplayName: null, branchName: '', branchAddress: null, branchTimezone: null })
  useEffect(() => setInput({ tenantDisplayName: settings.tenant.displayName, legalName: settings.tenant.legalName, timezone: settings.tenant.timezone, workspaceDisplayName: settings.workspace.displayName, branchName: settings.branch?.name || '', branchAddress: settings.branch?.address || null, branchTimezone: settings.branch?.timezone || null }), [settings])
  const change = (key: keyof WorkspaceSettingsInput, value: string) => setInput(current => ({ ...current, [key]: value }))
  const submit = (event: FormEvent) => { event.preventDefault(); void onSave({ ...input, legalName: input.legalName || null, workspaceDisplayName: input.workspaceDisplayName || null, branchAddress: input.branchAddress || null, branchTimezone: input.branchTimezone || null }) }
  return <form onSubmit={submit} className="rounded-[24px] bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-xl font-black">โปรไฟล์ Workspace</h2><p className="text-sm text-slate-500">ข้อมูล Tenant, Workspace และสาขาหลัก</p></div>{!editable ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">อ่านอย่างเดียว</span> : null}</div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-bold">ชื่อธุรกิจ<input disabled={!editable || saving} required maxLength={200} value={input.tenantDisplayName} onChange={e => change('tenantDisplayName', e.target.value)} className={field} /></label>
      <label className="text-sm font-bold">ชื่อนิติบุคคล<input disabled={!editable || saving} maxLength={250} value={input.legalName || ''} onChange={e => change('legalName', e.target.value)} className={field} /></label>
      <label className="text-sm font-bold">ชื่อ Workspace<input disabled={!editable || saving} maxLength={200} value={input.workspaceDisplayName || ''} onChange={e => change('workspaceDisplayName', e.target.value)} className={field} /></label>
      <label className="text-sm font-bold">เขตเวลา Tenant<input disabled={!editable || saving} required maxLength={100} value={input.timezone} onChange={e => change('timezone', e.target.value)} className={field} /></label>
      <label className="text-sm font-bold">ชื่อสาขาหลัก<input disabled={!editable || saving} required maxLength={200} value={input.branchName} onChange={e => change('branchName', e.target.value)} className={field} /></label>
      <label className="text-sm font-bold">เขตเวลาสาขา<input disabled={!editable || saving} maxLength={100} value={input.branchTimezone || ''} onChange={e => change('branchTimezone', e.target.value)} className={field} /></label>
      <label className="text-sm font-bold sm:col-span-2">ที่อยู่สาขา<textarea disabled={!editable || saving} rows={3} maxLength={1000} value={input.branchAddress || ''} onChange={e => change('branchAddress', e.target.value)} className={field} /></label>
    </div>
    {editable ? <button disabled={saving || !input.tenantDisplayName.trim() || !input.branchName.trim()} className="mt-5 min-h-11 w-full rounded-2xl bg-blue-700 px-5 font-black text-white disabled:opacity-50 sm:w-auto">{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</button> : null}
  </form>
}
