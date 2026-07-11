# Classification Save — Runtime Evidence

Date: 2026-07-11
Cell: FE-05 / Laundry Work / Classification
Result: SUCCESS_PATH_VERIFIED

## Human Retest

The operator opened Laundry Work `26`, edited Count Line `19`, changed the classification color to `ดำ`, and clicked Save.

Observed UI result:

- Edit mode closed after the mutation completed.
- The Count Table displayed the refreshed server value `ดำ`.
- The total line count and quantity remained unchanged.
- No Bag linkage or quantity was modified by the classification edit.

## Backend / HTTP Evidence

Business event:

```text
2026-07-11T03:59:18.228Z
laundry.count_line.updated
requestId=9f936127-3664-4d02-9507-c39ed4f98d2a
actorId=14
actorRole=LAUNDRY_STAFF
workspaceType=LAUNDRY
workId=26
bagId=37
countLineId=19
resortId=11
```

Mutation request:

```text
PATCH /api/laundry/count-lines/:lineId
statusCode=200
durationMs=710
requestId=9f936127-3664-4d02-9507-c39ed4f98d2a
```

Server-truth refresh:

```text
GET /api/laundry/works/:workId
statusCode=200
durationMs=264
requestId=ca1cfae6-323b-4e8b-aca5-a756a3cb905b
```

Supporting refresh requests also completed successfully for Item Types, Issues, and Images.

## Root Cause Closed

The frontend controller used the wrong policy gates:

- Create Count Line checked `updateCountLine.allowed`.
- Update Count Line checked `createCountLine.allowed`.

During Classification, update was allowed while create was not. Save therefore returned before API invocation.

Fixed in commit:

```text
9238f5536f9b8afa8231349a92e5d67a3c7c1925
```

## Verified Completion Contract Items

- [x] Save emits one classification mutation request.
- [x] Only classification fields are sent during the tested flow.
- [x] Quantity and Bag linkage remain unchanged.
- [x] Successful mutation refreshes from server truth.
- [x] Human retest confirms the original no-API failure is resolved.

## Remaining Validation Gates

These require separate controlled tests before the Cell can be marked fully completed:

- [ ] Failed mutation keeps the row editable and displays user-safe feedback.
- [ ] Controls remain locked during pending mutation.
- [ ] Rapid duplicate Save produces only one mutation.
- [ ] Frontend lint/build evidence after final hardening.
