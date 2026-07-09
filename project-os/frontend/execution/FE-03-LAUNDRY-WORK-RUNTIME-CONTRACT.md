# FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md

Status: BASELINE

Task: Laundry Work Runtime Contract

Purpose: กำหนด Runtime Contract เฉพาะ Feature Cell `laundry-work` เพื่อให้ทีม implementation สามารถสร้าง runtime files ต่อได้โดยไม่เดา architecture และไม่เพิ่ม Business Logic ที่ยังไม่มี contract รองรับ

Parent Standard:

- `project-os/frontend/execution/FE-03-RUNTIME.md`

Business Source:

- `project-os/02-business/Laundry-Blueprint.md`
- `project-os/06-domain-model/schema.prisma`

---

## 1. Contract Scope

Runtime Contract นี้ครอบคลุมเฉพาะ `laundry-work` Feature Cell

รวม:

- Workflow Engine Contract
- Policy Contract
- Projection Contract
- Runtime Host Contract
- Controller Hook Contract
- Runtime State Contract
- Runtime Commands Contract
- Backend API dependency surface
- Handoff rules for implementation

ไม่รวม:

- React UI implementation
- Runtime logic จริง
- Backend implementation
- Database implementation
- Business Rule ใหม่
- การแก้ runtime ปัจจุบัน

---

## 2. Feature Cell Identity

Feature Cell: `laundry-work`

Primary Domain Object:

- `LaundryWork`

Related Domain Objects:

- `LaundryBag`
- `LaundryCountLine`
- `IssueReport`
- `WorkStatusLog`
- `Resort`

Aggregate Root:

- `LaundryWork`

Runtime ownership:

- Work list state
- Work detail state
- Work status lifecycle projection
- Work-level action availability
- Work timeline projection
- Work summary projection

Runtime must not own:

- Bag internals beyond work relation
- Inventory truth
- Issue resolution truth
- Resort master data truth
- Backend transition authority

---

## 3. Runtime Files Contract

Implementation team should create files using this naming contract:

```text
src/features/laundry-work/runtime/
├── laundryWork.engine.ts
├── laundryWork.workflow.ts
├── laundryWork.policy.ts
├── LaundryWorkProjection.ts
├── LaundryWorkRuntimeHost.tsx
└── useLaundryWorkController.ts
```

Allowed shared dependencies:

```text
src/runtime/contracts/
src/runtime/scanner/
src/runtime/workflow/
src/runtime/policy/
src/runtime/projection/
```

This document does not create these runtime files. It only defines their contract.

---

## 4. Backend Contract Dependency Surface

Laundry Work Runtime depends on backend contracts for:

### Query Contracts

```text
listLaundryWorks(params)
getLaundryWorkDetail(workId)
getLaundryWorkTimeline(workId)
```

Expected query dimensions:

- workspaceType
- resortId when workspace is RESORT
- status filter
- date range filter
- pagination
- search by workNo / resort name when contract supports it

### Command Contracts

```text
createLaundryWork(input)
receiveBags(workId, input)
markFactoryReceived(workId)
openBag(workId, bagId)
recordCountLines(workId, input)
markTypeSorted(workId)
markColorSorted(workId)
recordWorkData(workId)
returnWork(workId)
closeWork(workId)
cancelWork(workId, reason)
```

Command names are contract placeholders. Implementation must align final names with Backend Contract.

### Response Shape Dependency

Runtime may depend only on contract-level fields:

```text
LaundryWorkDTO
- id
- workNo
- resortId
- resortName
- bagCount
- currentStatus
- issueCount
- receivedDate
- returnedAt
- closedAt
- createdAt
- updatedAt
- note
```

Optional detail fields when backend provides them:

```text
LaundryWorkDetailDTO
- work
- bags
- countLines
- issues
- statusLogs
```

Runtime must not depend on Prisma internal implementation.

---

## 5. Runtime State Contract

Laundry Work runtime state should be structured around backend truth and runtime metadata.

```text
LaundryWorkRuntimeState
- entities
  - worksById
  - workIds
- currentWorkId
- currentWorkDetail
- filters
  - status
  - resortId
  - dateRange
  - search
- workspaceScope
  - workspaceType
  - resortId
  - role
- loading
  - list
  - detail
  - command
- error
  - list
  - detail
  - command
- actionStatus
  - lastAction
  - pendingAction
  - lastSucceededAction
  - lastFailedAction
- lastUpdatedAt
```

State must not include:

- CSS class
- layout-specific flags
- duplicated calculated inventory truth
- hidden Business Rule
- UI-only timeline labels as source of truth

---

## 6. Workflow Engine Contract

File:

```text
laundryWork.workflow.ts
```

Responsibility:

- Convert backend `WorkStatus` into frontend workflow metadata
- Identify current step
- Identify completed / current / pending steps
- Expose possible next command names from contract metadata
- Never authorize by itself
- Never mutate runtime state
- Never call API

Workflow status source:

```text
WorkStatus
- DRAFT
- BAG_RECEIVED
- FACTORY_RECEIVED
- BAG_OPENED
- ITEM_COUNTED
- TYPE_SORTED
- COLOR_SORTED
- DATA_RECORDED
- RETURNED
- CLOSED
- CANCELLED
```

Workflow output contract:

```text
LaundryWorkWorkflowProjection
- currentStatus
- currentStepKey
- steps[]
  - key
  - status
  - backendStatus
  - isCompleted
  - isCurrent
  - isPending
- nextActionKeys[]
- terminal
  - isClosed
  - isCancelled
```

Allowed step keys:

```text
receive_bags
factory_receive
open_bag
count_items
sort_type
sort_color
record_data
return_work
close_work
```

Workflow Engine must not decide if the user can perform an action. It only describes workflow position and possible contract-level transitions.

---

## 7. Policy Contract

File:

```text
laundryWork.policy.ts
```

Responsibility:

- Determine whether a UI / scanner / controller action is allowed to enter Engine
- Check workspace boundary
- Check required runtime state availability
- Check command preconditions known from contract
- Return allow / deny / reason

Policy input contract:

```text
LaundryWorkPolicyInput
- actionKey
- workId optional
- currentWork optional
- workspaceScope
  - workspaceType
  - resortId
  - role
- runtimeStateSnapshot
- commandPayload optional
```

Policy output contract:

```text
LaundryWorkPolicyResult
- allowed: boolean
- reasonCode optional
- message optional
- requiredContract optional
```

Required policy checks:

### Workspace checks

- LAUNDRY workspace may access Laundry-owned work data according to backend contract
- RESORT workspace may access only work with matching `resortId`
- Missing workspace scope must deny action
- Resort mismatch must deny action

### Work state checks

- Missing workId for detail command must deny action
- Missing currentWork for stateful command must deny action
- Terminal status must deny mutation commands unless backend contract explicitly allows them

### Command checks

- Command must be listed in controller action contract
- Command must have required payload shape before Engine receives it
- Policy must not invent transition rules that backend contract does not define

Reason codes:

```text
MISSING_WORKSPACE_SCOPE
RESORT_SCOPE_MISMATCH
MISSING_WORK_ID
MISSING_CURRENT_WORK
ACTION_NOT_SUPPORTED
ACTION_NOT_ALLOWED_BY_STATUS
MISSING_REQUIRED_PAYLOAD
TERMINAL_WORK
BACKEND_CONTRACT_REQUIRED
```

Policy must not call API or mutate state.

---

## 8. Projection Contract

File:

```text
LaundryWorkProjection.ts
```

Responsibility:

- Convert runtime state into UI-ready view models
- Hide raw backend shape from UI
- Prepare list, detail, timeline, action, loading, and error projections
- Use workflow projection and policy output as inputs
- Never mutate state
- Never call API

Projection input:

```text
LaundryWorkProjectionInput
- runtimeState
- workflowProjection optional
- policyResults optional
```

Projection output:

```text
LaundryWorkViewModel
- list
  - items[]
  - emptyState
  - loading
  - error
- detail
  - work
  - timeline
  - bagsSummary
  - countSummary
  - issueSummary
  - loading
  - error
- actions
  - primaryAction
  - secondaryActions[]
  - disabledReasonsByAction
- workspace
  - workspaceType
  - resortScoped
- meta
  - lastUpdatedAt
```

List item projection shape:

```text
LaundryWorkListItemVM
- id
- workNo
- resortName
- currentStatus
- statusLabel
- bagCount
- issueCount
- receivedDateLabel
- returnedAtLabel optional
- isProblematic
- isClosed
```

Detail projection shape:

```text
LaundryWorkDetailVM
- id
- workNo
- resortName
- currentStatus
- statusLabel
- bagCount
- issueCount
- receivedDateLabel
- returnedAtLabel optional
- closedAtLabel optional
- note optional
```

Projection may create display labels, but labels are presentation metadata only and must not become source of truth.

---

## 9. Runtime Engine Contract

File:

```text
laundryWork.engine.ts
```

Responsibility:

- Receive commands from controller after policy approval
- Call API client according to backend contract
- Normalize response into runtime state
- Manage loading / error / action status
- Notify workflow/projection refresh boundary

Engine command contract:

```text
LaundryWorkEngineCommand
- type
- workId optional
- payload optional
- requestContext
```

Allowed engine command types:

```text
LOAD_WORK_LIST
LOAD_WORK_DETAIL
CREATE_WORK
RECEIVE_BAGS
MARK_FACTORY_RECEIVED
OPEN_BAG
RECORD_COUNT_LINES
MARK_TYPE_SORTED
MARK_COLOR_SORTED
RECORD_WORK_DATA
RETURN_WORK
CLOSE_WORK
CANCEL_WORK
REFRESH_CURRENT_WORK
```

Engine output contract:

```text
LaundryWorkEngineResult
- ok: boolean
- statePatch optional
- error optional
- receivedContract optional
```

Engine must not:

- Render UI
- Import React components
- Decide business authorization
- Create business transitions without backend contract
- Calculate inventory truth

---

## 10. Runtime Host Contract

File:

```text
LaundryWorkRuntimeHost.tsx
```

Responsibility:

- Own the runtime boundary for Laundry Work feature tree
- Provide controller to descendant UI
- Initialize runtime state according to route/workspace context
- Wire engine, workflow, policy, and projection together
- Handle lifecycle-level load commands only

Host input contract:

```text
LaundryWorkRuntimeHostProps
- children
- initialWorkId optional
- workspaceScope
- initialFilters optional
```

Host output:

- Provides runtime context
- Does not render business UI
- Does not decide visual layout

Host must not:

- Render work cards / forms / timeline UI
- Perform direct API call outside engine
- Skip policy layer
- Contain business transition logic

---

## 11. Controller Hook Contract

File:

```text
useLaundryWorkController.ts
```

Responsibility:

- Expose UI-facing state from Projection
- Expose action handlers for UI / scanner events
- Route actions through Policy before Engine
- Provide loading, error, and action status
- Hide Engine internals from UI

Controller output contract:

```text
UseLaundryWorkControllerResult
- viewModel
- actions
  - loadList(params)
  - loadDetail(workId)
  - createWork(input)
  - receiveBags(workId, input)
  - markFactoryReceived(workId)
  - openBag(workId, bagId)
  - recordCountLines(workId, input)
  - markTypeSorted(workId)
  - markColorSorted(workId)
  - recordWorkData(workId)
  - returnWork(workId)
  - closeWork(workId)
  - cancelWork(workId, reason)
  - refresh()
- state
  - loading
  - error
  - actionStatus
- policy
  - can(actionKey, context)
```

Controller must not:

- Call API directly
- Mutate runtime state directly
- Build UI layout
- Apply business rules outside policy

---

## 12. Scanner / Action Contract

Laundry Work must support scanner-initiated action flow through the same controller contract.

Scanner event input contract:

```text
LaundryWorkScannerEvent
- eventType
- scannedValue
- source
- occurredAt
- context optional
```

Allowed scanner event categories:

```text
SCAN_WORK_NO
SCAN_BAG_NO
SCAN_RESORT_CODE
```

Scanner event flow:

```text
Scanner Event
↓
useLaundryWorkController action
↓
laundryWork.policy.ts
↓
laundryWork.engine.ts
↓
Backend Contract
↓
Runtime State
↓
LaundryWorkProjection.ts
↓
UI
```

Scanner must not bypass controller, policy, or engine.

---

## 13. API → Projection Contract

```text
Backend API Response
↓
Engine receives contract response
↓
Engine normalizes work/list/detail state
↓
Workflow builds workflow metadata
↓
Policy evaluates action availability when requested
↓
Projection builds LaundryWorkViewModel
↓
Controller exposes viewModel to UI
```

UI must consume only controller output.

UI must not read raw API response directly.

---

## 14. Action → Policy → Engine Contract

```text
UI / Scanner action
↓
Controller action handler
↓
Policy check
↓
if denied: return policy reason to controller state
↓
if allowed: dispatch Engine command
↓
Engine calls Backend Contract
↓
Engine updates Runtime State
↓
Projection refreshes ViewModel
```

All mutation actions must pass through policy.

---

## 15. Implementation Handoff Checklist

Implementation may start when:

- Backend contract names are confirmed or mapped
- WorkStatus enum is imported from shared contract or generated type
- Workspace scope provider exists or is stubbed as contract-only
- API client has contract methods or placeholders
- Runtime state shape follows this document
- UI consumes only `useLaundryWorkController`

Implementation must not:

- Add unapproved Business Rule
- Write direct UI → API calls
- Calculate inventory in Laundry Work runtime
- Let Resort Workspace access another resortId
- Use bag as inventory source of truth

---

## 16. Done Criteria

Laundry Work Runtime Contract is ready when:

- Workflow Engine contract is defined
- Policy contract is defined
- Projection contract is defined
- Runtime Engine contract is defined
- Runtime Host contract is defined
- Controller Hook contract is defined
- Scanner / action flow is defined
- API → Projection flow is defined
- Action → Policy → Engine flow is defined
- Runtime boundaries are clear
- No runtime logic implementation is written
- No React UI is written
- No Business Logic beyond contract is added

Status: READY_FOR_IMPLEMENTATION_HANDOFF
