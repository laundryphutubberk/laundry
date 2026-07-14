import { useEffect, useRef, useState, type ReactNode } from 'react'
import { LogOut, Menu, ShieldCheck, X } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import { getAuthSession } from '../../auth/authSession'
import { logoutCurrentDevice } from '../../auth/authApi'

export type LaundryWorkspaceShellProps = {
  children: ReactNode
}

const navItems = [
  { label: 'งานทั้งหมด', icon: '▣', to: '/workspace/laundry/works' },
  { label: 'งานวันนี้', icon: '□', to: '/workspace/laundry/works/today' },
  { label: 'งานค้าง', icon: '◷', to: '/workspace/laundry/works/pending' },
  { label: 'พร้อมส่ง', icon: '▰', to: '/workspace/laundry/works/ready' },
  { label: 'ลูกค้า/รีสอร์ต', icon: '♙', to: '/workspace/laundry/resorts' },
  { label: 'รายการผ้า', icon: '≡', to: '/workspace/laundry/item-types' },
  { label: 'ศูนย์ปัญหา', icon: '!', to: '/workspace/laundry/issues' },
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

function WorkspaceNavigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="เมนูหลัก" className="space-y-px px-4 py-4">
      {navItems.map((item) => (
        <NavLink key={item.label} to={item.to} end onClick={onNavigate} className={({ isActive }) => navClassName(isActive)}>
          {({ isActive }) => (
            <>
              <span className={iconClassName(isActive)} aria-hidden="true">{item.icon}</span>
              <span className="min-w-0 truncate">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function LaundryWorkspaceShell({ children }: LaundryWorkspaceShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileDrawerRef = useRef<HTMLDivElement>(null)
  const session = getAuthSession()
  const displayName = session?.user?.displayName?.trim() || session?.user?.email || 'ผู้ใช้งาน'
  const role = session?.actor?.role || session?.user?.role || ''
  const workspaceType = session?.actor?.workspaceType || session?.user?.workspaceType || ''
  const roleLabel = roleLabels[role] || role || 'ผู้ใช้งานระบบ'
  const workspaceLabel = workspaceLabels[workspaceType] || workspaceType || 'Workspace'
  const avatarLabel = Array.from(displayName)[0]?.toUpperCase() || 'ผ'
  const currentNavItem = navItems.find((item) => item.to && (location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)))
  const currentPageLabel = currentNavItem?.label || workspaceLabel

  useEffect(() => {
    if (!mobileNavOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const drawer = mobileDrawerRef.current
    const firstControl = drawer?.querySelector<HTMLElement>('button, a[href]')
    firstControl?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false)
        return
      }
      if (event.key !== 'Tab' || !drawer) return

      const controls = Array.from(drawer.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'))
      if (!controls.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      mobileMenuTriggerRef.current?.focus()
    }
  }, [mobileNavOpen])

  const handleLogout = async () => {
    setMobileNavOpen(false)
    setUserMenuOpen(false)
    await logoutCurrentDevice()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-100/70 text-[16px] lg:pl-[280px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] overflow-y-auto bg-gradient-to-b from-blue-950 via-blue-950 to-slate-950 text-white shadow-2xl shadow-blue-950/20 lg:block">
        <div className="flex h-28 items-center gap-3 border-b border-white/10 px-5">
          <LaundryBrandMark />
          <div className="min-w-0">
            <p className="truncate text-[20px] font-black leading-tight">โรงซักภูทับเบิก</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-blue-100/80">Laundry Management System</p>
          </div>
        </div>

        <WorkspaceNavigation />
      </aside>

      <div className="min-w-0">
        <header
          className="sticky top-0 z-30 border-b border-white/10 bg-gradient-to-r from-blue-950 via-blue-950 to-slate-950 text-white shadow-lg shadow-blue-950/10 lg:hidden"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex h-16 min-w-0 items-center gap-2 px-3 sm:px-4">
            <button
              ref={mobileMenuTriggerRef}
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="เปิดเมนูหลัก"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-workspace-navigation"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-blue-50 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Menu size={24} aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black leading-tight">{currentPageLabel}</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-blue-100/75">{workspaceLabel}</p>
            </div>

            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label={`เปิดเมนูบัญชีของ ${displayName}`}
              className="flex h-11 max-w-[46%] shrink-0 items-center gap-2 rounded-xl px-1.5 text-left transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 text-sm font-black text-white">
                {avatarLabel}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-xs font-black">{displayName}</span>
                <span className="block truncate text-[11px] font-semibold text-blue-100/75">{roleLabel}</span>
              </span>
            </button>
          </div>
        </header>

        <header className="sticky top-0 z-30 hidden h-[72px] items-center justify-end border-b border-white/10 bg-gradient-to-r from-blue-950 via-blue-950 to-slate-950 px-6 shadow-lg shadow-blue-950/10 lg:flex">
          <div className="flex items-center gap-4 text-blue-50">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100">
              {workspaceLabel}
            </span>

            <span className="h-8 w-px bg-white/15" aria-hidden="true" />

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition hover:bg-white/10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 text-lg font-black text-white shadow-sm">
                  {avatarLabel}
                </div>
                <div className="max-w-52 text-right">
                  <p className="truncate text-base font-black leading-tight text-white">{displayName}</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-blue-100/75">{roleLabel}</p>
                </div>
                <span className={`text-sm text-blue-100/75 transition ${userMenuOpen ? 'rotate-180' : ''}`}>⌄</span>
              </button>

              {userMenuOpen ? (
                <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-2xl shadow-slate-950/20">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-black text-slate-950">{displayName}</p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{roleLabel}</p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setUserMenuOpen(false); navigate('/workspace/laundry/security') }}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    วิธีเข้าสู่ระบบและความปลอดภัย
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void handleLogout()}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-red-700 transition hover:bg-red-50"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {children}
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="ปิดเมนูหลัก"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-slate-950/60 backdrop-blur-[2px]"
          />
          <div
            id="mobile-workspace-navigation"
            ref={mobileDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-workspace-navigation-title"
            className="relative flex h-[100dvh] w-[min(88vw,340px)] flex-col overflow-hidden bg-gradient-to-b from-blue-950 via-blue-950 to-slate-950 text-white shadow-2xl"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-4">
              <LaundryBrandMark />
              <div className="min-w-0 flex-1">
                <p id="mobile-workspace-navigation-title" className="truncate text-lg font-black">โรงซักภูทับเบิก</p>
                <p className="truncate text-xs font-semibold text-blue-100/75">Laundry Management System</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="ปิดเมนูหลัก"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-blue-50 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <WorkspaceNavigation onNavigate={() => setMobileNavOpen(false)} />
            </div>

            <div className="shrink-0 border-t border-white/10 p-4">
              <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-white/10 p-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 text-base font-black">
                  {avatarLabel}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{displayName}</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-blue-100/75">{roleLabel}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-1">
                <button
                  type="button"
                  onClick={() => { setMobileNavOpen(false); navigate('/workspace/laundry/security') }}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-blue-50 transition hover:bg-white/10"
                >
                  <ShieldCheck size={20} aria-hidden="true" />
                  <span className="truncate">วิธีเข้าสู่ระบบและความปลอดภัย</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-red-200 transition hover:bg-red-500/15"
                >
                  <LogOut size={20} aria-hidden="true" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
