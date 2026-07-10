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
- Related commit: `f2fa01c87393f79fd41cb25146f3ba9a2bac657d`
- Laundry Issue relink/unlink/cancel UI implementation is present, but controlled-run evidence is still required.

## Pending

- Resolve verified Prisma schema / migration drift for IssueReport `bagId` and `countLineId`
- Re-run Prisma format / validate / generate / migrate deploy after schema alignment
- Count Line linkage controlled run
- Invalid Bag / Count Line protection run
- Unlink / Relink controlled run
- Cancel Issue controlled run
- Summary synchronization after Create / Resolve / Cancel
- Terminal Work protection
- Workspace isolation run
- Permission run
- Duplicate-submit run
- Frontend lint

## Verified Blocker

`backend/prisma/migrations/20260710_add_issue_links/migration.sql` and the active Laundry Issue runtime support `IssueReport.bagId` / `IssueReport.countLineId`, but `backend/prisma/schema.prisma` does not currently declare those fields and relations.

Evidence:

`validation/SCHEMA-MIGRATION-DRIFT.md`

## Completion Gate

Change status to `COMPLETED` only after:

1. Schema drift is resolved.
2. Prisma validation/generation/deploy evidence is re-recorded.
3. All pending controlled-run evidence is recorded in `validation/`.
4. The final handoff is written.
