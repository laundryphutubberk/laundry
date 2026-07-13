import { Navigate, useNavigate } from 'react-router-dom'

import { logoutCurrentDevice } from './authApi'
import { getAuthSession, hasBusinessContext } from './authSession'

export function OnboardingPage() {
  const navigate = useNavigate()
  const session = getAuthSession()
  if (!session) return <Navigate to="/login" replace />
  if (hasBusinessContext(session)) return <Navigate to="/workspace/laundry/works" replace />

  const logout = async () => {
    await logoutCurrentDevice()
    navigate('/login', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-lg rounded-[32px] bg-white p-8 shadow-xl shadow-slate-200/70">
        <p className="text-sm font-black uppercase tracking-wide text-blue-700">Account setup</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Your account is ready</h1>
        <p className="mt-4 text-base font-medium text-slate-600">Business setup is not complete yet. Laundry workspace access will become available after onboarding.</p>
        <button type="button" onClick={() => void logout()} className="mt-8 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">Log out</button>
      </section>
    </main>
  )
}
