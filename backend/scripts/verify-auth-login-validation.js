const assert = require('assert/strict');
const { validateLoginInput } = require('../src/validators/auth.validator');
const { errorMiddleware } = require('../src/middlewares/error.middleware');

const basePayload = {
  email: 'operator@example.com',
  password: 'not-a-real-password',
};

const parse = (overrides = {}) => validateLoginInput({ ...basePayload, ...overrides });

const assertValidationFailure = (deviceLabel) => {
  assert.throws(
    () => parse({ deviceLabel }),
    (error) => error.name === 'ZodError' && error.issues.some((issue) => issue.path[0] === 'deviceLabel'),
  );
};

const captureErrorResponse = (error) => {
  const req = { method: 'POST', originalUrl: '/api/auth/login' };
  const response = {};
  const errorLogs = [];
  const res = {
    status(statusCode) {
      response.statusCode = statusCode;
      return this;
    },
    json(body) {
      response.body = body;
      return this;
    },
  };

  const originalConsoleError = console.error;
  console.error = (line) => errorLogs.push(String(line));
  try {
    errorMiddleware(error, req, res, () => {});
  } finally {
    console.error = originalConsoleError;
  }

  return { ...response, errorLogs };
};

assert.equal(parse({ rememberDevice: true }).rememberDevice, true);
assert.equal(parse({ rememberDevice: false }).rememberDevice, false);
assert.equal(parse().rememberDevice, false);

assert.equal(parse({ deviceLabel: 'Desktop Chrome' }).deviceLabel, 'Desktop Chrome');
assert.equal(parse({ deviceLabel: '   ' }).deviceLabel, undefined);
assert.equal(parse({ deviceLabel: '' }).deviceLabel, undefined);
assert.equal(parse().deviceLabel, undefined);

const mobileWebViewLabel = [
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro Build/UQ1A.240205.004; wv)',
  'AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0',
  'Chrome/121.0.6167.164 Mobile Safari/537.36 LaundryApp/1.0',
].join(' ');
const normalizedMobileLabel = parse({ rememberDevice: true, deviceLabel: mobileWebViewLabel }).deviceLabel;
assert.equal(normalizedMobileLabel, mobileWebViewLabel.slice(0, 120));
assert.equal(normalizedMobileLabel.length, 120);

assertValidationFailure(null);
assertValidationFailure(42);
assertValidationFailure({ userAgent: 'mobile' });

for (const invalidLabel of [null, 42, { userAgent: 'mobile' }]) {
  let validationError;
  try {
    parse({ deviceLabel: invalidLabel });
  } catch (error) {
    validationError = error;
  }

  const response = captureErrorResponse(validationError);
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.message, 'Invalid request payload');
  assert.equal(response.body.meta.code, 'VALIDATION_ERROR');

  const serialized = JSON.stringify(response);
  assert.equal(serialized.includes(basePayload.email), false);
  assert.equal(serialized.includes(basePayload.password), false);
  assert.equal(serialized.includes('mobile'), false);
}

console.log('AUTH_LOGIN_VALIDATION_VERIFY PASS');
