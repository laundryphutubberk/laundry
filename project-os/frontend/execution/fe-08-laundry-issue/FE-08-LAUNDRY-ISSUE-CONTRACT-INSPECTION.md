# FE-08 Laundry Issue — Backend Contract Inspection

Status: BLOCKED_BY_BACKEND_CONTRACT
Feature Domain: Laundry Workspace
Mission: Laundry Issue Flow
Phase: 1 — Backend Contract Inspection

## Objective

Verify whether the backend contracts required by FE-08 Laundry Issue already exist and are safe to consume before frontend runtime wiring begins.

Required contracts:

```text
GET   /api/laundry/works/:workId/issues
POST  /api/laundry/works/:workId/issues
PATCH /api/laundry/issues/:issueId
PATCH /api/laundry/issues/:issueId/resolve
```

## Evidence Inspected

- `backend/src/routes/laundryWorks.routes.js`
- `backend/prisma/schema.prisma`
- `frontend/src/features/laundry-works/api/laundryWorkApi.ts`
- `frontend/src/features/laundry-works/controllers/useLaundryWorkController.ts`
- `frontend/src/features/laundry-works/components/IssuePanel.tsx`
- `frontend/src/features/laundry-works/pages/LaundryWorkDetailPage.tsx`

## Backend Route Result

Current Laundry Work routes expose:

```text
GET    /api/laundry/works
GET    /api/laundry/works/:workId
POST   /api/laundry/works
PATCH  /api/laundry/works/:workId/status
DELETE /api/laundry/works/:workId
```

No dedicated Laundry Issue list, create, update, or resolve route is currently present in the inspected route file.

## Schema Result

The database schema already contains:

- `IssueType`
  - `DAMAGED`
  - `MISSING`
  - `COUNT_MISMATCH`
  - `RETURN_MISMATCH`
  - `OTHER`
- `IssueStatus`
  - `OPEN`
  - `REVIEWING`
  - `RESOLVED`
  - `CANCELLED`
- `IssueReport`
  - `workId`
  - `resortId`
  - `itemTypeId?`
  - `colorGroup?`
  - `issueType`
  - `quantity`
  - `description?`
  - `status`
  - `reportedById?`
  - `reportedAt`
  - `resolvedAt?`

## Contract Gap

The FE-08 handoff expects issue links at Work / Bag / Count Line level.

The current `IssueReport` schema has:

- `workId`
- optional `itemTypeId`
- optional `colorGroup`

The inspected schema does not currently expose:

- `bagId`
- `countLineId`

Therefore the requested minimum issue model from the handoff is not fully supported by the current schema.

## Existing Frontend Readiness

The frontend already has partial presentation and runtime placeholders:

- Work detail projection carries `issues` from the Laundry Work detail response.
- `IssuePanel` can render issue rows and loading/error/empty states.
- Laundry Work controller exposes a placeholder `createIssue` action.
- The component does not call API or Store directly.

This preserves the required frontend boundary:

```text
UI
↓
Controller
↓
Projection
↓
Store
↓
API
↓
Backend
```

## Frontend Capability Evidence

`laundryWorkApi.ts` currently declares:

```text
issue.list    = false
issue.create  = false
issue.resolve = false
```

No issue mutation API methods are currently implemented.

## Decision

Do not implement FE-08 Laundry Issue runtime or UI mutation wiring yet.

Backend-first contract establishment is required before frontend implementation.

## Required Backend Decisions

Before FE-08 proceeds, confirm:

1. Whether an Issue may link to:
   - Work only
   - Work + Bag
   - Work + Count Line
2. Whether `bagId` and `countLineId` must be added to `IssueReport`.
3. Exact create/update/resolve request bodies.
4. Exact response DTO shape.
5. Permission rules for Owner, Manager, Staff, and Resort users.
6. Workspace/resort scoping rules.
7. Whether resolving an issue creates:
   - status/audit log
   - business log
   - inventory movement
8. Whether issue quantity updates `LaundryWork.issueCount` or Count Line `issueQuantity` transactionally.

## Required Backend Contract

Recommended contract surface:

```text
GET   /api/laundry/works/:workId/issues
POST  /api/laundry/works/:workId/issues
PATCH /api/laundry/issues/:issueId
PATCH /api/laundry/issues/:issueId/resolve
```

Minimum create payload candidate:

```json
{
  "bagId": null,
  "countLineId": null,
  "itemTypeId": null,
  "colorGroup": null,
  "issueType": "DAMAGED",
  "quantity": 1,
  "description": ""
}
```

This payload is a contract candidate only and must not be treated as implemented until backend approval and implementation are complete.

## Blocker

FE-08 Laundry Issue is blocked because:

- Dedicated issue endpoints are not present.
- Frontend capability is explicitly disabled.
- Bag/Count Line issue linkage is not fully represented in the inspected schema.

## Next Safe Step

Backend should establish and verify the Issue contract first.

After backend completion, FE-08 may proceed in this order:

1. `laundryIssueApi`
2. Issue DTO normalization / Projection
3. Issue Policy
4. Issue Store if durable shared state is required
5. Controller orchestration
6. Issue Entry Panel
7. Issue List and Summary
8. Runtime / Workspace / Refresh / Regression verification
