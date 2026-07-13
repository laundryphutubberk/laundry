import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectOsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(projectOsRoot, '..')
const requiredDocs = [
  'DEPLOYMENT-ARCHITECTURE.md', 'ENVIRONMENT-MATRIX.md', 'VERCEL-CONFIG.md',
  'RENDER-CONFIG.md', 'DEPLOYMENT-CHECKLIST.md', 'DEPLOYMENT-RUNBOOK.md', 'STATE.json',
]
await Promise.all(requiredDocs.map((name) => stat(resolve(projectOsRoot, 'deployment', name))))

const frontendPackage = JSON.parse(await readFile(resolve(repoRoot, 'frontend/package.json'), 'utf8'))
const backendPackage = JSON.parse(await readFile(resolve(repoRoot, 'backend/package.json'), 'utf8'))
assert.equal(frontendPackage.scripts.build, 'vite build')
assert.equal(backendPackage.scripts.start, 'node index.js')

const architecture = await readFile(resolve(projectOsRoot, 'deployment/DEPLOYMENT-ARCHITECTURE.md'), 'utf8')
const vercel = await readFile(resolve(projectOsRoot, 'deployment/VERCEL-CONFIG.md'), 'utf8')
const render = await readFile(resolve(projectOsRoot, 'deployment/RENDER-CONFIG.md'), 'utf8')
const matrix = await readFile(resolve(projectOsRoot, 'deployment/ENVIRONMENT-MATRIX.md'), 'utf8')
assert.match(architecture, /Root Directory `frontend`/)
assert.match(architecture, /Root Directory `backend`/)
assert.match(architecture, /Not deployed/)
assert.match(vercel, /Output Directory \| `dist`/)
assert.match(render, /npx prisma migrate deploy/)

const variables = [
  'VITE_API_BASE_URL', 'VITE_GOOGLE_CLIENT_ID', 'NODE_ENV', 'PORT', 'DATABASE_URL', 'DIRECT_URL',
  'JWT_SECRET', 'ENABLE_DEV_ACTOR_HEADER', 'AUTH_ACCESS_TOKEN_TTL', 'AUTH_SESSION_IDLE_DAYS',
  'AUTH_SESSION_ABSOLUTE_DAYS', 'AUTH_COOKIE_NAME', 'CORS_ORIGINS', 'GOOGLE_IDENTITY_ENABLED',
  'GOOGLE_CLIENT_ID', 'AUTH_GOOGLE_REGISTRATION_MODE',
]
for (const variable of variables) assert.match(matrix, new RegExp(`\\b${variable}\\b`))
assert.doesNotMatch(`${architecture}\n${vercel}\n${render}\n${matrix}`, /gho_[A-Za-z0-9]{20,}|postgresql:\/\/[^\s:*]+:[^*\s]+@|JWT_SECRET=\S+/)

const vercelConfig = JSON.parse(await readFile(resolve(repoRoot, 'frontend/vercel.json'), 'utf8'))
assert.deepEqual(vercelConfig.rewrites, [{ source: '/(.*)', destination: '/index.html' }])
console.log('DEPLOYMENT_ARCHITECTURE_VERIFY=PASS')
