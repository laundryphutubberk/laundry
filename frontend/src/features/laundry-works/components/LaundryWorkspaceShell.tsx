import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { clearAuthSession, getAuthSession } from '../../auth/authSession'

export type LaundryWorkspaceShellProps = {
  children: ReactNode
}

const navItems = [
  { label: 'งานทั้งหมด', icon: '▣', to: '/workspace/laundry/works' },
  { label: 'งานวันนี้', icon: '□' },
  { label: 'งานค้าง', icon: '◷' },
  { label: 'พร้อมส่ง', icon: '▰' },
  { label: 'ลูกค้า/รีสอร์ต', icon: '♙', to: '/workspace/laundry/resorts' },
  { label: 'รายการผ้า', icon: '≡' },
  { label: 'รายงาน', icon: '▥' },
  { label: 'แจ้งปัญหา', icon: '!' },
  { label: 'ตั้งค่า', icon: '⚙' },
]

const roleLabels: Record<string, string> = {
  LAUNDRY_OWNER: 'เจ้าของโรงซัก',
  LAUNDRY_MANAGER: 'ผู้จัดการโรงซัก',
  LAUNDRY_STAFF: 'พนักงานโรงซัก',
  RESORT_OWNER: 'เจ้าของรีสอร์ต',
  RESORT_STAFF: 'พนักงานรีสอร์ต',
}

const workspaceLabels: Record<string, string> = {
  LAUNDRY: 'Laundry Workspace',
  RESORT: 'Resort Workspace',
}

function LaundryBrandMark() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Laundry Phu Thap Boek" className="h-13 w-13 shrink-0">
      <circle cx="32" cy="32" r="30" fill="white" />
      <circle cx="32" cy="32" r="29" fill="none" stroke="#0b2f5f" strokeWidth="3" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="#5b8fbd" strokeWidth="1.5" />
      <path d="M12 30 L24 19 L31 25 L39 12 L53 30" fill="none" stroke="#0b2f5f" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 40 C20 32 29 48 42 39 C48 35 53 35 58 38" fill="none" stroke="#5b8fbd" strokeWidth="4" strokeLinecap="round" />
      <path d="M12 45 C23 38 32 51 46 43 C51 40 55 41 59 43" fill="none" stroke="#0f5f9a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function navClassName(active?: boolean) {
  return active
    ? 'flex w-full items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-2 text-left text-lg font-black text-white shadow-sm ring-1 ring-white/10'
    : 'flex w-full items-center gap-2.5 rounded-2xl px-4 py-2 text-left text-lg font-bold text-blue-100/85 hover:bg-white/10 hover:text-white'
}

function iconClassName(active?: boolean) {
  return active
    ? 'flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-lg text-white'
    : 'flex h-9 w-9 items-center justify-center rounded-xl text-lg text-blue-100'
}

export function LaundryWorkspaceShell({ children }: LaundryWorkspaceShellProps) {
  const navigate = useNavigate()
  const session = getAuthSession()
  const displayName = session?.user?.displayName?.trim() || session?.user?.email || 'ผู้ใช้งาน'
  const role = session?.actor?.role || session?.user?.role || ''
  const workspaceType = session?.actor?.workspaceType || session?.user?.workspaceType || ''
  const roleLabel = roleLabels[role] || role || 'ผู้ใช้งานระบบ'
  const workspaceLabel = workspaceLabels[workspaceType] || workspaceType || 'Workspace'
  const avatarLabel = Array.from(displayName)[0]?.toUpperCase() || 'ผ'

  const handleLogout = () => {
    clearAuthSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-[16px] lg:pl-[280px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] overflow-y-auto bg-gradient-to-b from-blue-950 via-blue-950 to-slate-950 text-white shadow-2xl shadow-blue-950/20 lg:block">
        <div className="flex h-28 items-center gap-3 border-b border-white/10 px-5">
          <LaundryBrandMark />
          <div className="min-w-0">
            <p className="truncate text-[20px] font-black leading-tight">โรงซักภูทับเบิก</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-blue-100/80">Laundry Management System</p>
          </div>
        </div>

        <nav className="space-y-px px-4 py-4">
          {navItems.map((item) =>
            item.to ? (
              <NavLink key={item.label} to={item.to} end className={({ isActive }) => navClassName(isActive)}>
                {({ isActive }) => (
                  <>
                    <span className={iconClassName(isActive)}>{item.icon}</span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ) : (
              <button key={item.label} type="button" disabled className={navClassName(false)}>
                <span className={iconClassName(false)}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ),
          )}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 hidden h-[72px] items-center justify-end border-b border-white/10 bg-gradient-to-r from-blue-950 via-blue-950 to-slate-950 px-6 shadow-lg shadow-blue-950/10 lg:flex">
          <div className="flex items-center gap-4 text-blue-50">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100">
              {workspaceLabel}
            </span>

            <span className="h-8 w-px bg-white/15" aria-hidden="true" />

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 text-lg font-black text-white shadow-sm">
                {avatarLabel}
              </div>
              <div className="max-w-52 text-right">
                <p className="truncate text-base font-black leading-tight text-white">{displayName}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-blue-100/75">{roleLabel}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/20"
            >
              ออกจากระบบ
            </button>
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
