import { FormEvent, useEffect, useState } from 'react'

import { createResort, listResorts, type ResortDTO } from './resortApi'

export function ResortListPage() {
  const [resorts, setResorts] = useState<ResortDTO[]>([])
  const [name, setName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadResorts() {
    setLoading(true)
    setError(null)

    try {
      const result = await listResorts()
      setResorts(result.items)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load resorts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadResorts()
  }, [])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return

    setCreating(true)
    setError(null)

    try {
      await createResort({
        name: name.trim(),
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        address: address.trim() || undefined,
      })
      setName('')
      setContactName('')
      setContactPhone('')
      setAddress('')
      await loadResorts()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create resort')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/70">
      <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 md:px-6 lg:px-8 xl:px-10">
        <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-blue-700">Laundry Workspace</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">ลูกค้า / รีสอร์ต</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">จัดการรีสอร์ตจริงที่ใช้สร้าง Laundry Work</p>
        </section>

        <form onSubmit={handleCreate} className="rounded-[28px] border border-white/70 bg-white p-6 shadow-sm">
          <p className="text-lg font-black text-slate-950">เพิ่มรีสอร์ตใหม่</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">ชื่อรีสอร์ต</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
                disabled={creating}
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">ผู้ติดต่อ</span>
              <input
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                disabled={creating}
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">เบอร์โทร</span>
              <input
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                disabled={creating}
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">ที่อยู่</span>
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                disabled={creating}
              />
            </label>
          </div>
          {error ? <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? 'กำลังเพิ่ม...' : 'เพิ่มรีสอร์ต'}
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-sm">
          <div className="border-b bg-slate-50 px-5 py-4">
            <p className="text-lg font-black text-slate-950">รายการรีสอร์ต</p>
          </div>

          {loading ? (
            <div className="p-5 text-sm font-semibold text-slate-500">กำลังโหลดรีสอร์ต...</div>
          ) : resorts.length === 0 ? (
            <div className="p-5 text-sm font-semibold text-slate-500">ยังไม่มีรีสอร์ต</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {resorts.map((resort) => (
                <div key={resort.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1.3fr)_220px_180px_120px] lg:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-slate-950">{resort.name}</p>
                    <p className="mt-1 truncate text-sm font-medium text-slate-500">{resort.address || 'ไม่มีที่อยู่'}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-600">{resort.contactName || '-'}</p>
                  <p className="text-sm font-semibold text-slate-600">{resort.contactPhone || '-'}</p>
                  <span className="w-fit rounded-xl bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{resort.active ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
