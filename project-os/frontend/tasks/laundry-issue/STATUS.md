# Laundry Issue — STATUS

Status: IMPLEMENTED_PENDING_RUN_EVIDENCE

## Passed

- Prisma migration deploy (previous evidence)
- Prisma generate (previous evidence before schema drift inspection)
- Backend runtime startup
- Frontend production build
- Create Issue
- Bag linkage
- Issue list reload
- Update Issue
- Resolve Issue
- Refresh persistence
- Business audit logging

## Implementation Preflight

- Duplicate-submit protection hardened with a synchronous in-flight mutation guard in `useLaundryIssueController`.
- Create, Update, and Resolve now reject a second mutation before the next React/Zustand render can observe `busy=true`.
- Runtime V8 duplicate-submit evidence is still required; this code review and implementation change is not counted as PASS evidence.
- Duplicate-submit guard commit: `f2fa01c87393f79fd41cb25146f3ba9a2bac657d`
- Laundry Issue relink/unlink/cancel UI implementation is present, but controlled-run evidence is still required.
- Terminal Work UI protection was hardened so an already-open Create/Edit form is no longer rendered after policy changes to deny mutation.
- Existing issues remain readable while Create/Edit/Resolve/Cancel controls follow the Laundry Issue policy boundary.
- Runtime V6 terminal-work evidence and direct API rejection evidence are still required; this preflight is not counted as PASS.
- Terminal UI guard commit: `bc46eb86f74e88706cde0568e7202a4760d86198`
- Cancelled Issue is now terminal at the backend service boundary for both Edit and Resolve.
- Cancelled Issue guard commit: `1640171442866fea8b564879d3a7c047acf7b24a`
- Service-level Laundry Issue verification command added: `npm run verify:laundry-issue`.
- HTTP-level Laundry Issue verification command added: `npm run verify:laundry-issue-http`.
- Issue link schema is aligned with migration: `IssueReport.bagId` and `IssueReport.countLineId`, inverse relations, and indexes are now declared in `backend/prisma/schema.prisma`.
- Schema alignment commit: `b4519394c9e6974a97819b6540694a92bb6b11b1`

## Pending

- Run Prisma format / validate / generate / migrate deploy after schema alignment
- Run `npm run verify:laundry-issue`
- Run `npm run verify:laundry-issue-http`
- Count Line linkage controlled run
- Invalid Bag / Count Line protection run
- Unlink / Relink controlled run
- Cancel Issue controlled run
- Summary synchronization after Create / Resolve / Cancel
- Terminal Work protection controlled run
- Workspace isolation run
- Permission run
- Duplicate-submit run
- Frontend lint

## Resolved Blocker

The previous Prisma schema / migration drift for `IssueReport.bagId` and `IssueReport.countLineId` has been corrected in the schema source of truth.

Migration reference:

`backend/prisma/migrations/20260710_add_issue_links/migration.sql`

Schema reference:

`backend/prisma/schema.prisma`

This is repository-level correction evidence only. Prisma format, validate, generate, and migrate deploy must still be executed and recorded before the gate can pass.

## Environment Blocker

The assistant execution container could not clone the repository because DNS resolution for `github.com` failed. Automated verification commands are therefore `NOT_RUN`, not PASS.

Evidence:

`validation/CONTROLLED-RUN.md`

## Completion Gate

Change status to `COMPLETED` only after:

1. Prisma validation/generation/deploy evidence is re-recorded after schema alignment.
2. Service and HTTP verification commands pass in a runnable checkout.
3. All pending controlled-run evidence is recorded in `validation/`.
4. The final handoff is written.
