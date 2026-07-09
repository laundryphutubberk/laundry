# FE-06 — Laundry Work End-to-End Flow

Status: BASELINE
Execution Domain: FE-06 Integration
Document Type: End-to-End Flow Contract
Primary Domain: Laundry Work
Audience: FE / BE / QA / Product

---

## 1. Mission

Define the full operational flow for Laundry Work from work creation through final close.

This document aligns:

- Business workflow
- Backend command contracts
- Frontend screen flow
- State transition truth
- Workspace visibility
- QA readiness

This document is a flow/contract document. It does not implement UI, API, database changes, or business logic.

---

## 2. Source of Truth

The flow follows the project source-of-truth order:

1. Business Blueprint
2. Engineering Blueprint
3. `schema.prisma`
4. Backend contracts
5. FE-03 Runtime Contract
6. FE-05 State Contract
7. FE-06 Integration Standard and API Mapping

Business transition truth must be enforced by backend contracts. Frontend may present allowed actions only after backend capability exists.

---

## 3. Core Business Flow

```text
Create Laundry Work
↓
Receive Bags From Resort
↓
Laundry Factory Receives Bags
↓
Open Bags
↓
Count Items
↓
Sort By Type
↓
Sort By Color
↓
Record Data
↓
Report Issues If Any
↓
Return To Resort
↓
Close Work
```

Inventory truth is created only after real counting and recording. The system must not create assumed inventory only to make the database look complete.

---

## 4. Workspace Model

### Laundry Workspace

Laundry Workspace owns operational execution.

Allowed responsibilities:

- Create Laundry Work
- Receive bags
- Open bags
- Record count lines
- Report and resolve issues
- Plan wash loads
- Return work
- Close work
- View all work according to role

### Resort Workspace

Resort Workspace sees only its own resort data.

Allowed responsibilities:

- View own Laundry Work
- View own counts, issues, movement, and inventory summary
- Report issues only if backend contract explicitly allows customer-side reporting

### Isolation Rule

Every backend query, command, projection, dashboard, report, and UI surface must preserve workspace isolation.

Resort Workspace must never see another resort's data.

---

## 5. Domain Objects Involved

| Domain Object | Role In Flow | Source of Truth |
|---|---|---|
| `LaundryWork` | Operational center of one work cycle | Backend / DB |
| `LaundryBag` | Intake unit from resort | Backend / DB |
| `LaundryCountLine` | Real counted item quantity | Backend / DB |
| `IssueReport` | Explicit problem record | Backend / DB |
| `WorkStatusLog` | Audit trail of status transition | Backend / DB |
| `LinenMovement` | Inventory movement history | Backend / DB |
| `LinenInventorySummary` | Derived current inventory summary | Backend / DB |
| `WashLoadPlan` | Laundry internal machine/load planning | Backend / DB |

---

## 6. Work Status Transition Model

Current schema status sequence:

```text
DRAFT
↓
BAG_RECEIVED
↓
FACTORY_RECEIVED
↓
BAG_OPENED
↓
ITEM_COUNTED
↓
TYPE_SORTED
↓
COLOR_SORTED
↓
DATA_RECORDED
↓
RETURNED
↓
CLOSED
```

Exception:

```text
Any non-terminal status → CANCELLED
```

Terminal statuses:

- `CLOSED`
- `CANCELLED`

Frontend must not invent transitions. Backend contract decides whether a transition is allowed.

---

## 7. Flow Stages

### Stage 1 — Create Laundry Work

Purpose:
Create an operational work record for a resort pickup/receive cycle.

Primary backend object:
`LaundryWork`

Minimum input:

- `resortId`
- `bagCount?`
- `receivedDate?`
- `note?`

Expected status:

- Initial: `DRAFT`
- Or direct `BAG_RECEIVED` only if backend contract explicitly supports receive-on-create

Primary screen:

- Laundry Work List
- Create Work Form / Drawer / Page

Backend command target:

```text
POST /api/laundry/works
```

FE action availability:

- Create button enabled only in Laundry Workspace
- Disabled in Resort Workspace unless backend explicitly supports customer-created work

---

### Stage 2 — Receive Bags From Resort

Purpose:
Record that bags were received from resort or pickup arrived.

Primary backend objects:

- `LaundryWork`
- `LaundryBag`

Expected transition:

```text
DRAFT → BAG_RECEIVED
```

Possible commands:

```text
PATCH /api/laundry/works/:workId/status
POST /api/laundry/works/:workId/bags
```

Required decision:
Backend must define whether bag rows are created:

1. During work creation from `bagCount`
2. During BAG_RECEIVED transition
3. Manually one bag at a time

Until that is decided, FE must not assume bag creation behavior.

---

### Stage 3 — Laundry Factory Receives Bags

Purpose:
Confirm bags are physically at laundry factory and ready to open/process.

Expected transition:

```text
BAG_RECEIVED → FACTORY_RECEIVED
```

Backend command target:

```text
PATCH /api/laundry/works/:workId/status
```

UI behavior:

- Show work as ready for opening
- Keep count entry disabled until opening is allowed by backend state

---

### Stage 4 — Open Bags

Purpose:
Open received bags and begin item-level processing.

Expected transition:

```text
FACTORY_RECEIVED → BAG_OPENED
```

Backend command targets:

```text
PATCH /api/laundry/works/:workId/status
```

Optional bag-level commands:

```text
PATCH /api/laundry/works/:workId/bags/:bagId/open
```

Current backend gap:
If only work-level status transition exists, FE should not show bag-level open action as production-ready.

---

### Stage 5 — Count Items

Purpose:
Record the real item quantity found during opening/counting.

Expected transition:

```text
BAG_OPENED → ITEM_COUNTED
```

Primary backend object:
`LaundryCountLine`

Minimum count line fields:

- `workId`
- `bagId?`
- `resortId`
- `itemTypeId`
- `colorGroup?`
- `quantity`
- `issueQuantity?`
- `note?`

Backend command target required:

```text
POST /api/laundry/works/:workId/count-lines
PATCH /api/laundry/count-lines/:lineId
DELETE /api/laundry/count-lines/:lineId
```

Current blocker:
Count Line endpoints must be confirmed or created before FE can implement real count entry.

---

### Stage 6 — Sort By Type

Purpose:
Confirm counted items have been separated/validated by linen type.

Expected transition:

```text
ITEM_COUNTED → TYPE_SORTED
```

Backend command target:

```text
PATCH /api/laundry/works/:workId/status
```

UI behavior:

- Show type-level grouping from count lines
- Do not calculate backend-owned derived inventory in UI

---

### Stage 7 — Sort By Color

Purpose:
Confirm counted items have been separated/validated by color group.

Expected transition:

```text
TYPE_SORTED → COLOR_SORTED
```

Backend command target:

```text
PATCH /api/laundry/works/:workId/status
```

UI behavior:

- Show color grouping from backend-provided count lines
- Color group must use backend/domain-approved values once contract exists

---

### Stage 8 — Record Data

Purpose:
Finalize recorded operational count data and create movement/inventory impact.

Expected transition:

```text
COLOR_SORTED → DATA_RECORDED
```

Backend responsibility:

- Validate count lines
- Create/update `LinenMovement`
- Update/derive `LinenInventorySummary`
- Preserve audit trail

Backend command target:

```text
PATCH /api/laundry/works/:workId/status
```

or dedicated command if backend needs stronger semantics:

```text
POST /api/laundry/works/:workId/record-data
```

Decision needed:
Backend must decide whether `DATA_RECORDED` transition alone triggers inventory/movement effects.

---

### Stage 9 — Report Issues If Any

Purpose:
Create explicit issue records for damaged/missing/mismatch/other problems.

Primary backend object:
`IssueReport`

Issue types:

- `DAMAGED`
- `MISSING`
- `COUNT_MISMATCH`
- `RETURN_MISMATCH`
- `OTHER`

Backend command target required:

```text
GET /api/laundry/issues
POST /api/laundry/works/:workId/issues
POST /api/laundry/issues/:issueId/resolve
POST /api/laundry/issues/:issueId/cancel
```

Current blocker:
Issue endpoints are not yet confirmed for implementation. FE Issue action must remain disabled until backend contract exists.

---

### Stage 10 — Return To Resort

Purpose:
Record completed laundry work returned to resort.

Expected transition:

```text
DATA_RECORDED → RETURNED
```

Backend command target:

```text
PATCH /api/laundry/works/:workId/status
```

Optional stronger command:

```text
POST /api/laundry/works/:workId/return
```

Backend responsibility:

- Set `returnedAt`
- Create return movement if required
- Update status log

Decision needed:
Backend must decide whether status transition sets `returnedAt` automatically or requires explicit return command payload.

---

### Stage 11 — Close Work

Purpose:
Finalize work cycle after return and issue resolution policy is satisfied.

Expected transition:

```text
RETURNED → CLOSED
```

Backend command target:

```text
PATCH /api/laundry/works/:workId/status
```

Backend responsibility:

- Set `closedAt`
- Reject close if required issue/count/return conditions are not satisfied
- Preserve final status log

Frontend rule:
Close must be available only when backend allows it.

---

## 8. Screen Map

| Screen | Route | Purpose |
|---|---|---|
| Login | `/login` | Authenticate actor |
| Register | `/register` | Create first/user account |
| Laundry Work List | `/workspace/laundry/works` | List visible work by workspace |
| Laundry Work Detail | `/workspace/laundry/works/:workId` | Execute and inspect work |
| Create Work | TBD | Create new work |
| Count Entry | TBD or detail section | Record count lines |
| Issue Report | TBD or detail panel | Report/resolve issues |
| Return Work | TBD or detail action | Return to resort |
| Inventory Summary | TBD | Resort/laundry inventory visibility |

Current route contract:

```text
/workspace/laundry/works        → Laundry Work List
/workspace/laundry/works/:workId → Laundry Work Detail
```

---

## 9. API Command Map

### Confirmed Backend Endpoints

| Capability | Endpoint | Status |
|---|---|---|
| List works | `GET /api/laundry/works` | Confirmed |
| Get work detail | `GET /api/laundry/works/:workId` | Confirmed |
| Create work | `POST /api/laundry/works` | Confirmed |
| Status transition | `PATCH /api/laundry/works/:workId/status` | Confirmed |
| List bags | `GET /api/laundry/works/:workId/bags` | Confirmed |
| Get bag detail | `GET /api/laundry/works/:workId/bags/:bagId` | Confirmed |
| Create bag | `POST /api/laundry/works/:workId/bags` | Confirmed |

### Required / Not Yet Confirmed

| Capability | Endpoint Target | Status |
|---|---|---|
| Open bag | `PATCH /api/laundry/works/:workId/bags/:bagId/open` | Gap |
| Close bag | `PATCH /api/laundry/works/:workId/bags/:bagId/close` | Gap |
| List count lines | `GET /api/laundry/works/:workId/count-lines` | Gap |
| Record count lines | `POST /api/laundry/works/:workId/count-lines` | Gap |
| Update count line | `PATCH /api/laundry/count-lines/:lineId` | Gap |
| Delete count line | `DELETE /api/laundry/count-lines/:lineId` | Gap |
| Issue list | `GET /api/laundry/issues` | Gap |
| Issue create | `POST /api/laundry/works/:workId/issues` | Gap |
| Issue resolve | `POST /api/laundry/issues/:issueId/resolve` | Gap |
| Image list/upload | TBD | Gap |
| Inventory summary | `GET /api/laundry/inventory` | Gap |
| Movement history | `GET /api/laundry/movements` | Gap |
| Wash load planning | `GET/POST /api/laundry/works/:workId/wash-loads` | Gap |

---

## 10. Frontend Action Availability Rules

Frontend actions must be generated from policy/controller using backend capability.

### Allowed Now

- View list
- View detail
- Continue status transition through confirmed backend endpoint

### Disabled Until Backend Contract Exists

- Save draft as a separate command
- Issue create/resolve/cancel
- Image upload/list
- Count line entry
- Bag open/close as bag-level actions
- Inventory/movement views
- Wash load planning

No disabled action should be presented as production-ready.

---

## 11. Loading / Empty / Error Rules

List screen:

- Loading: show list loading state
- Empty: backend returned success with empty list
- Error: backend/network/auth failure with requestId when available

Detail screen:

- Loading: show skeleton/content loading state
- Empty: work id not found or no data returned
- Error: backend/network/auth failure with requestId when available

Mutation:

- Prevent unsafe duplicate submit while pending
- Do not auto-retry destructive commands
- Refresh affected detail/list after successful mutation

---

## 12. Backend Validation Responsibilities

Backend must validate:

- Actor authentication
- Actor active status
- Role permission
- Workspace isolation
- Resort ownership
- Allowed transition from current status
- Required payload fields
- Count line quantities
- Issue payload and allowed reporter
- Terminal status immutability

Frontend may pre-disable actions but must not be the source of business truth.

---

## 13. Audit / History Rules

Every status transition should create `WorkStatusLog`.

Detail projection may show history from:

```text
GET /api/laundry/works/:workId → statusLogs
```

Dedicated history endpoint is optional but not required until scale or pagination needs it.

---

## 14. Implementation Sequence Recommendation

Recommended next build order:

1. Create Work UI + API integration
2. Confirm status transition command semantics
3. Bag management contract/UI
4. Count line backend endpoints
5. Count entry UI
6. Issue report backend endpoints
7. Issue panel integration
8. Return/close rules and timestamps
9. Inventory movement/summary projection
10. QA end-to-end scenario lock

---

## 15. QA End-to-End Scenarios

### Scenario A — Laundry Staff creates and completes normal work

```text
Login as Laundry Staff
Create Laundry Work
Create/receive bags
Transition through processing states
Record counts
Record data
Return work
Close work
Verify status log
Verify list/detail projections
```

### Scenario B — Resort user sees only own work

```text
Login as Resort user
Open Laundry Work List
Verify only own resort work appears
Open detail
Verify no other resort data leaks
```

### Scenario C — Issue exists

```text
Create or open work
Record issue
Verify issue appears in detail
Resolve issue
Verify close policy behavior
```

### Scenario D — Invalid transition

```text
Attempt disallowed status transition
Backend rejects
FE shows normalized error with requestId
No UI business workaround allowed
```

---

## 16. Current Open Gaps

- Create Work UI is not yet implemented.
- Count Line endpoints are not yet confirmed.
- Issue endpoints are not yet confirmed.
- Image/evidence endpoints are not yet confirmed.
- Inventory summary and movement endpoints are not yet confirmed.
- Backend transition side effects for `DATA_RECORDED`, `RETURNED`, and `CLOSED` need explicit confirmation.

---

## 17. Definition of Done

The end-to-end flow is implementation-ready when:

- List and Detail routes are stable.
- Auth/session/workspace boundary is stable.
- Create Work command exists and is wired.
- Status transition command validates backend truth.
- Bag, Count Line, Issue, Return, Close, Inventory contracts are defined.
- FE policy exposes only backend-supported actions.
- QA can run full work lifecycle from login to close.
