# Laundry Issue Controlled Run

Status: READY_TO_EXECUTE
Task Status: IMPLEMENTED_PENDING_RUN_EVIDENCE
Source Checklist: `project-os/frontend/execution/fe-08-laundry-issue/FE-08-ISSUE-EXTENDED-VALIDATION.md`

## Evidence Rule

Record only real environment results. Repository inspection or conversation confirmation is not PASS evidence.

For each validation case record:

- Date / environment
- Actor and workspace
- Work ID
- Bag ID / Count Line ID / Issue ID where applicable
- Action
- Expected result
- Actual result
- HTTP status or UI result
- requestId / log reference / screenshot reference
- Commit SHA
- Result: `PASS` or `FAIL`

---

## Build and Runtime Commands

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

The backend currently has no `lint` or `test` scripts. Record both as `NOT_AVAILABLE`; do not mark them passed.

### Frontend

```bash
cd frontend
npm install
npm run build
npm run lint
```

---

## V1 Summary Synchronization

Status: PENDING_RUN

- Record initial active issue count.
- Create an `OPEN` issue.
- Verify issue list and work summary refresh without manual reload.
- Resolve the issue.
- Verify active count decreases.
- Repeat with `CANCELLED` and verify active count decreases.

Evidence:

```text
Environment:
Work ID:
Issue IDs:
Initial count:
After create:
After resolve:
After cancel:
Request/log references:
Result:
```

## V2 Count Line Linkage

Status: PENDING_RUN

- Create/select a Count Line under Bag A.
- Create an issue linked to Bag A and that Count Line.
- Reload the page.
- Verify `bagId` and `countLineId` persist.

Evidence:

```text
Work ID:
Bag ID:
Count Line ID:
Issue ID:
Create response:
Reload result:
Result:
```

## V3 Invalid Bag / Count Line Pair

Status: PENDING_RUN

- Attempt to link Bag A with a Count Line from Bag B or another Work.
- Verify conflict rejection.
- Verify no inconsistent issue persists.

Evidence:

```text
Work ID:
Bag A ID:
Foreign Bag/Count Line ID:
HTTP status:
Response/requestId:
Database/UI unchanged:
Result:
```

## V4 Unlink / Relink

Status: PENDING_RUN

- Create Work-level issue.
- Link to Bag A.
- Link to Count Line under Bag A.
- Relink to Bag B and a valid Count Line under Bag B.
- Clear both links.
- Reload after each step.

Evidence:

```text
Issue ID:
Transitions tested:
Persistence results:
Invalid transition result:
Result:
```

## V5 Cancel Issue

Status: PENDING_RUN

- Create an `OPEN` issue.
- Change status to `CANCELLED`.
- Verify mutation actions are removed/disabled.
- Verify active issue count decreases.
- Reload and verify persistence.

Evidence:

```text
Issue ID:
Update response:
Action visibility:
Summary count:
Reload result:
Result:
```

## V6 Terminal Work Protection

Status: PENDING_RUN

Test both `CLOSED` and `CANCELLED` works.

- Existing issues remain readable in authorized scope.
- UI blocks Create/Update/Resolve.
- Direct API mutation is rejected.

Evidence:

```text
Closed Work ID:
Cancelled Work ID:
UI result:
API statuses:
Request IDs:
Result:
```

## V7 Workspace and Permission Isolation

Status: PENDING_RUN

Actors:

- Laundry Owner
- Laundry Manager
- Laundry Staff
- Resort user

Verify:

- Authorized laundry roles behave according to policy.
- Resort Workspace cannot mutate laundry issues.
- Foreign Work/Bag/Count Line references are rejected.
- No foreign data appears in response payloads.

Evidence:

```text
Actor results:
Cross-work result:
Cross-resort result:
Resort mutation result:
Response exposure check:
Result:
```

## V8 Duplicate Submit

Status: PENDING_RUN

- Double-submit Create under slow network.
- Repeat for Update and Resolve.
- Verify only one mutation persists each time.

Evidence:

```text
Create persisted count:
Update transition count:
Resolve transition count:
UI busy/disabled result:
Request IDs:
Result:
```

## V9 Business Logs

Status: PARTIALLY_VERIFIED

Capture runtime logs for:

```text
laundry.issue.created
laundry.issue.updated
laundry.issue.resolved
```

Verify actor, role, workspace, issue, work, resort, bag, count line, status/type fields where applicable.

Evidence:

```text
Log references:
Missing fields:
Result:
```

---

## Completion Gate

Do not change the Task to `COMPLETED` until all applicable cases above have real `PASS` evidence, build/runtime commands are recorded, the handoff is written, and `STATUS.md` plus `TASK-INDEX.md` are updated in the same completion patch.
