import type { ReactNode } from 'react'

export type LaundryWorkspaceShellProps = {
  children: ReactNode
}

const navItems = [
  { label: 'หน้าหลัก', icon: '⌂', active: true },
  { label: 'งานทั้งหมด', icon: '▣' },
  { label: 'งานวันนี้', icon: '□' },
  { label: 'งานค้าง', icon: '◷' },
  { label: 'พร้อมส่ง', icon: '▰' },
  { label: 'ลูกค้า/รีสอร์ต', icon: '♙' },
  { label: 'รายการผ้า', icon: '≡' },
  { label: 'รายงาน', icon: '▥' },
  { label: 'แจ้งปัญหา', icon: '!' },
  { label: 'ตั้งค่า', icon: '⚙' },
]

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

export function LaundryWorkspaceShell({ children }: LaundryWorkspaceShellProps) {
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

        <nav className="space-y-0.5 px-4 py-5">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={
                item.active
                  ? 'flex w-full items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-2.5 text-left text-lg font-black text-white shadow-sm ring-1 ring-white/10'
                  : 'flex w-full items-center gap-2.5 rounded-2xl px-4 py-2.5 text-left text-lg font-bold text-blue-100/85 hover:bg-white/10 hover:text-white'
              }
            >
              <span className={item.active ? 'flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-lg text-white' : 'flex h-9 w-9 items-center justify-center rounded-xl text-lg text-blue-100'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 hidden h-20 items-center justify-end border-b border-slate-200 bg-white/95 px-8 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85 lg:flex">
          <div className="flex items-center gap-5 text-slate-700">
            <button type="button" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-xl shadow-sm">
              ♫
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-black text-white">12</span>
            </button>
            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-black shadow-sm">
              ?
            </button>
            <div className="flex items-center gap-3 pl-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 text-xl font-black text-white">ส</div>
              <div className="text-right">
                <p className="text-base font-black text-slate-950">สมชาย</p>
                <p className="text-sm font-semibold text-slate-500">ผู้จัดการโรงซัก</p>
              </div>
              <span className="text-lg text-slate-500">⌄</span>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
