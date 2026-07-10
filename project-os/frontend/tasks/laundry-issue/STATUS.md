# Laundry Issue — STATUS

Status: AUTOMATED_VALIDATION_PASSED

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
- Service contract verification: `npm run verify:laundry-issue`
- HTTP contract verification: `npm run verify:laundry-issue-http`
- Combined automated verification: `npm run verify:laundry-issue:all`
- Resort Workspace mutation denied with `403 AUTHORIZATION_POLICY_VIOLATION`
- Terminal Laundry Work mutation denied with `409`
- Invalid Bag / Count Line pair denied with `409`
- Cancelled Issue update denied with `409`
- Cancelled Issue resolve denied with `409`

Automated run evidence:

`validation/AUTOMATED-RUN-2026-07-10.md`

## Implementation Preflight

- Duplicate-submit protection hardened with a synchronous in-flight mutation guard in `useLaundryIssueController`.
- Create, Update, and Resolve reject a second mutation before the next React/Zustand render can observe `busy=true`.
- Runtime duplicate-submit evidence is still required; implementation inspection is not counted as browser PASS evidence.
- Duplicate-submit guard commit: `f2fa01c87393f79fd41cb25146f3ba9a2bac657d`
- Laundry Issue relink/unlink/cancel UI implementation is present, but controlled browser-run evidence is still required.
- Terminal Work UI protection prevents an already-open Create/Edit form from remaining available after policy changes deny mutation.
- Existing issues remain readable while Create/Edit/Resolve/Cancel controls follow the Laundry Issue policy boundary.
- Terminal UI guard commit: `bc46eb86f74e88706cde0568e7202a4760d86198`
- Cancelled Issue is terminal at the backend service boundary for both Edit and Resolve.
- Cancelled Issue guard commit: `1640171442866fea8b564879d3a7c047acf7b24a`
- Issue link schema is aligned with migration: `IssueReport.bagId`, `IssueReport.countLineId`, inverse relations, and indexes are declared in `backend/prisma/schema.prisma`.
- Schema alignment commit: `b4519394c9e6974a97819b6540694a92bb6b11b1`

## Pending Manual / Environment Evidence

- Run Prisma format / validate / generate / migrate deploy after schema alignment
- Count Line linkage controlled browser run
- Refresh persistence for linked Issue
- Unlink / Relink controlled browser run
- Cancel Issue controlled browser run
- Summary synchronization after Create / Resolve / Cancel against persisted data
- Terminal Work UI protection controlled run
- Workspace isolation against real persisted data
- Role / permission controlled run
- Duplicate-submit controlled run under an in-flight request
- Frontend lint
- Final handoff

## Resolved Blockers

### Prisma schema / migration drift

The previous drift for `IssueReport.bagId` and `IssueReport.countLineId` has been corrected in the schema source of truth.

Migration reference:

`backend/prisma/migrations/20260710_add_issue_links/migration.sql`

Schema reference:

`backend/prisma/schema.prisma`

Repository alignment is complete. Prisma format, validate, generate, and migrate deploy still require fresh environment evidence.

### HTTP verifier isolation

The HTTP verifier previously reused cached route/service modules across test cases. The verifier now clears the backend source module graph between cases, so each test receives its intended repository mocks.

Verifier isolation commit:

`2c150efd82f06d2f9bc068b110ed33feea070a02`

## Completion Gate

Change status to `COMPLETED` only after:

1. Prisma validation/generation/deploy evidence is re-recorded after schema alignment.
2. Frontend lint passes.
3. Remaining browser/manual controlled-run evidence is recorded in `validation/`.
4. The final handoff is written.
5. `project-os/frontend/tasks/TASK-INDEX.md` is updated in the same completion patch.
