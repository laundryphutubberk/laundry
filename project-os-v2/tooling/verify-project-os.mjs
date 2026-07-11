import { readFile, readdir, stat } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const warnings = []

const requiredFiles = [
  'BOOT.md',
  'README.md',
  'package.json',
  'kernel/COLLABORATION-PROTOCOL.md',
  'kernel/SOURCE-OF-TRUTH.md',
  'kernel/DISCOVERY-AND-BLUEPRINT.md',
  'kernel/DOMAIN-AND-DATA-DESIGN.md',
  'kernel/FLOW-EXECUTION-STANDARD.md',
  'kernel/CHANGE-CONTROL.md',
  'kernel/engineering/BACKEND-STANDARD.md',
  'kernel/engineering/FRONTEND-STANDARD.md',
  'kernel/SECURITY-STANDARD.md',
  'kernel/VERIFICATION-STANDARD.md',
  'project/PROJECT-PROFILE.md',
  'execution/STATE.json',
  'execution/FLOW-INDEX.md',
  'migration/V1-SAFETY-AND-MAP.md',
  'templates/BUSINESS-FLOW.template.md',
  'tooling/schemas/execution-state.schema.json',
  'tooling/schemas/flow-state.schema.json',
]

const documentStatuses = new Set(['DRAFT', 'PROPOSED', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'ARCHIVED', 'PLANNED'])
const workStatuses = new Set(['NOT_STARTED', 'DISCOVERY', 'DESIGNING', 'READY', 'IN_PROGRESS', 'BLOCKED', 'IMPLEMENTED_PENDING_VERIFICATION', 'VERIFIED', 'COMPLETED'])

async function exists(path) {
  try { await stat(path); return true } catch { return false }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const output = []
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) output.push(...await walk(path))
    else output.push(path)
  }
  return output
}

for (const path of requiredFiles) {
  if (!await exists(join(root, path))) failures.push(`Missing required file: ${path}`)
}

let state
try {
  state = JSON.parse(await readFile(join(root, 'execution/STATE.json'), 'utf8'))
} catch (error) {
  failures.push(`Invalid execution/STATE.json: ${error.message}`)
}

if (state) {
  const requiredKeys = ['project_os_version', 'state_version', 'project', 'status', 'authority', 'active_stage', 'active_flow', 'blocked_by', 'v1_policy', 'git_policy', 'updated_at']
  const allowedKeys = new Set(requiredKeys)
  for (const key of requiredKeys) if (!(key in state)) failures.push(`STATE.json missing key: ${key}`)
  for (const key of Object.keys(state)) if (!allowedKeys.has(key)) failures.push(`STATE.json unknown key: ${key}`)
  if (!workStatuses.has(state.status)) failures.push(`Invalid work status: ${state.status}`)
  if (!Number.isInteger(state.state_version) || state.state_version < 1) failures.push('state_version must be a positive integer')
  if (!Array.isArray(state.blocked_by) || state.blocked_by.some((item) => typeof item !== 'string' || !item.trim())) failures.push('blocked_by must be an array of non-empty strings')
  if (state.active_flow !== null && (typeof state.active_flow !== 'string' || !state.active_flow.trim())) failures.push('active_flow must be null or a non-empty string')
  if (Number.isNaN(Date.parse(state.updated_at))) failures.push('updated_at must be an ISO-compatible date-time')
  if (state.status === 'BLOCKED' && state.blocked_by.length === 0) failures.push('BLOCKED state requires blocked_by entries')
  if (state.status !== 'BLOCKED' && state.blocked_by.length > 0) warnings.push('blocked_by is populated while status is not BLOCKED')
}

const files = await walk(root)
const markdownFiles = files.filter((path) => extname(path).toLowerCase() === '.md')

for (const path of markdownFiles) {
  const content = await readFile(path, 'utf8')
  const rel = relative(root, path).replaceAll('\\', '/')
  const statusMatch = content.match(/^Status:\s*(.+)$/m)
  if (statusMatch && !documentStatuses.has(statusMatch[1].trim())) failures.push(`${rel}: invalid document Status '${statusMatch[1].trim()}'`)

  const workMatch = content.match(/^Work Status:\s*(.+)$/m)
  if (workMatch && !workStatuses.has(workMatch[1].trim())) failures.push(`${rel}: invalid Work Status '${workMatch[1].trim()}'`)

  const links = [...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1].trim())
  for (const target of links) {
    if (!target || target.startsWith('#') || /^[a-z]+:\/\//i.test(target) || target.startsWith('mailto:')) continue
    const clean = decodeURIComponent(target.split('#')[0]).replace(/^<|>$/g, '')
    if (!clean) continue
    if (!await exists(resolve(dirname(path), clean))) failures.push(`${rel}: broken local link '${target}'`)
  }
}

const portableRoots = ['kernel', 'templates', 'tooling']
for (const portableRoot of portableRoots) {
  const directory = join(root, portableRoot)
  if (!await exists(directory)) continue
  for (const path of await walk(directory)) {
    if (!['.md', '.json'].includes(extname(path).toLowerCase())) continue
    const content = await readFile(path, 'utf8')
    if (/\b(laundry|resort)\b/i.test(content)) failures.push(`${relative(root, path)}: project-specific term leaked into portable area`)
  }
}

if (state?.active_flow) {
  const expectedFlow = join(root, 'project/flows', state.active_flow)
  if (!await exists(expectedFlow)) failures.push(`active_flow does not resolve to project/flows/${state.active_flow}`)
  else {
    const flowFiles = ['FLOW.md', 'STATE.json', 'TRACEABILITY.md', 'DECISIONS.md', 'VERIFICATION-PLAN.md']
    for (const file of flowFiles) {
      if (!await exists(join(expectedFlow, file))) failures.push(`Active flow missing required file: project/flows/${state.active_flow}/${file}`)
    }

    try {
      const flowState = JSON.parse(await readFile(join(expectedFlow, 'STATE.json'), 'utf8'))
      const requiredFlowKeys = ['flow_id', 'document_status', 'work_status', 'scope', 'binary_upload', 'schema_change', 'api_contract_change', 'current_gate', 'blocked_by', 'known_gaps', 'updated_at']
      const allowedFlowKeys = new Set(requiredFlowKeys)
      for (const key of requiredFlowKeys) if (!(key in flowState)) failures.push(`Active flow STATE.json missing key: ${key}`)
      for (const key of Object.keys(flowState)) if (!allowedFlowKeys.has(key)) failures.push(`Active flow STATE.json unknown key: ${key}`)
      if (flowState.flow_id !== state.active_flow) failures.push(`Active flow id '${flowState.flow_id}' does not match global active_flow '${state.active_flow}'`)
      if (!documentStatuses.has(flowState.document_status)) failures.push(`Invalid active flow document_status: ${flowState.document_status}`)
      if (!workStatuses.has(flowState.work_status)) failures.push(`Invalid active flow work_status: ${flowState.work_status}`)
      if (!Array.isArray(flowState.blocked_by) || !Array.isArray(flowState.known_gaps)) failures.push('Active flow blocked_by and known_gaps must be arrays')
      if (flowState.work_status === 'BLOCKED' && flowState.blocked_by.length === 0) failures.push('BLOCKED active flow requires blocked_by entries')
      if (['VERIFIED', 'COMPLETED'].includes(flowState.work_status)) {
        const evidenceDirectory = join(expectedFlow, 'evidence')
        if (!await exists(evidenceDirectory) || (await readdir(evidenceDirectory)).length === 0) failures.push(`${flowState.work_status} active flow requires evidence files`)
      }
    } catch (error) {
      failures.push(`Invalid active flow STATE.json: ${error.message}`)
    }
  }
}

if (failures.length) {
  console.error('PROJECT_OS_V2_VERIFY=FAIL')
  for (const failure of failures) console.error(`FAIL: ${failure}`)
  for (const warning of warnings) console.warn(`WARN: ${warning}`)
  process.exitCode = 1
} else {
  console.log('PROJECT_OS_V2_VERIFY=PASS')
  console.log(`FILES_SCANNED=${files.length}`)
  console.log(`MARKDOWN_SCANNED=${markdownFiles.length}`)
  for (const warning of warnings) console.warn(`WARN: ${warning}`)
}
