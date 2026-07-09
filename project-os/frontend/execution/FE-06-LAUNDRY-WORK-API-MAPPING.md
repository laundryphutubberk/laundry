# FE-06 — Laundry Work API Mapping

Status: BASELINE
Execution Domain: FE-06 Integration
Document Type: API Mapping Standard
Primary Feature Domain: Laundry Work
Handoff Target: API Integration Team / FE-07 Quality

---

## 1. Purpose

This document maps the frontend integration contract for Laundry Work and closely related features.

It is intended to let the API integration team start implementing frontend client modules without inventing request shape, response envelope, error handling, request metadata, validation mapping, or workspace behavior.

This document is architecture/mapping only. It does not implement API calls.

---

## 2. Source Inputs

The mapping follows:

- FE-06 Frontend Backend Integration Standard
- Business Blueprint production flow
- `schema.prisma` domain model
- Workspace isolation rule
- FE-03 Runtime actor/workspace context
- FE-05 State server-state boundary

Backend endpoints listed here are contract-facing endpoint targets. If actual backend route paths differ, API integration must align this mapping with the backend contract before implementation.

---

## 3. Domain Coverage

Laundry Work integration covers these related backend domain objects:

- `LaundryWork`
- `LaundryBag`
- `LaundryCountLine`
- `LinenMovement`
- `LinenInventorySummary`
- `IssueReport`
- `WorkStatusLog`
- `WashLoadPlan`

---

## 4. Shared Response Envelope

All mapped APIs must normalize responses before reaching feature UI.

### Success

```ts
type ApiSuccess<T> = {
  ok: true
  data: T
  meta: {
    requestId: string
    receivedAt: string
    source: 'backend' | 'client-normalized'
  }
}
```

### Failure

```ts
type ApiFailure = {
  ok: false
  error: {
    code: string
    message: string
    status?: number
    fieldErrors?: Record<string, string[]>
    requestId?: string
    retryable?: boolean
  }
  meta: {
    requestId: string
    receivedAt: string
    source: 'backend' | 'client-normalized'
  }
}
```

---

## 5. Request Metadata Standard

Every request must include metadata generated at the API client boundary.

```ts
type LaundryWorkRequestMeta = {
  requestId: string
  feature: 'laundry-work' | 'laundry-bag' | 'laundry-count-line' | 'linen-inventory' | 'issue-report' | 'wash-load'
  action: string
  actorId?: number | string
  actorRole?: string
  workspaceType: 'LAUNDRY' | 'RESORT'
  resortId?: number
  createdAt: string
}
```

### Rules

- `requestId` is required for every request.
- `workspaceType` is required for every workspace-aware request.
- `resortId` is required when `workspaceType = RESORT`.
- Resort Workspace must use `resortId` from runtime actor context, not route params.
- Laundry Workspace may pass `resortId` only as an explicit filter when the backend contract allows it.

---

## 6. Workspace-Aware Request Policy

```ts
type WorkspacePolicy =
  | { scope: 'LAUNDRY' }
  | { scope: 'RESORT'; resortId: number }
```

### Rules

- Laundry Workspace can access laundry-owned operational views.
- Resort Workspace can access only its own `resortId`.
- Any request for work detail, bag, count line, issue, movement, or inventory must be workspace-aware.
- Client must block dispatch if Resort Workspace has no authenticated `resortId`.
- Client must not allow UI filters to override authenticated Resort Workspace scope.

---

## 7. Error Handling Mapping

| HTTP / Backend Case | Normalized Code | Retryable | UI Rule |
|---|---|---:|---|
| Network failure / timeout | `NETWORK_ERROR` | true | Show retry for safe reads |
| 401 | `UNAUTHORIZED` | false | Hand off to auth/session flow |
| 403 | `FORBIDDEN` | false | Show workspace/access boundary message |
| 404 | `NOT_FOUND` | false | Show not-found or empty state |
| 409 | `CONFLICT` | false | Ask user to refresh latest state |
| 422 / validation contract | `VALIDATION_ERROR` | false | Map to field/form errors |
| 5xx | `SERVER_ERROR` | true for safe reads | Show safe generic error with requestId |
| Unknown | `UNKNOWN_ERROR` | false | Show safe generic error with requestId |

---

## 8. Validation Error Mapping

Backend validation errors must normalize into:

```ts
type FormErrorState = {
  fieldErrors: Record<string, string[]>
  formErrors: string[]
}
```

### Standard Field Mapping

| Backend Field | UI Field | Applies To |
|---|---|---|
| `resortId` | `resortId` | Laundry Work create/filter |
| `bagCount` | `bagCount` | Laundry Work create/update |
| `receivedDate` | `receivedDate` | Laundry Work receive |
| `bagNo` | `bagNo` | Laundry Bag create/open |
| `status` / `currentStatus` | `status` | Work/Bag status transitions |
| `bagId` | `bagId` | Count Line creation |
| `itemTypeId` | `itemTypeId` | Count Line / Issue / Inventory |
| `colorGroup` | `colorGroup` | Count Line / Issue / Inventory |
| `quantity` | `quantity` | Count Line / Movement / Issue |
| `issueQuantity` | `issueQuantity` | Count Line issue quantity |
| `issueType` | `issueType` | Issue Report |
| `description` | `description` | Issue Report |
| `machineId` | `machineId` | Wash Load Plan |
| `loadRuleId` | `loadRuleId` | Wash Load Plan |
| `estimatedPieceCount` | `estimatedPieceCount` | Wash Load Plan |
| `totalWeightKg` | `totalWeightKg` | Wash Load Plan |
| `note` | `note` | Work/Bag/Issue/Wash Load |

Unknown backend fields must be placed in `formErrors` and must not be discarded.

---

## 9. API Endpoint Mapping

> Endpoint paths are frontend contract targets. Backend contract is authoritative if paths differ.

### 9.1 Laundry Work

| Client Function | Method | Endpoint Target | Workspace | Request | Response Data | Notes |
|---|---|---|---|---|---|---|
| `listLaundryWorks` | GET | `/api/laundry/works` | LAUNDRY / RESORT | query: `status?`, `resortId?`, `dateFrom?`, `dateTo?`, `page?`, `limit?` | `LaundryWorkListResult` | Resort scope must force runtime `resortId` |
| `getLaundryWorkDetail` | GET | `/api/laundry/works/:workId` | LAUNDRY / RESORT | path: `workId` | `LaundryWorkDetail` | Must include bags, count lines, issues when backend supports include |
| `createLaundryWork` | POST | `/api/laundry/works` | LAUNDRY | body: `CreateLaundryWorkInput` | `LaundryWork` | Creates operational work record |
| `updateLaundryWork` | PATCH | `/api/laundry/works/:workId` | LAUNDRY | body: `UpdateLaundryWorkInput` | `LaundryWork` | No status transition unless contract allows |
| `receiveLaundryWork` | POST | `/api/laundry/works/:workId/receive` | LAUNDRY | body: `ReceiveLaundryWorkInput` | `LaundryWork` | Moves work toward received state |
| `returnLaundryWork` | POST | `/api/laundry/works/:workId/return` | LAUNDRY | body: `ReturnLaundryWorkInput` | `LaundryWork` | Return-to-resort action |
| `closeLaundryWork` | POST | `/api/laundry/works/:workId/close` | LAUNDRY | body: `CloseLaundryWorkInput` | `LaundryWork` | Finalize work |
| `cancelLaundryWork` | POST | `/api/laundry/works/:workId/cancel` | LAUNDRY | body: `CancelLaundryWorkInput` | `LaundryWork` | Must preserve audit/status log |

### 9.2 Laundry Bag

| Client Function | Method | Endpoint Target | Workspace | Request | Response Data | Notes |
|---|---|---|---|---|---|---|
| `listLaundryBags` | GET | `/api/laundry/works/:workId/bags` | LAUNDRY / RESORT | path: `workId` | `LaundryBag[]` | Resort scope must validate work belongs to resort |
| `createLaundryBag` | POST | `/api/laundry/works/:workId/bags` | LAUNDRY | body: `CreateLaundryBagInput` | `LaundryBag` | Bag is intake unit, not inventory unit |
| `openLaundryBag` | POST | `/api/laundry/bags/:bagId/open` | LAUNDRY | body: `OpenLaundryBagInput` | `LaundryBag` | Moves bag status to opened |
| `closeLaundryBag` | POST | `/api/laundry/bags/:bagId/close` | LAUNDRY | body: `CloseLaundryBagInput` | `LaundryBag` | Bag close after count completion |

### 9.3 Laundry Count Line

| Client Function | Method | Endpoint Target | Workspace | Request | Response Data | Notes |
|---|---|---|---|---|---|---|
| `listLaundryCountLines` | GET | `/api/laundry/works/:workId/count-lines` | LAUNDRY / RESORT | path: `workId` | `LaundryCountLine[]` | Count lines are real item count captured at laundry |
| `recordLaundryCountLines` | POST | `/api/laundry/works/:workId/count-lines` | LAUNDRY | body: `RecordLaundryCountLinesInput` | `LaundryCountLine[]` | Primary capture point for item quantities |
| `updateLaundryCountLine` | PATCH | `/api/laundry/count-lines/:lineId` | LAUNDRY | body: `UpdateLaundryCountLineInput` | `LaundryCountLine` | Must respect backend validation |
| `deleteLaundryCountLine` | DELETE | `/api/laundry/count-lines/:lineId` | LAUNDRY | path: `lineId` | `{ deleted: true }` | Only if backend contract allows deletion |

### 9.4 Issue Report

| Client Function | Method | Endpoint Target | Workspace | Request | Response Data | Notes |
|---|---|---|---|---|---|---|
| `listLaundryIssues` | GET | `/api/laundry/issues` | LAUNDRY / RESORT | query: `workId?`, `resortId?`, `status?`, `issueType?` | `IssueReport[]` | Resort scope must force runtime `resortId` |
| `reportLaundryIssue` | POST | `/api/laundry/works/:workId/issues` | LAUNDRY / RESORT | body: `ReportLaundryIssueInput` | `IssueReport` | Actor context required |
| `resolveLaundryIssue` | POST | `/api/laundry/issues/:issueId/resolve` | LAUNDRY | body: `ResolveLaundryIssueInput` | `IssueReport` | Updates issue status |
| `cancelLaundryIssue` | POST | `/api/laundry/issues/:issueId/cancel` | LAUNDRY | body: `CancelLaundryIssueInput` | `IssueReport` | Cancel issue report if contract allows |

### 9.5 Linen Inventory / Movement

| Client Function | Method | Endpoint Target | Workspace | Request | Response Data | Notes |
|---|---|---|---|---|---|---|
| `listResortInventorySummary` | GET | `/api/laundry/inventory` | LAUNDRY / RESORT | query: `resortId?`, `itemTypeId?`, `colorGroup?` | `LinenInventorySummary[]` | Inventory is derived from movement/work history |
| `listLinenMovements` | GET | `/api/laundry/movements` | LAUNDRY / RESORT | query: `workId?`, `resortId?`, `itemTypeId?`, `movementType?` | `LinenMovement[]` | Resort scope must force runtime `resortId` |

### 9.6 Work Status Log

| Client Function | Method | Endpoint Target | Workspace | Request | Response Data | Notes |
|---|---|---|---|---|---|---|
| `listWorkStatusLogs` | GET | `/api/laundry/works/:workId/status-logs` | LAUNDRY / RESORT | path: `workId` | `WorkStatusLog[]` | Read-only operational audit trail |

### 9.7 Wash Load Planning

| Client Function | Method | Endpoint Target | Workspace | Request | Response Data | Notes |
|---|---|---|---|---|---|---|
| `listWashLoadPlans` | GET | `/api/laundry/works/:workId/wash-loads` | LAUNDRY | path: `workId` | `WashLoadPlan[]` | Laundry internal planning only |
| `planWashLoad` | POST | `/api/laundry/works/:workId/wash-loads` | LAUNDRY | body: `PlanWashLoadInput` | `WashLoadPlan` | Uses owner-defined machine load standards |
| `updateWashLoadPlan` | PATCH | `/api/laundry/wash-loads/:washLoadPlanId` | LAUNDRY | body: `UpdateWashLoadPlanInput` | `WashLoadPlan` | Status/fit update if contract allows |
| `cancelWashLoadPlan` | POST | `/api/laundry/wash-loads/:washLoadPlanId/cancel` | LAUNDRY | body: `CancelWashLoadPlanInput` | `WashLoadPlan` | Cancel planning record |

---

## 10. Request Payload Mapping

### CreateLaundryWorkInput

```ts
type CreateLaundryWorkInput = {
  resortId: number
  bagCount?: number
  receivedDate?: string
  note?: string
}
```

### UpdateLaundryWorkInput

```ts
type UpdateLaundryWorkInput = {
  bagCount?: number
  receivedDate?: string | null
  note?: string | null
}
```

### ReceiveLaundryWorkInput

```ts
type ReceiveLaundryWorkInput = {
  receivedDate?: string
  bagCount?: number
  note?: string
}
```

### ReturnLaundryWorkInput

```ts
type ReturnLaundryWorkInput = {
  returnedAt?: string
  note?: string
}
```

### CloseLaundryWorkInput

```ts
type CloseLaundryWorkInput = {
  closedAt?: string
  note?: string
}
```

### CancelLaundryWorkInput

```ts
type CancelLaundryWorkInput = {
  note: string
}
```

### CreateLaundryBagInput

```ts
type CreateLaundryBagInput = {
  bagNo: string
  receivedAt?: string
  note?: string
}
```

### OpenLaundryBagInput

```ts
type OpenLaundryBagInput = {
  openedAt?: string
  note?: string
}
```

### CloseLaundryBagInput

```ts
type CloseLaundryBagInput = {
  note?: string
}
```

### RecordLaundryCountLinesInput

```ts
type RecordLaundryCountLinesInput = {
  lines: Array<{
    bagId?: number
    itemTypeId: number
    colorGroup?: string
    quantity: number
    issueQuantity?: number
    note?: string
  }>
}
```

### UpdateLaundryCountLineInput

```ts
type UpdateLaundryCountLineInput = {
  itemTypeId?: number
  colorGroup?: string | null
  quantity?: number
  issueQuantity?: number
  note?: string | null
}
```

### ReportLaundryIssueInput

```ts
type ReportLaundryIssueInput = {
  itemTypeId?: number
  colorGroup?: string
  issueType: 'DAMAGED' | 'MISSING' | 'COUNT_MISMATCH' | 'RETURN_MISMATCH' | 'OTHER'
  quantity?: number
  description?: string
}
```

### ResolveLaundryIssueInput

```ts
type ResolveLaundryIssueInput = {
  resolvedAt?: string
  note?: string
}
```

### CancelLaundryIssueInput

```ts
type CancelLaundryIssueInput = {
  note: string
}
```

### PlanWashLoadInput

```ts
type PlanWashLoadInput = {
  machineId: number
  loadRuleId?: number
  loadNo: number
  estimatedPieceCount: number
  totalWeightKg: string | number
  note?: string
}
```

### UpdateWashLoadPlanInput

```ts
type UpdateWashLoadPlanInput = {
  machineId?: number
  loadRuleId?: number | null
  estimatedPieceCount?: number
  totalWeightKg?: string | number
  status?: 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  fitStatus?: 'UNCHECKED' | 'UNDER_LOADED' | 'OPTIMAL' | 'OVER_LOADED'
  note?: string | null
}
```

---

## 11. Response Data Mapping

### LaundryWorkListResult

```ts
type LaundryWorkListResult = {
  items: LaundryWorkSummary[]
  page?: number
  limit?: number
  total?: number
}
```

### LaundryWorkSummary

```ts
type LaundryWorkSummary = {
  id: number
  workNo: string
  resortId: number
  resortName?: string
  bagCount: number
  currentStatus: string
  issueCount: number
  receivedDate?: string | null
  returnedAt?: string | null
  closedAt?: string | null
  updatedAt: string
}
```

### LaundryWorkDetail

```ts
type LaundryWorkDetail = LaundryWorkSummary & {
  note?: string | null
  bags?: LaundryBag[]
  countLines?: LaundryCountLine[]
  issues?: IssueReport[]
  statusLogs?: WorkStatusLog[]
  washLoadPlans?: WashLoadPlan[]
}
```

### Core Response Objects

Client response types must align with backend contract and schema fields:

- `LaundryBag`: `id`, `workId`, `resortId`, `bagNo`, `status`, `receivedAt`, `openedAt`, `note`, `createdAt`, `updatedAt`
- `LaundryCountLine`: `id`, `workId`, `bagId?`, `resortId`, `itemTypeId`, `colorGroup?`, `quantity`, `issueQuantity`, `note`, `createdAt`, `updatedAt`
- `IssueReport`: `id`, `workId`, `resortId`, `itemTypeId?`, `colorGroup?`, `issueType`, `quantity`, `description?`, `status`, `reportedAt`, `resolvedAt?`
- `LinenInventorySummary`: `id`, `resortId`, `itemTypeId`, `colorGroup?`, `totalKnownQty`, `atResortQty`, `atLaundryQty`, `issueQty`, `returnedQty`, `calculatedAt`, `updatedAt`
- `LinenMovement`: `id`, `resortId`, `workId?`, `itemTypeId`, `colorGroup?`, `movementType`, `quantity`, `occurredAt`, `note?`
- `WorkStatusLog`: `id`, `workId`, `fromStatus?`, `toStatus`, `changedById?`, `changedByName?`, `changedAt`, `note?`
- `WashLoadPlan`: `id`, `workId`, `machineId`, `loadRuleId?`, `loadNo`, `estimatedPieceCount`, `totalWeightKg`, `status`, `fitStatus`, `note?`, `createdAt`, `updatedAt`

---

## 12. Client Module Ownership

Recommended client module split:

```text
src/features/laundry-work/api/laundryWorkApi.ts
src/features/laundry-bag/api/laundryBagApi.ts
src/features/laundry-count-line/api/laundryCountLineApi.ts
src/features/issue-report/api/issueReportApi.ts
src/features/linen-inventory/api/linenInventoryApi.ts
src/features/wash-load/api/washLoadApi.ts
```

Shared transport must remain in the FE-06 API client boundary.

Feature UI must call feature API modules only.

---

## 13. Loading / Empty / Error / Retry Rules

### Reads

- `listLaundryWorks`, `getLaundryWorkDetail`, `listLaundryBags`, `listLaundryCountLines`, `listLaundryIssues`, `listResortInventorySummary`, `listLinenMovements`, `listWorkStatusLogs`, and `listWashLoadPlans` may support retry for `NETWORK_ERROR` and retryable `SERVER_ERROR`.
- Empty state is valid only after `ok: true` with empty `items` or empty array.

### Mutations

- `create`, `update`, `receive`, `return`, `close`, `cancel`, `record`, `report`, `resolve`, and `plan` actions must prevent unsafe duplicate submit while pending.
- Automatic retry is not allowed for destructive mutations unless backend contract declares idempotency.
- Mutation success must trigger FE-05 server-state refresh/invalidation for affected work/detail/list scopes.

---

## 14. Workspace Validation Matrix

| Function Group | Laundry Workspace | Resort Workspace |
|---|---|---|
| Work list/detail | Allowed | Allowed only for own `resortId` |
| Work create/update/status transition | Allowed | Not allowed unless backend contract explicitly allows |
| Bag list | Allowed | Allowed only for own `resortId` |
| Bag create/open/close | Allowed | Not allowed unless backend contract explicitly allows |
| Count line list | Allowed | Allowed only for own `resortId` |
| Count line record/update/delete | Allowed | Not allowed unless backend contract explicitly allows |
| Issue list | Allowed | Allowed only for own `resortId` |
| Issue report | Allowed | Allowed for own `resortId` if contract allows customer-side reporting |
| Issue resolve/cancel | Allowed | Not allowed unless backend contract explicitly allows |
| Inventory summary | Allowed | Allowed only for own `resortId` |
| Movement history | Allowed | Allowed only for own `resortId` |
| Wash load planning | Allowed | Not allowed |

---

## 15. Implementation Readiness Checklist

API integration team can begin client implementation when:

- Shared API client supports response envelope normalization.
- Shared API client generates and forwards `requestId`.
- Shared API client attaches auth/actor/workspace metadata from runtime.
- Feature API modules use the client functions listed in this mapping.
- Workspace policy is enforced before dispatch where detectable.
- Validation errors are mapped through the field mapping table.
- FE-05 server-state refresh/invalidation rules are applied after mutations.
- Backend endpoint paths are confirmed or adjusted against backend contract.

---

## 16. Blockers / Contract Gaps

- Concrete backend route files were not found through connector search during this mapping task.
- Endpoint paths in this document are proposed frontend contract targets and must be confirmed against backend contracts before code implementation.
- If backend contracts use different route naming or envelope naming, this mapping should be updated before client code is merged.
