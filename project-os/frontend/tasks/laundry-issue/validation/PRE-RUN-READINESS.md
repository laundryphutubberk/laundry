# Laundry Issue Pre-Run Readiness

Status: READY_FOR_CONTROLLED_RUN
Task Status: IMPLEMENTED_PENDING_RUN_EVIDENCE

## Purpose

Record code-level readiness for the remaining Laundry Issue validation gates without claiming runtime PASS.

This document is inspection evidence only. Real environment execution is still required.

## Inspected Boundaries

- `frontend/src/features/laundry-works/runtime/LaundryIssueRuntimePanel.tsx`
- `frontend/src/features/laundry-works/controllers/useLaundryIssueController.ts`
- `frontend/src/features/laundry-works/api/laundryIssueApi.ts`
- `backend/src/services/laundryIssues.service.js`
- `backend/src/validators/laundryIssues.validator.js`
- `backend/src/routes/index.js`

## V2 — Count Line Linkage Readiness

Code inspection confirms:

- Create form sends optional `bagId` and `countLineId`.
- Count Line choices are filtered by selected Bag.
- Selecting a Count Line synchronizes the related Bag when `bagId` exists.
- API boundary sends linkage through `POST /api/laundry/works/:workId/issues`.
- Backend verifies Count Line belongs to the same Work and Resort.
- Backend verifies the selected Count Line belongs to the selected Bag.
- Backend persists both linkage IDs.

Readiness: `READY_FOR_RUN`
Runtime result: `PENDING_RUN`

## V3 — Invalid Pair Protection Readiness

Code inspection confirms backend rejects:

- Bag outside the target Work.
- Count Line outside the target Work.
- Count Line outside the target Resort.
- Bag and Count Line that do not belong together.

Expected backend result: safe conflict response with no Issue persistence.

Readiness: `READY_FOR_RUN`
Runtime result: `PENDING_RUN`

## V4 — Unlink / Relink Readiness

Code inspection confirms:

- Existing Issue linkage is loaded into the edit form.
- Edit form permits choosing another Bag and Count Line.
- Clearing Bag clears the Count Line selection in the UI.
- Update payload supports `bagId: null` and `countLineId: null`.
- Backend update contract preserves omitted fields and clears explicit null fields.

Readiness: `READY_FOR_RUN`
Runtime result: `PENDING_RUN`

## V5 — Cancel Issue Readiness

Code inspection confirms:

- UI exposes a Cancel action only for mutable issues.
- Cancel uses the existing update endpoint with `{ status: "CANCELLED" }`.
- Validator permits `CANCELLED` on update.
- Cancelled and resolved issues no longer expose edit/resolve/cancel actions.
- Work active issue summary is recalculated after mutation.

Readiness: `READY_FOR_RUN`
Runtime result: `PENDING_RUN`

## V6 — Terminal Work Protection Readiness

Code inspection confirms:

- FE policy disables Issue mutation for `CLOSED` and `CANCELLED` Laundry Work.
- Backend independently rejects mutation on terminal Work through `assertWorkExists`.
- Existing Issue list remains a separate read path for authorized scope.

Readiness: `READY_FOR_RUN`
Runtime result: `PENDING_RUN`

## V7 — Workspace / Permission Readiness

Code inspection confirms:

- FE request metadata includes auth token, workspace type, resort ID, actor ID, role, request ID, feature, and action.
- Backend uses authenticated actor policy.
- Backend list/create/update/resolve paths use workspace-scoped lookup.
- Foreign Work, Bag, and Count Line relationships are not accepted.

Readiness: `READY_FOR_RUN`
Runtime result: `PENDING_RUN`

## V8 — Duplicate Submit Readiness

Code inspection confirms two guards:

1. UI controls are disabled while `runtime.busy` is true.
2. Controller uses `mutationInFlightRef` to synchronously reject a second mutation before React state propagation.

The guard applies to Create, Update/Cancel, and Resolve.

Readiness: `READY_FOR_RUN`
Runtime result: `PENDING_RUN`

## API Contract Verified

```text
GET   /api/laundry/works/:workId/issues
POST  /api/laundry/works/:workId/issues
PATCH /api/laundry/issues/:issueId
PATCH /api/laundry/issues/:issueId/resolve
```

## Remaining Work

- Run V1–V10 against a real backend/database environment.
- Capture request IDs, status codes, screenshots, and business logs.
- Record PASS/FAIL/BLOCKED in the validation artifacts.
- Do not change Task status to `COMPLETED` before all required runtime evidence exists.
