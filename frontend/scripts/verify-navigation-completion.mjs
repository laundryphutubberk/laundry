import { readFile } from 'node:fs/promises'

const shell = await readFile(new URL('../src/features/laundry-works/components/LaundryWorkspaceShell.tsx', import.meta.url), 'utf8')
const routes = await readFile(new URL('../src/routes/laundryWorkRoutes.jsx', import.meta.url), 'utf8')

const completedNavigation = [
  ['/workspace/laundry/works', "path: 'works'"],
  ['/workspace/laundry/works/today', "path: 'works/today'"],
  ['/workspace/laundry/works/pending', "path: 'works/pending'"],
  ['/workspace/laundry/works/ready', "path: 'works/ready'"],
  ['/workspace/laundry/resorts', "path: 'resorts'"],
  ['/workspace/laundry/item-types', "path: 'item-types'"],
  ['/workspace/laundry/issues', "path: 'issues'"],
  ['/workspace/laundry/reports', "path: 'reports'"],
  ['/workspace/laundry/settings', "path: 'settings'"],
  ['/workspace/laundry/security', "path: 'security'"],
]

for (const [destination, route] of completedNavigation) {
  if (!shell.includes(`to: '${destination}'`)) throw new Error(`Completed capability is missing from shared navigation: ${destination}`)
  if (!routes.includes(route)) throw new Error(`Navigation destination has no registered route: ${route}`)
  if ((shell.match(new RegExp(`to: '${destination.replaceAll('/', '\\/')}'`, 'g')) || []).length !== 1) {
    throw new Error(`Navigation destination must be registered exactly once: ${destination}`)
  }
}

if ((shell.match(/navItems\.map/g) || []).length !== 1) throw new Error('Desktop and mobile navigation must share one renderer')
if (!shell.includes('<WorkspaceNavigation />')) throw new Error('Desktop sidebar does not use shared navigation')
if (!shell.includes('<WorkspaceNavigation onNavigate={() => setMobileNavOpen(false)} />')) throw new Error('Mobile drawer does not close after navigation')
if (!shell.includes('<NavLink key={item.label} to={item.to} end')) throw new Error('Navigation active state must use exact route matching')
if (!shell.includes('.sort((left, right) => right.to.length - left.to.length)')) throw new Error('Page label must prefer the most specific active route')
if (!shell.includes("managementOnly: true") || !shell.includes("['LAUNDRY_OWNER', 'LAUNDRY_MANAGER']")) throw new Error('Reports RBAC navigation visibility is missing')
if ((shell.match(/void handleLogout\(\)/g) || []).length !== 2) throw new Error('Logout must remain available on desktop and mobile')
if (!routes.includes('ReportsRoute') || !routes.includes('SettingsRoute')) throw new Error('Lazy capability route boundary is missing')

console.log('FRONTEND_NAVIGATION_COMPLETION_VERIFY=PASS')
