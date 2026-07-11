# Laundry Work — STATUS

Status: COMPLETED_BASELINE

## Verified

- Work creation
- Work list/detail
- Backend-generated work number
- Bag runtime
- Count-line runtime
- Timeline/current task
- Delete Draft / Cancel Work
- Backend startup
- Frontend production build
- Browser runtime

## Regression Record — Classification Save

Observed behavior:

- Count Line entered edit mode.
- Save produced no network request.

Root cause:

- `createCountLine()` checked the update policy gate.
- `updateCountLine()` checked the create policy gate.
- During Classification, update was allowed while create was denied, so update returned before the API boundary.

Fix:

- Create now checks `createCountLine.allowed`.
- Update now checks `updateCountLine.allowed`.
- Existing API path remains `PATCH /api/laundry/count-lines/:lineId`.
- Successful update continues to reload Laundry Work Detail and refresh the projection.

Implementation commit:

- `9238f5536f9b8afa8231349a92e5d67a3c7c1925`

Runtime confirmation is still required on the target environment before treating this regression as fully re-verified.

## Open Only If

- A verified regression is found
- A host contract must change for a downstream Feature Task
- Workspace or permission behavior is proven incorrect

## Next Integration Tasks

- Laundry Issue
- Laundry Work Image
- Resort Inventory
- Packing
- Delivery
