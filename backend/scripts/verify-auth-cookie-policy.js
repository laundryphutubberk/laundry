const assert = require('assert/strict');

const { cookieOptions } = require('../src/controllers/auth.controller');
const { env } = require('../src/config/env');

const options = cookieOptions();

assert.equal(options.httpOnly, true);
assert.equal(options.path, '/api/auth');
assert.equal(options.secure, env.NODE_ENV === 'production');
assert.equal(options.sameSite, env.NODE_ENV === 'production' ? 'none' : 'lax');

if (env.NODE_ENV === 'production') {
  assert.equal(options.secure, true, 'SameSite=None must retain Secure');
}

console.log(`AUTH_COOKIE_POLICY_VERIFY=PASS NODE_ENV=${env.NODE_ENV}`);
