import { FormEvent, useEffect, useState } from 'react'
import { getAuthSession } from './authSession'
import { useIdentityLinkingController } from './useIdentityLinkingController'

export function IdentityManagementPage() {
  const controller = useIdentityLinkingController()
  const [password, setPassword] = useState('')
  const session = getAuthSession()
  const google = controller.identities.find((identity) => identity.provider === 'GOOGLE' && identity.active)
  useEffect(() => { if (controller.phase === 'idle') setPassword('') }, [controller.phase])
  const close = () => { if (!controller.pending) { setPassword(''); controller.clearFlow() } }
  const submitPassword = (event: FormEvent) => {
    event.preventDefault()
    if (controller.phase === 'link-password') void controller.completeLink(password)
    if (controller.phase === 'unlink-password') void controller.completeUnlink(password)
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-72px)] w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="rounded-[28px] border border-white/70 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-black uppercase tracking-wide text-blue-700">Account Security</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">วิธีเข้าสู่ระบบ</h1>
        <p className="mt-2 break-words text-sm text-slate-600">จัดการวิธีเข้าสู่ระบบของ {session?.user.email} โดยไม่เปลี่ยนสิทธิ์หรือพื้นที่ทำงาน</p>
      </header>

      {controller.error ? <div className="mt-4 break-words rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">{controller.error}</div> : null}
      {controller.success ? <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700" role="status">{controller.success}</div> : null}

      <section className="mt-5 rounded-[28px] border border-white/70 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-xl font-black text-slate-950">วิธีที่ใช้งานอยู่</h2>
        <div className="mt-4 rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-black text-slate-900">รหัสผ่าน</p><p className="mt-1 break-words text-sm text-slate-500">{session?.user.email}</p></div>
            <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">ใช้งานอยู่</span>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-black text-slate-900">Google</p>
              {controller.loading ? <p className="mt-1 text-sm text-slate-500">กำลังโหลด...</p> : google ? <><p className="mt-1 break-words text-sm font-semibold text-slate-700">{google.displayName || 'บัญชี Google'}</p><p className="break-all text-sm text-slate-500">{google.email}</p><p className="mt-1 text-xs text-slate-400">เชื่อมเมื่อ {new Date(google.linkedAt).toLocaleString('th-TH')}</p></> : <p className="mt-1 text-sm text-slate-500">ยังไม่ได้เชื่อมบัญชี Google</p>}
            </div>
            {google ? <button type="button" onClick={() => controller.chooseUnlink(google)} disabled={controller.pending} className="min-h-11 rounded-xl border border-red-200 px-4 py-2 text-sm font-black text-red-700 disabled:opacity-50">ยกเลิกการเชื่อม</button> : <button type="button" onClick={() => void controller.startLink()} disabled={controller.pending || controller.loading} className="min-h-11 rounded-xl bg-blue-800 px-4 py-2 text-sm font-black text-white disabled:opacity-50">{controller.pending ? 'กำลังเปิด Google...' : 'เชื่อมบัญชี Google'}</button>}
          </div>
        </div>
      </section>

      {controller.phase !== 'idle' ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="identity-dialog-title">
        <section className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl sm:p-6">
          <h2 id="identity-dialog-title" className="text-xl font-black text-slate-950">{controller.phase.startsWith('unlink') ? 'ยืนยันยกเลิกการเชื่อม Google' : 'ยืนยันเชื่อมบัญชี Google'}</h2>
          {controller.error ? <p className="mt-3 break-words rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{controller.error}</p> : null}

          {controller.phase === 'link-confirm' && controller.linkIntent ? <div className="mt-4 space-y-3 text-sm">
            <p>คุณกำลังเชื่อม Google กับบัญชีภายใน <strong className="break-all">{session?.user.email}</strong></p>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="font-black">{controller.linkIntent.displayName || 'บัญชี Google'}</p><p className="break-all text-slate-600">{controller.linkIntent.email}</p></div>
            <p className="text-slate-500">ระบบจะไม่เชื่อมบัญชีจากอีเมลที่ตรงกันโดยอัตโนมัติ กรุณายืนยันด้วยตนเอง</p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => void controller.cancelLink()} disabled={controller.pending} className="min-h-11 rounded-xl border px-4 py-2 font-bold">ยกเลิก</button><button type="button" onClick={() => void controller.confirmLink()} disabled={controller.pending} className="min-h-11 rounded-xl bg-blue-800 px-4 py-2 font-black text-white">ยืนยันและตรวจสอบรหัสผ่าน</button></div>
          </div> : null}

          {controller.phase === 'unlink-confirm' ? <div className="mt-4 space-y-4 text-sm"><p>การยกเลิกจะทำให้เข้าสู่ระบบด้วย Google บัญชีนี้ไม่ได้ แต่ไม่เปลี่ยนสิทธิ์หรือบัญชีภายใน</p><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={close} disabled={controller.pending} className="min-h-11 rounded-xl border px-4 py-2 font-bold">ยกเลิก</button><button type="button" onClick={() => void controller.confirmUnlink()} disabled={controller.pending} className="min-h-11 rounded-xl bg-red-700 px-4 py-2 font-black text-white">ดำเนินการต่อ</button></div></div> : null}

          {(controller.phase === 'link-password' || controller.phase === 'unlink-password') ? <form onSubmit={submitPassword} className="mt-4">
            <p className="text-sm text-slate-600">กรอกรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนแปลงนี้</p>
            <label className="mt-4 block text-sm font-bold text-slate-700">รหัสผ่าน<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={controller.pending} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" required /></label>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={close} disabled={controller.pending} className="min-h-11 rounded-xl border px-4 py-2 font-bold">ยกเลิก</button><button type="submit" disabled={controller.pending || !password} className={`min-h-11 rounded-xl px-4 py-2 font-black text-white disabled:opacity-50 ${controller.phase === 'unlink-password' ? 'bg-red-700' : 'bg-blue-800'}`}>{controller.pending ? 'กำลังยืนยัน...' : 'ยืนยันด้วยรหัสผ่าน'}</button></div>
          </form> : null}
        </section>
      </div> : null}
    </main>
  )
}
