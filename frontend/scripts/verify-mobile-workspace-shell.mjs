import { readFile } from 'node:fs/promises'

const shell = await readFile(new URL('../src/features/laundry-works/components/LaundryWorkspaceShell.tsx', import.meta.url), 'utf8')
const authApi = await readFile(new URL('../src/features/auth/authApi.ts', import.meta.url), 'utf8')

const requireText = (text, label) => {
  if (!shell.includes(text)) throw new Error(`Mobile workspace shell missing ${label}: ${text}`)
}

requireText('const navItems = [', 'shared navigation model')
requireText('function WorkspaceNavigation', 'shared desktop/mobile navigation renderer')
if ((shell.match(/navItems\.map/g) || []).length !== 1) throw new Error('Navigation items must be rendered from one shared list')
requireText('<WorkspaceNavigation />', 'desktop navigation')
requireText('<WorkspaceNavigation onNavigate={() => setMobileNavOpen(false)} />', 'mobile navigation with route-close behavior')
requireText('lg:hidden', 'mobile breakpoint presentation')
requireText('lg:block', 'desktop sidebar presentation')
requireText('aria-modal="true"', 'accessible modal drawer')
requireText("event.key === 'Escape'", 'Escape close behavior')
requireText("event.key !== 'Tab'", 'focus trap behavior')
requireText("document.body.style.overflow = 'hidden'", 'body scroll lock')
requireText("document.body.style.overflow = previousOverflow", 'body scroll restoration')
requireText('overflow-y-auto overscroll-contain', 'scrollable drawer content')
requireText("paddingTop: 'env(safe-area-inset-top)'", 'top safe area')
requireText("paddingBottom: 'env(safe-area-inset-bottom)'", 'bottom safe area')
requireText('overflow-x-clip', 'shell horizontal overflow protection')
requireText('truncate', 'long-label containment')
requireText('await logoutCurrentDevice()', 'existing logout flow')
requireText("navigate('/login', { replace: true })", 'logout navigation')
requireText('setMobileNavOpen(false)', 'drawer close behavior')

if (!authApi.includes("fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' })")) {
  throw new Error('Existing backend logout contract changed or is not used')
}
if (!authApi.includes('clearAuthSession()')) throw new Error('Existing logout no longer clears authentication state')
if (!authApi.includes("fetch(`${API_BASE_URL}/auth/session/refresh`")) throw new Error('Remembered-session startup contract changed')

console.log('FRONTEND_MOBILE_WORKSPACE_SHELL_VERIFY=PASS')
