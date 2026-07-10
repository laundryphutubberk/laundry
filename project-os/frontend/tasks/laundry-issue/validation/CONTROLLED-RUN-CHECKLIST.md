# Laundry Issue Controlled Run Checklist

Status: READY_FOR_EXECUTION
Task Status: IMPLEMENTED_PENDING_RUN_EVIDENCE
Source: `project-os/frontend/execution/fe-08-laundry-issue/FE-08-ISSUE-EXTENDED-VALIDATION.md`

## Purpose

Provide an execution-ready checklist for the remaining Laundry Issue completion gate.

This file records the required run format. It does not claim PASS until real environment evidence is attached.

## Environment Record

```text
Date:
Environment:
Frontend URL:
Backend URL:
Database:
Commit SHA:
Actor accounts used:
```

## Repository-Supported Commands

### Backend

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run verify:runtime
npm run verify:policy
npm run verify:service-policy
npm run verify:http-policy
npm run verify:be07
```

Backend `lint` and `test` scripts are currently `NOT_AVAILABLE` in `backend/package.json`. Do not record them as passed.

### Frontend

```bash
cd frontend
npm install
npm run build
npm run lint
npm run dev
```

## Evidence Format Per Validation

```text
Validation ID:
Date/time:
Actor/workspace:
Work ID:
Bag ID(s):
Count Line ID(s):
Issue ID(s):
Action:
Expected:
Actual:
API status/request reference:
Screenshot/log reference:
Commit SHA:
Result: PASS | FAIL | BLOCKED
Recovery/notes:
```

---

## V1 — Summary Synchronization

- [ ] Record starting active issue count.
- [ ] Create OPEN issue.
- [ ] Confirm issue list refreshes without manual reload.
- [ ] Confirm Laundry Work summary increments by 1.
- [ ] Resolve issue.
- [ ] Confirm issue list and work summary refresh.
- [ ] Confirm active issue count decrements by 1.
- [ ] Record request/response and screenshot evidence.

Result: `PENDING_RUN`

## V2 — Count Line Linkage

- [ ] Use a Work with at least one Bag and Count Line.
- [ ] Select Bag A and a Count Line belonging to Bag A.
- [ ] Create Issue linked to both.
- [ ] Confirm persisted `bagId` and `countLineId`.
- [ ] Refresh and confirm linkage remains.
- [ ] Confirm derived item type/color display when projection provides it.

Result: `PENDING_RUN`

## V3 — Invalid Bag / Count Line Pair Protection

- [ ] Attempt Bag A + Count Line from Bag B by manipulated request/client state.
- [ ] Confirm backend rejects with conflict/safe error.
- [ ] Confirm no inconsistent Issue persists.
- [ ] Confirm no foreign data appears in response.

Result: `PENDING_RUN`

## V4 — Unlink / Relink

- [ ] Create Work-level Issue without Bag/Count Line.
- [ ] Link to Bag A.
- [ ] Link to Count Line under Bag A.
- [ ] Relink to Bag B with valid Count Line under Bag B.
- [ ] Clear both links and return to Work-level Issue.
- [ ] Refresh after each transition.
- [ ] Confirm invalid cross-Bag pair remains blocked.

Result: `PENDING_RUN`

## V5 — Cancel Issue

- [ ] Create OPEN Issue.
- [ ] Change status to CANCELLED.
- [ ] Confirm update succeeds.
- [ ] Confirm Edit/Resolve actions are unavailable afterward.
- [ ] Confirm active issue summary decrements.
- [ ] Refresh and confirm CANCELLED persists.

Result: `PENDING_RUN`

## V6 — Terminal Work Protection

Test Work statuses: `CLOSED`, `CANCELLED`.

- [ ] Confirm existing Issues remain readable in authorized scope.
- [ ] Confirm UI disables/hides mutation actions.
- [ ] Attempt Create through direct API request.
- [ ] Attempt Update through direct API request.
- [ ] Attempt Resolve through direct API request.
- [ ] Confirm backend rejects all mutations independently.

Result: `PENDING_RUN`

## V7 — Workspace and Permission Isolation

Actors:

- Laundry Owner
- Laundry Manager
- Laundry Staff
- Resort user

- [ ] Verify allowed Laundry-role behavior.
- [ ] Attempt access to Work outside actor scope.
- [ ] Attempt Issue mutation from Resort Workspace.
- [ ] Attempt foreign Work/Bag/Count Line linkage.
- [ ] Confirm rejected responses do not expose foreign data.

Result: `PENDING_RUN`

## V8 — Duplicate Submit Protection

- [ ] Double-submit Create during slow/in-flight request.
- [ ] Double-submit Update.
- [ ] Double-submit Resolve.
- [ ] Confirm controls remain disabled while busy.
- [ ] Confirm only one record/transition persists per action.

Result: `PENDING_RUN`

## V9 — Audit Evidence

Capture business logs for:

- [ ] `laundry.issue.created`
- [ ] `laundry.issue.updated`
- [ ] `laundry.issue.resolved`

Confirm available context:

- [ ] actor
- [ ] actor role
- [ ] workspace type
- [ ] issue ID
- [ ] work ID
- [ ] resort ID
- [ ] bag ID
- [ ] count line ID
- [ ] status / issue type

Result: `PARTIALLY_VERIFIED — ADD RUN REFERENCES`

## V10 — Build and Runtime Readiness

### Backend

- [ ] `npm install`
- [ ] `npx prisma migrate deploy`
- [ ] `npx prisma generate`
- [ ] `npm run verify:runtime`
- [ ] `npm run verify:policy`
- [ ] `npm run verify:service-policy`
- [ ] `npm run verify:http-policy`
- [ ] `npm run verify:be07`
- [ ] Backend lint: `NOT_AVAILABLE`
- [ ] Backend test: `NOT_AVAILABLE`

### Frontend

- [ ] `npm install`
- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] Development runtime starts.

Result: `PENDING_RUN`

---

## Completion Decision

Do not mark this Task `COMPLETED` until all applicable validation items above contain real run evidence and PASS results.

After all gates pass:

1. Add evidence files/references under `validation/`.
2. Write final handoff under `handoff/`.
3. Update `tasks/laundry-issue/STATUS.md` to `COMPLETED`.
4. Update `tasks/TASK-INDEX.md` in the same completion patch.
5. Set the next primary Task according to the registry.
