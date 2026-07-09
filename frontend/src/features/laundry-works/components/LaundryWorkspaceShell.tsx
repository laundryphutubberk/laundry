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

export function LaundryWorkspaceShell({ children }: LaundryWorkspaceShellProps) {
  return (
    <div className="min-h-screen bg-slate-100/70 lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen overflow-hidden bg-gradient-to-b from-blue-950 via-blue-950 to-slate-950 text-white shadow-2xl shadow-blue-950/20 lg:block">
        <div className="flex h-24 items-center gap-3 border-b border-white/10 px-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-xl font-black text-white shadow-lg shadow-amber-500/20">
            ♨
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black leading-tight">โรงซักผ้าอุตสาหกรรม</p>
            <p className="mt-0.5 text-xs font-semibold text-blue-100/80">Laundry Management System</p>
          </div>
        </div>

        <nav className="space-y-1 px-4 py-7">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={
                item.active
                  ? 'flex w-full items-center gap-4 rounded-2xl bg-white/10 px-4 py-3.5 text-left text-sm font-black text-white shadow-sm ring-1 ring-white/10'
                  : 'flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-sm font-bold text-blue-100/85 hover:bg-white/10 hover:text-white'
              }
            >
              <span className={item.active ? 'flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-base text-white' : 'flex h-8 w-8 items-center justify-center rounded-xl text-base text-blue-100'}>
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
            <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm">
              ♫
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">12</span>
            </button>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-base font-black shadow-sm">
              ?
            </button>
            <div className="flex items-center gap-3 pl-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 text-lg font-black text-white">ส</div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-950">สมชาย</p>
                <p className="text-xs font-semibold text-slate-500">ผู้จัดการโรงซัก</p>
              </div>
              <span className="text-slate-500">⌄</span>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
