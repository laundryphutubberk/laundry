# Environment Matrix

Status: APPROVED

Never commit real values. Vercel `VITE_*` changes require rebuild/redeploy; Render runtime changes require restart/redeploy.

| Variable | Component | Purpose | Required | Preview | Production | Secret | Validation/source | Safe example format |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Frontend | API prefix | Required off-origin | Preview backend `/api` | Production backend `/api` | No | `authApi.ts` and feature APIs | `https://api-preview.example.test/api` |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Google Web client ID | Required for Google UI | Set | Set | No | `googleIdentityClient.ts` | `123…apps.googleusercontent.com` |
| `NODE_ENV` | Backend | Runtime/security mode | Required deployment policy | `production` recommended | `production` | No | Zod env schema | `production` |
| `PORT` | Backend | Listen port | Platform-managed/optional | Render supplied | Render supplied | No | Zod; `index.js` | `10000` |
| `DATABASE_URL` | Backend/Prisma | Runtime and migration DB connection | Required | Development DB | Production DB | Yes | Zod; `prisma.config.ts` | `postgresql://USER:***@HOST:5432/DB` |
| `DIRECT_URL` | Prisma tooling | Optional direct/non-pooler connection | Optional/reserved; not consumed currently | If future workflow requires | If future workflow requires | Yes | Not currently referenced | `postgresql://USER:***@HOST:5432/DB` |
| `JWT_SECRET` | Backend | Access-token signing | Required | Unique Preview secret | Unique Production secret | Yes | Zod min 32 | `<random-32+-characters>` |
| `ENABLE_DEV_ACTOR_HEADER` | Backend | Development actor override | Optional | `false` | `false` | No | Zod env schema | `false` |
| `AUTH_ACCESS_TOKEN_TTL` | Backend | Access-token lifetime | Optional default | Explicit or default | Explicit policy | No | Zod env schema | `15m` |
| `AUTH_SESSION_IDLE_DAYS` | Backend | Device-session idle lifetime | Optional default | Explicit or default | Explicit policy | No | Zod env schema | `14` |
| `AUTH_SESSION_ABSOLUTE_DAYS` | Backend | Absolute session lifetime | Optional default | Explicit or default | Explicit policy | No | Zod env schema | `30` |
| `AUTH_COOKIE_NAME` | Backend | HttpOnly session cookie name | Optional default | Stable Preview name | Stable Production name | No | Zod/controller | `laundry_device_session` |
| `CORS_ORIGINS` | Backend | Exact credentialed origin allowlist | Required cross-origin | Exact Preview frontend origins | Exact Production origins | No | Zod/`app.js` | `https://preview.example.test` |
| `GOOGLE_IDENTITY_ENABLED` | Backend | Enables token verification | Required for Google flows | `true` | Policy-controlled | No | Zod/verifier service | `true` |
| `GOOGLE_CLIENT_ID` | Backend | Expected Google token audience | Required when enabled | Same Web client as frontend | Same Production client policy | No | Zod | `123…apps.googleusercontent.com` |
| `AUTH_GOOGLE_REGISTRATION_MODE` | Backend | Registration availability | Required deployment policy | `PUBLIC_LAUNDRY_ONBOARDING` | `DISABLED` | No | Zod/auth service | enum value |

Preview and Production must use separate secrets and deliberately selected databases. Never copy Preview public-registration policy into Production.
