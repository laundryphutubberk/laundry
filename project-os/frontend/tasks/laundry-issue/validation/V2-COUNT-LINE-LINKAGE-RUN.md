# Laundry Issue V2 — Count Line Linkage Run Sheet

Status: READY_FOR_EXECUTION
Task: `project-os/frontend/tasks/laundry-issue/`
Validation Gate: V2 — Count Line Linkage

## Purpose

Validate in a real runtime that a Laundry Issue can be linked to both a Laundry Bag and a Laundry Count Line, that the linkage persists after refresh, and that invalid cross-bag linkage is rejected by the backend.

This document is an execution sheet only. Do not mark PASS until real request, response, database/UI, and refresh evidence is recorded.

## Preconditions

- Backend is running.
- Frontend is running.
- A valid `LAUNDRY_OWNER`, `LAUNDRY_MANAGER`, or `LAUNDRY_STAFF` session exists.
- A Laundry Work exists and is not `CLOSED` or `CANCELLED`.
- The Work contains at least two Bags.
- Bag A contains at least one Count Line.
- Bag B contains at least one different Count Line.

Record:

```text
Date/time:
Commit SHA:
Frontend URL:
Backend URL:
Actor email:
Actor role:
Workspace type:
Work ID:
Bag A ID:
Bag B ID:
Count Line A ID:
Count Line B ID:
```

## Runtime Preparation

### 1. Confirm Work Detail

```http
GET /api/laundry/works/:workId
Authorization: Bearer <token>
```

Expected:

- `200`
- Work is visible to the actor.
- Response contains Bag A and Bag B.
- Response contains Count Line A linked to Bag A.
- Response contains Count Line B linked to Bag B.

Evidence:

```text
Request ID:
Response status:
Screenshot/log reference:
Result: PASS | FAIL | BLOCKED
```

## V2-A — Valid Count Line Linkage

### 2. Create Issue linked to Bag A and Count Line A

```http
POST /api/laundry/works/:workId/issues
Authorization: Bearer <token>
Content-Type: application/json
X-Request-Id: <unique-request-id>

{
  "bagId": <bagAId>,
  "countLineId": <countLineAId>,
  "issueType": "COUNT_MISMATCH",
  "quantity": 1,
  "description": "V2 valid Count Line linkage validation"
}
```

Expected:

- `201`
- Response contains the created Issue.
- Persisted `bagId` equals Bag A.
- Persisted `countLineId` equals Count Line A.
- Derived item type and color follow Count Line A when the projection exposes them.
- Work active issue summary increments by 1.

Record:

```text
Issue ID:
Request ID:
Response status:
Persisted bagId:
Persisted countLineId:
Derived item type:
Derived color:
Starting active issue count:
New active issue count:
Screenshot/log reference:
Result: PASS | FAIL | BLOCKED
```

### 3. Refresh Persistence

Actions:

1. Refresh the browser.
2. Reopen the same Laundry Work.
3. Reload the Issue list.

Expected:

- Issue remains present.
- Bag A linkage remains present.
- Count Line A linkage remains present.
- No duplicate Issue was created.

Record:

```text
Issue ID after refresh:
Bag ID after refresh:
Count Line ID after refresh:
Issue count after refresh:
Screenshot/log reference:
Result: PASS | FAIL | BLOCKED
```

## V2-B — Invalid Cross-Bag Pair Protection

### 4. Attempt Bag A + Count Line B

Use direct API manipulation so the frontend cannot silently normalize the invalid pair.

```http
POST /api/laundry/works/:workId/issues
Authorization: Bearer <token>
Content-Type: application/json
X-Request-Id: <unique-request-id>

{
  "bagId": <bagAId>,
  "countLineId": <countLineBId>,
  "issueType": "COUNT_MISMATCH",
  "quantity": 1,
  "description": "V2 invalid cross-bag linkage validation"
}
```

Expected:

- Backend rejects the request.
- Expected status: `409`.
- Error message safely indicates that the Count Line does not belong to the selected Bag.
- No Issue persists from the rejected request.
- Response does not expose foreign Work, Bag, Resort, or Count Line data.

Record:

```text
Request ID:
Response status:
Error code:
Error message:
Issue count before request:
Issue count after request:
Screenshot/log reference:
Result: PASS | FAIL | BLOCKED
```

## V2-C — Relink and Unlink Preparation

This section prepares evidence for V4 without marking V4 complete.

### 5. Relink valid Issue to Bag B + Count Line B

```http
PATCH /api/laundry/issues/:issueId
Authorization: Bearer <token>
Content-Type: application/json
X-Request-Id: <unique-request-id>

{
  "bagId": <bagBId>,
  "countLineId": <countLineBId>
}
```

Expected:

- `200`
- Issue now points to Bag B and Count Line B.
- Derived item type/color update according to Count Line B when exposed.
- Refresh preserves the new links.

### 6. Unlink to Work-level Issue

```http
PATCH /api/laundry/issues/:issueId
Authorization: Bearer <token>
Content-Type: application/json
X-Request-Id: <unique-request-id>

{
  "bagId": null,
  "countLineId": null
}
```

Expected:

- `200`
- Issue remains attached to the Work.
- `bagId` becomes `null`.
- `countLineId` becomes `null`.
- Refresh preserves the Work-level linkage.

Record V2-C separately and transfer the evidence into V4 when the full unlink/relink gate is executed.

## Business Log Evidence

Capture relevant backend logs:

- `laundry.issue.created`
- `laundry.issue.updated`

Expected context where applicable:

- actor ID
- actor role
- workspace type
- issue ID
- work ID
- resort ID
- bag ID
- count line ID
- issue type/status
- request or correlation reference

## Completion Record

```text
Validation ID: V2
Date/time:
Actor/workspace:
Work ID:
Bag IDs:
Count Line IDs:
Issue ID:
Valid linkage result:
Refresh persistence result:
Invalid cross-bag result:
API/request references:
Screenshot/log references:
Commit SHA:
Overall Result: PASS | FAIL | BLOCKED
Recovery/notes:
```

## Completion Rule

V2 may be marked PASS only when:

- Valid Bag + Count Line linkage persists.
- Refresh preserves the linkage.
- Invalid cross-bag linkage is rejected independently by the backend.
- No inconsistent Issue persists.
- Required request, response, UI/database, and business-log evidence is recorded.

After the run, store the completed record under this validation folder and update `CONTROLLED-RUN-CHECKLIST.md` only with evidence-backed results.
