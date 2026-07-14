import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const [page, api, policy, workCreate] = await Promise.all([
  read('src/features/resorts/ResortListPage.tsx'), read('src/features/resorts/resortApi.ts'),
  read('src/features/resorts/policies/resort.policy.ts'), read('src/features/laundry-works/pages/LaundryWorkCreatePage.tsx'),
])
const requireText = (source, text, label) => { if (!source.includes(text)) throw new Error(`${label} missing: ${text}`) }
requireText(policy, "workspaceType === 'LAUNDRY'", 'workspace policy')
requireText(policy, "'LAUNDRY_OWNER', 'LAUNDRY_MANAGER'", 'management roles')
requireText(page, 'canManageResorts(session.actorRole, session.workspaceType)', 'shared frontend RBAC')
requireText(page, '{canManage ?', 'management action filtering')
requireText(api, 'URLSearchParams', 'server-side query construction')
requireText(api, "params.set('search'", 'search query')
requireText(api, "params.set('skip'", 'pagination query')
requireText(api, "method: 'PATCH'", 'update endpoint')
requireText(page, 'activeFilter', 'active filter')
requireText(page, 'ResortEditor', 'shared create/edit form')
requireText(page, "useState(resort?.name || '')", 'edit form hydration')
requireText(page, 'ปิดใช้งาน', 'deactivation control')
requireText(page, 'role="dialog"', 'confirmation/editor dialogs')
requireText(page, 'min-h-11', 'mobile touch targets')
requireText(page, 'break-words', 'mobile overflow protection')
requireText(workCreate, 'listResorts()', 'Laundry Work active Resort integration')
requireText(api, "options: ResortListOptions = { active: true }", 'active-only default for Laundry Work')
if (/deleteResort|method:\s*['"]DELETE/.test(api)) throw new Error('Unsafe Resort hard delete introduced')
console.log('FRONTEND_RESORT_MANAGEMENT_VERIFY=PASS')
