# Production Deployment Certification V1

Status: CERTIFIED

## Delivery evidence

| Evidence | Result |
| --- | --- |
| Source branch | `main` |
| Certification commit | `46fbf1bf683dc13ccac45e59b390f1c78fc7f590` |
| Push time | `2026-07-14T08:40:28Z` |
| Production observation | `2026-07-14T08:41:56Z` |
| Push-to-live interval | approximately 88 seconds |
| Trigger | Render Auto-Deploy `On Commit`; no manual deploy or deploy hook used |
| Root/build/start contract | `backend`; `npm install && npx prisma generate`; `npm start` |
| Runtime commit evidence | `/api/health` reported the full certification commit and branch `main` using Render-provided metadata |
| Application health | `ok`, HTTP 200 |
| Database health | `ok` |
| Credentialed CORS | explicit `https://laundry-tech.vercel.app`, credentials `true`, no wildcard |

## Route regression

Authentication and session endpoints returned expected validation/authentication responses rather than 404. Work Queue, Resort, Item Catalog, Issue Center, Reports, and Settings endpoints returned expected unauthenticated 401 responses rather than 404.

Vercel also built the backend-only commit successfully. This is an efficiency observation and does not block backend automation certification.

## Recovery rule

Manual deployment and deploy hooks are recovery-only. A rollback or Dashboard **Deploy a specific commit** action must be followed by restoring Auto-Deploy to **On Commit**. Exact deployed branch and SHA must be reverified through health metadata after recovery.
