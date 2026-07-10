# Laundry Issue — Final Handoff Draft

Status: DRAFT_PENDING_MANUAL_UI_EVIDENCE
Task Status: AUTOMATED_VALIDATION_PASSED

## Feature Scope

Laundry Issue supports explicit operational problem records linked at Work, Bag, or Count Line level while preserving Laundry workspace authority, Resort isolation, terminal-state protection, auditability, and summary synchronization.

## Implemented Backend Capability

- List Issues by Laundry Work.
- Create Work-level Issue.
- Create Issue linked to Laundry Bag.
- Create Issue linked to Laundry Count Line.
- Validate Bag and Count Line belong to the same Work and Resort.
- Reject invalid cross-Bag Count Line linkage.
- Update Issue details.
- Relink or unlink Bag and Count Line.
- Cancel Issue through update status `CANCELLED`.
- Resolve Issue with resolution note.
- Prevent edits to resolved or cancelled Issues.
- Prevent resolving cancelled Issues.
- Prevent Issue mutation on `CLOSED` or `CANCELLED` Laundry Work.
- Synchronize active Issue count after mutations.
- Emit business audit logs for Issue operations.
- Enforce Laundry workspace authorization and Resort isolation.

## Implemented Frontend Capability

- Laundry Issue API boundary with auth/workspace/request metadata.
- Controller-owned query and mutation flow.
- Presentation-only Issue UI.
- Work-level, Bag-level, and Count Line-level Issue creation.
- Count Line options filtered by selected Bag.
- Edit, relink, unlink, cancel, and resolve actions.
- Loading, error, mutation feedback, and refresh behavior.
- Synchronous in-flight guard for duplicate-submit protection.
- Terminal Work policy boundary for mutation controls.

## Automated Evidence

Command:

```bash
cd backend
npm run verify:laundry-issue:all
```

Verified:

- Service contract verification passed.
- HTTP contract verification passed.
- Resort workspace mutation rejected with `403`.
- Terminal Work mutation rejected with `409`.
- Invalid Bag / Count Line pair rejected with `409`.
- Cancelled Issue edit rejected with `409`.
- Cancelled Issue resolve rejected with `409`.
- Count Line derivation and linkage behavior verified at service boundary.
- Unlink and cancel summary synchronization covered by automated service verification.

Evidence:

- `validation/AUTOMATED-RUN-2026-07-10.md`
- `validation/AUTOMATED-VALIDATION.md`
- `validation/PRE-RUN-READINESS.md`

## Schema Alignment

The Prisma schema source of truth declares:

- `IssueReport.bagId`
- `IssueReport.countLineId`
- inverse `issues` relations on `LaundryBag` and `LaundryCountLine`
- required indexes

Migration reference:

- `backend/prisma/migrations/20260710_add_issue_links/migration.sql`

## Remaining Completion Evidence

The following must be attached before this draft becomes the final handoff:

- Prisma format result.
- Prisma validate result.
- Prisma generate result.
- Prisma migrate deploy result after schema alignment.
- Frontend lint result.
- Current frontend production build result.
- Browser evidence for Create and immediate list/summary update.
- Bag and Count Line linkage persistence after refresh.
- UI Count Line filtering by Bag.
- Relink persistence.
- Unlink persistence.
- Cancel persistence and summary synchronization.
- Resolve persistence and summary synchronization.
- Duplicate-submit behavior under an in-flight request.
- Terminal Work UI protection.
- Workspace/permission UI behavior.

Manual run source:

- `validation/MANUAL-UI-RUN.md`

## Completion Conditions

Promote Laundry Issue to `COMPLETED` only when:

1. All repository verification commands pass in the real checkout.
2. Manual UI validation M1–M10 passes with evidence.
3. No Laundry Issue blocker remains.
4. `STATUS.md` is updated to `COMPLETED`.
5. `TASK-INDEX.md` is updated in the same completion patch.
6. This draft is replaced or renamed as the final handoff.

## Next Feature

The expected next Primary Task is `laundry-image`, subject to the current `TASK-INDEX.md` dependency and lifecycle rules.
