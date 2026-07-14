import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const [page, api, routes, shell] = await Promise.all([
  read('src/features/laundry-works/pages/LaundryWorkListPage.tsx'),
  read('src/features/laundry-works/api/laundryWorkApi.ts'),
  read('src/routes/laundryWorkRoutes.jsx'),
  read('src/features/laundry-works/components/LaundryWorkspaceShell.tsx'),
])
const requireText = (source, value, label) => { if (!source.includes(value)) throw new Error(`${label} missing: ${value}`) }

for (const queue of ['today', 'pending', 'ready']) {
  requireText(routes, `queue="${queue}"`, `${queue} shared route`)
  requireText(api, `query.set('queue', queue)`, 'server queue query')
}
requireText(shell, '/workspace/laundry/works/today', 'today navigation')
requireText(shell, '/workspace/laundry/works/pending', 'pending navigation')
requireText(shell, '/workspace/laundry/works/ready', 'ready navigation')
requireText(page, 'type LaundryWorkQueue', 'shared queue page contract')
requireText(page, "take: PAGE_SIZE", 'server pagination')
requireText(page, 'search: appliedSearch', 'server search')
requireText(page, 'min-h-11', 'mobile touch targets')
requireText(page, 'aria-label="การแบ่งหน้า"', 'accessible pagination')
if (/TodayLaundryWorkPage|PendingLaundryWorkPage|ReadyLaundryWorkPage/.test(routes + page)) {
  throw new Error('Queue routes must not create parallel workflow pages')
}
console.log('FRONTEND_WORK_QUEUE_VERIFY=PASS')
