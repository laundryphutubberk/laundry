import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { login } from './authApi'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await login({ email, password })
      navigate('/workspace/laundry/works', { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[32px] border border-white/80 bg-white p-8 shadow-xl shadow-slate-200/70">
        <p className="text-sm font-black uppercase tracking-wide text-blue-700">Laundry Management System</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">เข้าสู่ระบบ</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">ใช้บัญชีผู้ใช้จริงจากระบบเพื่อเข้า workspace</p>

        <label className="mt-8 block">
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
            autoComplete="current-password"
            required
          />
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
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  )
}
