import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const files = await Promise.all([
  'src/features/auth/identityLinkingApi.ts',
  'src/features/auth/useIdentityLinkingController.ts',
  'src/features/auth/IdentityManagementPage.tsx',
  'src/features/auth/googleIdentityClient.ts',
].map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')))
const [api, controller, page, google] = files

assert.match(api, /\/auth\/identities\/google\/link-intents/)
assert.match(api, /\/auth\/step-up\/password/)
assert.match(api, /\/auth\/identities\/unlink-intents/)
assert.match(controller, /link-confirm/)
assert.match(controller, /link-password/)
assert.match(controller, /unlink-confirm/)
assert.match(controller, /unlink-password/)
assert.match(controller, /lock\.current/)
assert.match(controller, /refresh\(\)/)
assert.match(page, /type="password"/)
assert.match(page, /ยืนยันเชื่อมบัญชี Google/)
assert.match(google, /VITE_GOOGLE_CLIENT_ID/)

for (const source of files) {
  assert.doesNotMatch(source, /localStorage|sessionStorage/)
  assert.doesNotMatch(source, /providerSubject|secretHash/)
}

console.log('AUTH_GOOGLE_LINKING_UX_VERIFY=PASS')
