import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const [shell, routes, detail, controller, image, issue, claim, api] = await Promise.all([
  read('src/features/laundry-works/components/LaundryWorkspaceShell.tsx'),
  read('src/routes/laundryWorkRoutes.jsx'),
  read('src/features/laundry-works/pages/LaundryWorkDetailPage.tsx'),
  read('src/features/laundry-works/controllers/useLaundryWorkController.ts'),
  read('src/features/laundry-works/runtime/LaundryImageRuntimePanel.tsx'),
  read('src/features/laundry-works/runtime/LaundryIssueRuntimePanel.tsx'),
  read('src/features/laundry-works/runtime/LaundryClaimRuntimePanel.tsx'),
  read('src/features/laundry-works/api/laundryWorkApi.ts'),
])
const requireText = (source, value, label) => { if (!source.includes(value)) throw new Error(`${label} missing: ${value}`) }

for (const path of ['works', 'works/today', 'works/pending', 'works/ready', 'works/new', 'works/:workId', 'resorts']) {
  requireText(routes, `path: '${path}'`, `operational route ${path}`)
}
for (const path of ['/workspace/laundry/works', '/workspace/laundry/works/today', '/workspace/laundry/works/pending', '/workspace/laundry/works/ready', '/workspace/laundry/resorts']) {
  requireText(shell, path, `working navigation ${path}`)
}
if (shell.includes('type="button" disabled')) throw new Error('Workspace navigation must not expose disabled dead-end entries')

for (const panel of ['BagPanel', 'CountEntryPanel', 'CountTable', 'LaundryImageRuntimePanel', 'LaundryIssueRuntimePanel', 'LaundryClaimRuntimePanel']) {
  requireText(detail, panel, `operational detail panel ${panel}`)
}
for (const command of ['completeCounting', 'confirm-type-sorting', 'confirm-color-sorting', 'record-data', 'confirm-return', 'close']) {
  requireText(controller + api, command, `lifecycle action ${command}`)
}
requireText(image, 'capture="environment"', 'mobile camera upload')
requireText(image, 'accept="image/jpeg,image/png,image/webp"', 'image validation contract')
requireText(issue, 'createIssue', 'issue creation action')
requireText(claim, 'r.create(issueId', 'claim creation action')
requireText(shell, "document.body.style.overflow = 'hidden'", 'mobile drawer scroll lock')
requireText(shell, "event.key === 'Escape'", 'mobile drawer keyboard dismissal')

console.log('FRONTEND_OPERATIONAL_MVP_VERIFY=PASS')
