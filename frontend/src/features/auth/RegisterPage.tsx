import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthRequestError, googleRegister, register } from './authApi'
import { getAuthenticatedDestination } from './authSession'
import { cancelGoogleIdentityPrompt, ensureGoogleIdentityAvailable, requestGoogleIdentityCredential } from './googleIdentityClient'

const GOOGLE_REGISTRATION_ERROR_MESSAGES: Record<string, string> = {
  GOOGLE_REGISTRATION_DISABLED: 'Google registration is not available',
  GOOGLE_REGISTRATION_INVITATION_REQUIRED: 'An invitation is required to register',
  GOOGLE_REGISTRATION_EMAIL_REQUIRED: 'A verified Google email is required',
  GOOGLE_ACCOUNT_ALREADY_REGISTERED: 'This Google account is already registered. Sign in instead.',
  GOOGLE_REGISTRATION_EMAIL_CONFLICT: 'Registration cannot be completed with this email. Sign in and link Google from account settings.',
  GOOGLE_IDENTITY_RELINK_REQUIRED: 'This Google account requires account recovery before it can be used.',
  GOOGLE_REGISTRATION_UNAVAILABLE: 'Google registration is not available for this account',
  AUTH_RATE_LIMITED: 'Too many attempts. Please try again later.',
  PROVIDER_UNAVAILABLE: 'Google service is temporarily unavailable.',
  INVALID_TOKEN: 'Google registration failed. Please try again.',
  TOKEN_EXPIRED: 'Google registration failed. Please try again.',
  INVALID_AUDIENCE: 'Google registration failed. Please try again.',
  INVALID_ISSUER: 'Google registration failed. Please try again.',
}

function normalizeGoogleRegistrationError(error: unknown): string {
  if (error instanceof AuthRequestError && error.code && GOOGLE_REGISTRATION_ERROR_MESSAGES[error.code]) {
    return GOOGLE_REGISTRATION_ERROR_MESSAGES[error.code]
  }
  if (error instanceof Error) {
    if (error.message.includes('not configured')) return 'Google registration is not available for this environment'
    if (error.message.includes('cancelled')) return 'Google registration was cancelled'
    if (error.message.includes('unavailable')) return 'Google registration is temporarily unavailable'
  }
  return 'Google registration failed. Please try again.'
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberDevice, setRememberDevice] = useState(false)
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const googleRegisterInFlightRef = useRef(false)

  useEffect(() => {
    let active = true
    ensureGoogleIdentityAvailable().then((available) => { if (active) setGoogleAvailable(available) })
    return () => { active = false; cancelGoogleIdentityPrompt() }
  }, [])

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

  const handleGoogleRegister = useCallback(async () => {
    if (googleRegisterInFlightRef.current) return
    googleRegisterInFlightRef.current = true
    setGoogleLoading(true)
    setGoogleError(null)
    try {
      const credential = await requestGoogleIdentityCredential()
      const session = await googleRegister({ idToken: credential, rememberDevice, deviceLabel: navigator.userAgent })
      navigate(getAuthenticatedDestination(session), { replace: true })
    } catch (googleRegistrationError) {
      setGoogleError(normalizeGoogleRegistrationError(googleRegistrationError))
    } finally {
      googleRegisterInFlightRef.current = false
      setGoogleLoading(false)
    }
  }, [navigate, rememberDevice])

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

        <label className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
          <input type="checkbox" checked={rememberDevice} onChange={(event) => setRememberDevice(event.target.checked)} disabled={loading || googleLoading} className="mt-0.5 h-5 w-5" />
          <span className="text-sm font-semibold text-slate-700">จดจำอุปกรณ์ส่วนตัวนี้</span>
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

        {googleAvailable === true ? (
          <>
            <div className="mt-6 flex items-center gap-3">
              <hr className="flex-1 border-slate-200" />
              <span className="text-xs font-semibold text-slate-400">หรือ</span>
              <hr className="flex-1 border-slate-200" />
            </div>
            {googleError ? <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{googleError}</div> : null}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={googleLoading || googleRegisterInFlightRef.current}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? 'กำลังสร้างบัญชี...' : 'สมัครใช้งานด้วย Google'}
            </button>
          </>
        ) : null}

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
