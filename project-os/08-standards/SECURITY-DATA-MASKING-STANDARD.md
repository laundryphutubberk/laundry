# Security and Data Masking Standard

Status: Active
Owner: Security / Chief Architect
Scope: Backend, Frontend, tests, logs, fixtures, and operational tooling

## Purpose

Prevent credentials, tokens, personal data, and sensitive operational details from leaking into logs, UI diagnostics, test output, or persistent client storage.

## Never Log

```text
password
password hash
access token
refresh token
Authorization header
session cookie
API secret
reset token
OTP
raw credential payload
full request body without allowlist
full phone number
private customer/resort notes
provider secrets
```

## Logging Rule

Use allowlisted structured metadata instead of blacklisting arbitrary payload fields.

Allowed examples:

```text
requestId
correlationId
event name
status code
duration
resource id when non-sensitive
workspace type
masked actor id
```

## Masking Examples

```text
phone: ******1234
email: a***@example.com
token: [REDACTED]
authorization: [REDACTED]
```

## Backend Rules

- Do not log complete request, session, actor, Prisma error payload, or provider response objects.
- Mask sensitive values before they reach the logger.
- Production errors must not expose database statements, stack traces, secrets, or internal provider details to clients.
- Audit logs must record actor/action/resource/result without storing secrets.
- Business event logs must use explicit allowlisted fields.

## Frontend Rules

- Do not print tokens, user/session objects, API headers, or sensitive mutation payloads to browser console.
- Do not persist secrets in localStorage unless explicitly approved.
- Error banners must show safe messages and requestId, not raw backend/network payloads.
- Client telemetry must exclude form values unless specifically allowlisted.

## Test and Fixture Rules

- Use synthetic data.
- Never copy production credentials or customer records into fixtures.
- Snapshot output must be reviewed for sensitive fields.

## Verification

Sensitive-data review is mandatory in the Global Pre-Commit Gate when logging, authentication, request handling, errors, telemetry, or customer data are affected.
