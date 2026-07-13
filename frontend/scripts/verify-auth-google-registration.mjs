import fs from 'node:fs'
import assert from 'node:assert/strict'

const api = fs.readFileSync(new URL('../src/features/auth/authApi.ts', import.meta.url), 'utf8')
const page = fs.readFileSync(new URL('../src/features/auth/RegisterPage.tsx', import.meta.url), 'utf8')

assert.match(api, /submitAuth\('\/auth\/google\/register'/)
assert.match(page, /googleRegisterInFlightRef/)
assert.match(page, /requestGoogleIdentityCredential\(\)/)
assert.match(page, /deviceLabel: navigator\.userAgent/)
assert.match(page, /getAuthenticatedDestination\(session\)/)
assert.match(page, /GOOGLE_REGISTRATION_EMAIL_CONFLICT/)
assert.doesNotMatch(page, /localStorage|sessionStorage/)
console.log('FRONTEND_AUTH_GOOGLE_REGISTRATION_VERIFY=PASS')
