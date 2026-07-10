# Laundry Issue — Manual UI Validation Run

Status: READY_FOR_EXECUTION
Task Status: AUTOMATED_VALIDATION_PASSED

## Purpose

Validate the remaining browser/runtime behavior that automated service and HTTP verification cannot prove.

Do not mark any item PASS without a real browser run, network evidence, and persisted result after refresh.

## Environment Record

```text
Date/time:
Commit SHA:
Frontend URL:
Backend URL:
Database:
Browser:
Actor email:
Actor role:
Workspace type:
Work ID:
```

## Preconditions

- Backend is running on the Vite proxy target.
- Frontend is running.
- Actor is authenticated in `LAUNDRY` workspace.
- Test Work is not `CLOSED` or `CANCELLED`.
- Test Work has at least two Bags.
- Bag A has Count Line A.
- Bag B has Count Line B.
- Browser DevTools Network panel is open with Preserve log enabled.

## Evidence Record Template

```text
Validation ID:
Action:
Expected:
Actual:
HTTP method/path:
HTTP status:
Request ID:
Work ID:
Bag ID:
Count Line ID:
Issue ID:
Screenshot/log reference:
Refresh persistence result:
Result: PASS | FAIL | BLOCKED
Notes:
```

---

## M1 — Create Work-level Issue and Summary Sync

1. Record the active Issue count shown in Laundry Work Detail.
2. Create an Issue without Bag or Count Line linkage.
3. Confirm only one POST request is sent.
4. Confirm HTTP `201`.
5. Confirm the Issue appears without manual reload.
6. Confirm active Issue summary increments by one.
7. Refresh the browser.
8. Confirm the Issue and summary remain correct.

Result: `PENDING_RUN`

## M2 — Bag and Count Line Linkage

1. Create an OPEN Issue.
2. Select Bag A.
3. Select Count Line A belonging to Bag A.
4. Submit.
5. Confirm response contains the persisted `bagId` and `countLineId`.
6. Confirm UI displays the selected Bag and Count Line.
7. Refresh and confirm linkage persists.

Result: `PENDING_RUN`

## M3 — UI Linkage Filtering

1. Select Bag A in the Issue form.
2. Inspect the Count Line selector.
3. Confirm it does not offer Count Line B from Bag B.
4. Switch to Bag B.
5. Confirm the selector now offers only valid Count Lines for Bag B.

Automated HTTP evidence already verifies manipulated cross-Bag requests are rejected with `409`; this manual step verifies the UI prevents an invalid choice.

Result: `PENDING_RUN`

## M4 — Relink Issue

1. Open an existing OPEN Issue linked to Bag A / Count Line A.
2. Edit it to Bag B / Count Line B.
3. Confirm one PATCH request and successful response.
4. Confirm UI updates to the new linkage.
5. Refresh and confirm the new linkage persists.

Result: `PENDING_RUN`

## M5 — Unlink to Work-level Issue

1. Edit the Issue from M4.
2. Clear Count Line and Bag linkage.
3. Save.
4. Confirm response persists `bagId: null` and `countLineId: null`.
5. Confirm Issue remains visible as a Work-level Issue.
6. Refresh and confirm the unlinked state persists.

Result: `PENDING_RUN`

## M6 — Cancel Issue and Summary Sync

1. Record active Issue count.
2. Cancel an OPEN Issue.
3. Confirm status becomes `CANCELLED`.
4. Confirm active Issue count decrements by one.
5. Confirm Edit and Resolve controls are unavailable afterward.
6. Refresh and confirm `CANCELLED` persists.
7. Confirm the cancelled Issue remains visible for history/audit.

Result: `PENDING_RUN`

## M7 — Resolve Issue and Summary Sync

1. Create or select an OPEN Issue.
2. Record active Issue count.
3. Resolve it with a non-empty resolution note.
4. Confirm status becomes `RESOLVED`.
5. Confirm active Issue count decrements by one.
6. Confirm mutation controls are unavailable afterward.
7. Refresh and confirm the resolved state persists.

Result: `PENDING_RUN`

## M8 — Duplicate-submit Protection

Use DevTools Network throttling, such as Slow 3G.

### Create

1. Fill the Create Issue form.
2. Trigger submit repeatedly while the first request is in flight.
3. Confirm the control disables immediately.
4. Confirm only one POST request and one persisted Issue.

### Update

1. Edit an OPEN Issue.
2. Trigger save repeatedly while the first request is in flight.
3. Confirm only one PATCH request and one persisted update.

### Resolve / Cancel

1. Trigger the action repeatedly while the request is in flight.
2. Confirm only one transition request and one resulting transition.

Result: `PENDING_RUN`

## M9 — Terminal Work UI Protection

1. Open a Work with status `CLOSED` or `CANCELLED`.
2. Confirm existing Issues remain readable.
3. Confirm Create, Edit, Resolve, and Cancel controls are hidden or disabled.
4. Record screenshot evidence.

Automated HTTP verification already proves mutation requests are rejected with `409`.

Result: `PENDING_RUN`

## M10 — Workspace and Permission UI Behavior

### Laundry Actor

- Confirm an authorized Laundry actor can use permitted Issue actions.

### Resort Actor

- Login as a Resort workspace actor.
- Confirm Laundry Issue mutation controls are unavailable.
- Confirm no foreign Work, Bag, Count Line, or Issue information is exposed.

Automated HTTP verification already proves Resort mutation is rejected with `403 AUTHORIZATION_POLICY_VIOLATION`.

Result: `PENDING_RUN`

---

## Completion Decision

Manual UI validation passes only when M1–M10 contain real evidence and no unresolved failure remains.

After PASS:

1. Update `STATUS.md`.
2. Complete `handoff/FINAL-HANDOFF.md`.
3. Update `TASK-INDEX.md` in the same completion patch.
4. Promote the next Primary Task according to the registry.
