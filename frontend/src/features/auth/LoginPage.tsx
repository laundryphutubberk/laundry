import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'

import { AuthRequestError, googleLogin, login } from './authApi'
import { getAuthenticatedDestination, getAuthSession } from './authSession'
import { cancelGoogleIdentityPrompt, ensureGoogleIdentityAvailable, requestGoogleIdentityCredential } from './googleIdentityClient'

const GOOGLE_LOGIN_ERROR_MESSAGES: Record<string, string> = {
  GOOGLE_LOGIN_FAILED: 'Google login is not available for this account',
  AUTH_RATE_LIMITED: 'Too many attempts. Please try again later.',
  PROVIDER_UNAVAILABLE: 'Google service is temporarily unavailable.',
  INVALID_TOKEN: 'Google login failed. Please try again.',
  TOKEN_EXPIRED: 'Google login failed. Please try again.',
  INVALID_AUDIENCE: 'Google login failed. Please try again.',
  INVALID_ISSUER: 'Google login failed. Please try again.',
}

function normalizeGoogleLoginError(err: unknown): string {
  if (err instanceof AuthRequestError && err.code && GOOGLE_LOGIN_ERROR_MESSAGES[err.code]) {
    return GOOGLE_LOGIN_ERROR_MESSAGES[err.code]
  }

  if (err instanceof Error) {
    if (err.message.includes('not configured')) return 'Google login is not available for this environment'
    if (err.message.includes('cancelled')) return 'Google login was cancelled'
    if (err.message.includes('did not return a credential')) return 'Google login failed. Please try again.'
    if (err.message.includes('unavailable')) return 'Google login is temporarily unavailable'
  }

  return 'Google login failed. Please try again.'
}

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const googleLoginInFlightRef = useRef(false)
  const returnTo = searchParams.get('returnTo')
  const authenticatedDestination = returnTo?.startsWith('/workspace/') ? returnTo : '/workspace/laundry/works'

  useEffect(() => {
    let active = true
    ensureGoogleIdentityAvailable().then((available) => {
      if (active) setGoogleAvailable(available)
    })
    return () => {
      active = false
      cancelGoogleIdentityPrompt()
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const session = await login({ email, password, rememberDevice, deviceLabel: navigator.userAgent })
      navigate(getAuthenticatedDestination(session, authenticatedDestination), { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = useCallback(async () => {
    if (googleLoginInFlightRef.current) return
    googleLoginInFlightRef.current = true
    setGoogleLoading(true)
    setGoogleError(null)

    try {
      const credential = await requestGoogleIdentityCredential()
      if (!credential) {
        setGoogleError('Google login was cancelled')
        return
      }

      const session = await googleLogin({ idToken: credential, rememberDevice, deviceLabel: navigator.userAgent })
      navigate(getAuthenticatedDestination(session, authenticatedDestination), { replace: true })
    } catch (err) {
      setGoogleError(normalizeGoogleLoginError(err))
    } finally {
      googleLoginInFlightRef.current = false
      setGoogleLoading(false)
    }
  }, [rememberDevice, authenticatedDestination, navigate])

  const installedSession = getAuthSession()
  if (installedSession) return <Navigate to={getAuthenticatedDestination(installedSession, authenticatedDestination)} replace />

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

        <label className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
          <input type="checkbox" checked={rememberDevice} onChange={(event) => setRememberDevice(event.target.checked)} disabled={loading} className="mt-0.5 h-5 w-5" />
          <span className="text-sm font-semibold text-slate-700">จดจำอุปกรณ์ส่วนตัวนี้ <span className="block font-normal text-slate-500">คุณยังออกจากระบบหรือเพิกถอนอุปกรณ์ได้ และเซสชันจะหมดอายุ</span></span>
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

        {googleAvailable === true ? (
          <>
            <div className="mt-6 flex items-center gap-3">
              <hr className="flex-1 border-slate-200" />
              <span className="text-xs font-semibold text-slate-400">หรือ</span>
              <hr className="flex-1 border-slate-200" />
            </div>

            {googleError ? (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {googleError}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || googleLoginInFlightRef.current}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบด้วย Google'}
            </button>
          </>
        ) : null}

        <p className="mt-5 text-center text-sm font-semibold text-slate-500">
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="font-black text-blue-700 hover:text-blue-800">
            ลงทะเบียน
          </Link>
        </p>
      </form>
    </div>
  )
}
