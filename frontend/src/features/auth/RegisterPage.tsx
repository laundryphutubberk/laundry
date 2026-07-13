import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { register } from './authApi'
import { getAuthenticatedDestination } from './authSession'

export function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const session = await register({
        email,
        password,
        displayName: displayName || undefined,
        role: 'LAUNDRY_MANAGER',
        workspaceType: 'LAUNDRY',
      })
      navigate(getAuthenticatedDestination(session), { replace: true })
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[32px] border border-white/80 bg-white p-8 shadow-xl shadow-slate-200/70">
        <p className="text-sm font-black uppercase tracking-wide text-blue-700">Laundry Management System</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">ลงทะเบียน</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">สร้างบัญชีผู้จัดการ Laundry Workspace สำหรับเริ่มใช้งานระบบ</p>

        <label className="mt-8 block">
          <span className="text-sm font-bold text-slate-700">ชื่อที่แสดง</span>
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            autoComplete="name"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-bold text-slate-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            autoComplete="email"
            required
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-bold text-slate-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="mt-2 text-xs font-semibold text-slate-400">อย่างน้อย 8 ตัวอักษร</p>
        </label>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center rounded-2xl bg-blue-700 px-5 py-3 text-base font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'กำลังสร้างบัญชี...' : 'ลงทะเบียนและเข้าใช้งาน'}
        </button>

        <p className="mt-5 text-center text-sm font-semibold text-slate-500">
          มีบัญชีแล้ว?{' '}
          <Link to="/login" className="font-black text-blue-700 hover:text-blue-800">
            เข้าสู่ระบบ
          </Link>
        </p>
      </form>
    </div>
  )
}
