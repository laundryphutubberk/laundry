# FE-03 Laundry Work Runtime Contract

Status: READY_FOR_FE_04_FE_05_FE_07
Mode: Execution
Execution Domain: FE-03 Runtime Contract
Feature Cell: Laundry Work
Source Input: `project-os/frontend/execution/fe-02-operational-workflow/FE-02-LAUNDRY-WORK-OPERATIONAL-WORKFLOW.md`

## Purpose

Transform the approved FE-02 Laundry Work Operational Workflow into an implementation-independent Runtime Contract that becomes the single execution source for UI composition, state ownership, controller orchestration, and frontend integration.

This contract does not implement React UI, store code, API code, backend behavior, database changes, or new business workflow. Every runtime state traces to FE-02 and every UI projection originates from runtime state.

---

## 1. Source Traceability

FE-02 defines the main operational flow as:

```text
Create Laundry Work
  -> Receive Bags
  -> Factory Receive Confirmation
  -> Open Bag
  -> Count Items
  -> Sort Type
  -> Sort Color
  -> Record Data
  -> Return Work
  -> Close Work
```

FE-02 defines exception flags or exception paths for:

```text
ISSUE_REPORTED
DAMAGED_REPORTED
MISSING_REPORTED
COUNT_DISCREPANCY
RETURN_DISCREPANCY
UNKNOWN_ITEM_TYPE
BAG_EXCEPTION
CANCELLED
```

Runtime must not add, remove, or reorder workflow steps without an updated FE-02 workflow.

---

## 2. Runtime Boundaries

### 2.1 Owns

Laundry Work Runtime owns:

- Workflow step model
- Runtime state category map
- Transition table and transition guards
- Command names and command intent
- Runtime events
- Policy keys and deny reasons
- Controller responsibilities
- Projection contracts consumed by UI
- Artifact dependency map for FE-04 / FE-05 / FE-07

### 2.2 Does Not Own

Laundry Work Runtime does not own:

- Backend source of truth
- Inventory source data
- Bag-as-inventory interpretation
- Issue resolution truth beyond approved issue contract
- Store implementation
- API implementation
- React component implementation
- New business workflow

### 2.3 Runtime Boundary Rule

UI, State, Controller, and Integration must consume this contract. They must not redefine workflow transitions independently.

---

## 3. Runtime Naming Standard

Runtime artifacts should use the following names when implemented:

```text
frontend/src/features/laundry-works/controllers/useLaundryWorkController.ts
frontend/src/features/laundry-works/policies/laundryWork.policy.ts
frontend/src/features/laundry-works/projections/laundryWorkProjection.ts
frontend/src/features/laundry-works/stores/laundryWork.store.ts
frontend/src/features/laundry-works/runtime/LaundryWorkRuntimeHost.tsx
frontend/src/features/laundry-works/api/laundryWorkApi.ts
```

Contract-level names:

```text
WorkflowStep
LaundryWorkRuntimeState
LaundryWorkCommand
LaundryWorkRuntimeEvent
LaundryWorkPolicyResult
LaundryWorkDetailProjection
LaundryWorkControllerResponsibilities
```

---

## 4. Workflow Steps

### 4.1 WorkflowStep Type

```ts
type WorkflowStep = {
  key: WorkflowStepKey
  sourceStep: string
  label: string
  backendStatus: WorkStatus
  state: WorkflowStepState
  command?: LaundryWorkCommandType
  requiredPolicy?: LaundryWorkPolicyKey
  projectionSlots: ProjectionSlot[]
}
```

```ts
type WorkflowStepState = 'completed' | 'current' | 'pending' | 'blocked' | 'cancelled' | 'disabled'
```

```ts
type ProjectionSlot =
  | 'workHeader'
  | 'workflowTimeline'
  | 'summaryCards'
  | 'mainTaskPanel'
  | 'countTable'
  | 'issuePanel'
  | 'imagePanel'
  | 'historyPanel'
  | 'actionBar'
```

### 4.2 WorkflowStepKey

```ts
type WorkflowStepKey =
  | 'create_work'
  | 'receive_bags'
  | 'factory_receive'
  | 'open_bag'
  | 'count_items'
  | 'sort_type'
  | 'sort_color'
  | 'record_data'
  | 'return_work'
  | 'close_work'
```

### 4.3 Workflow Step Map

| FE-02 Step | WorkflowStepKey | Runtime State | Command | Policy | Projection Slots |
|---|---|---|---|---|---|
| Create Laundry Work | `create_work` | `DRAFT` | `CREATE_WORK` | `canCreateWork` | `workHeader`, `summaryCards`, `actionBar` |
| Receive Bags | `receive_bags` | `BAG_RECEIVED` | `RECEIVE_BAGS` | `canReceiveBags` | `workflowTimeline`, `summaryCards`, `actionBar` |
| Factory Receive Confirmation | `factory_receive` | `FACTORY_RECEIVED` | `MARK_FACTORY_RECEIVED` | `canFactoryReceive` | `workflowTimeline`, `actionBar` |
| Open Bag | `open_bag` | `BAG_OPENED` | `OPEN_BAG` | `canOpenBag` | `workflowTimeline`, `mainTaskPanel`, `actionBar` |
| Count Items | `count_items` | `ITEM_COUNTED` | `RECORD_COUNT_LINES` | `canRecordCountLines` | `countTable`, `summaryCards`, `actionBar` |
| Sort Type | `sort_type` | `TYPE_SORTED` | `MARK_TYPE_SORTED` | `canSortType` | `mainTaskPanel`, `workflowTimeline`, `actionBar` |
| Sort Color | `sort_color` | `COLOR_SORTED` | `MARK_COLOR_SORTED` | `canSortColor` | `mainTaskPanel`, `workflowTimeline`, `actionBar` |
| Record Data | `record_data` | `DATA_RECORDED` | `RECORD_WORK_DATA` | `canRecordWorkData` | `summaryCards`, `historyPanel`, `actionBar` |
| Return Work | `return_work` | `RETURNED` | `RETURN_WORK` | `canReturnWork` | `workflowTimeline`, `summaryCards`, `actionBar` |
| Close Work | `close_work` | `CLOSED` | `CLOSE_WORK` | `canCloseWork` | `workflowTimeline`, `summaryCards`, `historyPanel`, `actionBar` |

---

## 5. Runtime States

### 5.1 WorkStatus

```ts
type WorkStatus =
  | 'DRAFT'
  | 'BAG_RECEIVED'
  | 'FACTORY_RECEIVED'
  | 'BAG_OPENED'
  | 'ITEM_COUNTED'
  | 'TYPE_SORTED'
  | 'COLOR_SORTED'
  | 'DATA_RECORDED'
  | 'RETURNED'
  | 'CLOSED'
  | 'CANCELLED'
```

### 5.2 Runtime State Categories

| Runtime State | FE-02 Trace | Category | Meaning |
|---|---|---|---|
| `DRAFT` | Create Laundry Work | Active | Work exists or is being prepared before bag receipt. |
| `BAG_RECEIVED` | Receive Bags | Active | Bags were recorded as intake units. |
| `FACTORY_RECEIVED` | Factory Receive Confirmation | Active | Factory accepted the received bags into production. |
| `BAG_OPENED` | Open Bag | Active | At least one received bag has been opened according to policy. |
| `ITEM_COUNTED` | Count Items | Active | Real counted quantity exists as Count Lines. |
| `TYPE_SORTED` | Sort Type | Active | Counted items have type grouping sufficient for downstream projection. |
| `COLOR_SORTED` | Sort Color | Active | Counted items have usable color grouping where required. |
| `DATA_RECORDED` | Record Data | Active | Counted/sorted data is confirmed as operational data. |
| `RETURNED` | Return Work | Near-terminal | Work has been returned and may still allow review/close. |
| `CLOSED` | Close Work | Terminal | Work is complete and read-only by default. |
| `CANCELLED` | Cancel Work | Terminal | Work is stopped and cannot proceed through normal workflow. |

### 5.3 Exception Flags

```ts
type LaundryWorkExceptionFlag =
  | 'ISSUE_REPORTED'
  | 'DAMAGED_REPORTED'
  | 'MISSING_REPORTED'
  | 'COUNT_DISCREPANCY'
  | 'RETURN_DISCREPANCY'
  | 'UNKNOWN_ITEM_TYPE'
  | 'MISSING_COLOR_GROUP'
  | 'BAG_EXCEPTION'
```

Exception flags modify projection and policy results. They do not replace `WorkStatus` unless the approved backend contract defines such a transition.

### 5.4 Runtime State Shape

```ts
type LaundryWorkRuntimeState = {
  workId?: string | number
  workStatus: WorkStatus
  exceptionFlags: LaundryWorkExceptionFlag[]
  workspaceScope: WorkspaceScope
  serverSnapshot: LaundryWorkServerSnapshot
  clientSelection: LaundryWorkClientSelection
  transient: LaundryWorkTransientState
  request: LaundryWorkRequestState
  policySnapshot: LaundryWorkPolicySnapshot
}
```

```ts
type WorkspaceScope =
  | { workspaceType: 'LAUNDRY'; role?: string }
  | { workspaceType: 'RESORT'; resortId: string | number; role?: string }
```

```ts
type LaundryWorkServerSnapshot = {
  work?: LaundryWorkDetailDTO | null
  bags?: LaundryBagDTO[]
  countLines?: LaundryCountLineDTO[]
  issues?: IssueReportDTO[]
  statusLogs?: WorkStatusLogDTO[]
  lastSyncedAt?: string
}
```

```ts
type LaundryWorkClientSelection = {
  selectedWorkId?: string | number
  selectedBagId?: string | number
  selectedIssueId?: string | number
  selectedCountLineId?: string | number
  activePanelId?: 'overview' | 'bags' | 'count' | 'issues' | 'history' | 'images'
}
```

```ts
type LaundryWorkTransientState = {
  mode: 'viewing' | 'receiving' | 'opening-bag' | 'counting' | 'sorting' | 'recording' | 'return-prep' | 'closed-review'
  pendingCommand?: LaundryWorkCommandType
  scannerSession?: ScannerSession
  warning?: RuntimeWarning
}
```

```ts
type LaundryWorkRequestState = {
  loading: boolean
  empty: boolean
  error?: RuntimeError | null
  requestId?: string
  retryable?: boolean
}
```

---

## 6. Explicit Transition Rules

### 6.1 Main Transition Table

| From | Command | To | Required Guard |
|---|---|---|---|
| `DRAFT` | `RECEIVE_BAGS` | `BAG_RECEIVED` | Work has resort; bag count or bag records satisfy bag receipt policy. |
| `BAG_RECEIVED` | `MARK_FACTORY_RECEIVED` | `FACTORY_RECEIVED` | At least one bag exists unless zero-bag policy is explicitly approved. |
| `FACTORY_RECEIVED` | `OPEN_BAG` | `BAG_OPENED` | Bag ID belongs to work and bag is received/openable. |
| `BAG_OPENED` | `RECORD_COUNT_LINES` | `ITEM_COUNTED` | Count lines satisfy quantity and completeness policy. |
| `ITEM_COUNTED` | `MARK_TYPE_SORTED` | `TYPE_SORTED` | Item type data is sufficient or unknown type exception is allowed. |
| `TYPE_SORTED` | `MARK_COLOR_SORTED` | `COLOR_SORTED` | Color group requirement is satisfied or missing color exception is allowed. |
| `COLOR_SORTED` | `RECORD_WORK_DATA` | `DATA_RECORDED` | Count/sort data is confirmed; issue visibility policy satisfied. |
| `DATA_RECORDED` | `RETURN_WORK` | `RETURNED` | Return allowed; unresolved issue policy yields allow, block, or warning. |
| `RETURNED` | `CLOSE_WORK` | `CLOSED` | Role can close; work is returned; blocking issues resolved or explicitly carried. |

### 6.2 Cancellation Transition

| From | Command | To | Required Guard |
|---|---|---|---|
| `DRAFT` through `DATA_RECORDED` | `CANCEL_WORK` | `CANCELLED` | Actor has cancel permission and cancel note is recorded. |
| `RETURNED` | `CANCEL_WORK` | BLOCKED | Returned work cannot be cancelled unless backend contract explicitly allows adjustment. |
| `CLOSED` | any mutation command | BLOCKED | Closed work is read-only by default. |
| `CANCELLED` | any normal workflow command | BLOCKED | Cancelled work cannot proceed through normal flow. |

### 6.3 Exception Transition Rules

| Exception | Runtime Effect | Policy Effect | Projection Effect |
|---|---|---|---|
| `ISSUE_REPORTED` | Adds issue flag to runtime state | May allow continue, warn, or block depending on command | Show issue alert and issue summary |
| `COUNT_DISCREPANCY` | Preserves actual count as operational count | Must not replace count with expected claim | Show discrepancy visibility |
| `UNKNOWN_ITEM_TYPE` | Marks count/sort incomplete or exception-carry | May block `RECORD_WORK_DATA` unless allowed | Show unknown type warning |
| `MISSING_COLOR_GROUP` | Marks color grouping incomplete or optional | Blocks only if color required by policy | Show missing color projection |
| `BAG_EXCEPTION` | Marks bag as exception without making bag inventory | May allow other bags to continue | Show bag exception panel |

---

## 7. Commands

```ts
type LaundryWorkCommandType =
  | 'LOAD_WORK_DETAIL'
  | 'REFRESH_WORK_DETAIL'
  | 'CREATE_WORK'
  | 'RECEIVE_BAGS'
  | 'MARK_FACTORY_RECEIVED'
  | 'OPEN_BAG'
  | 'RECORD_COUNT_LINES'
  | 'MARK_TYPE_SORTED'
  | 'MARK_COLOR_SORTED'
  | 'RECORD_WORK_DATA'
  | 'RETURN_WORK'
  | 'CLOSE_WORK'
  | 'CANCEL_WORK'
  | 'SAVE_DRAFT'
  | 'REPORT_ISSUE'
  | 'UPLOAD_IMAGE'
```

```ts
type LaundryWorkCommand = {
  type: LaundryWorkCommandType
  workId?: string | number
  payload?: unknown
  meta: {
    requestId: string
    source: 'ui' | 'scanner' | 'route' | 'runtime'
    actorId?: string | number
    actorRole?: string
    workspaceScope: WorkspaceScope
    createdAt: string
  }
}
```

Command Rules:

- UI requests commands through Controller only.
- Controller performs Policy check before command dispatch.
- API boundary executes backend-facing commands only after policy allows.
- Store must not perform workflow transition logic.
- Commands preserve `requestId` and workspace scope.

---

## 8. Events

```ts
type LaundryWorkRuntimeEventType =
  | 'WORK_DETAIL_LOAD_REQUESTED'
  | 'WORK_DETAIL_LOADED'
  | 'WORK_DETAIL_LOAD_FAILED'
  | 'WORK_DETAIL_EMPTY'
  | 'COMMAND_REQUESTED'
  | 'COMMAND_ALLOWED'
  | 'COMMAND_DENIED'
  | 'COMMAND_DISPATCHED'
  | 'COMMAND_SUCCEEDED'
  | 'COMMAND_FAILED'
  | 'STATE_TRANSITIONED'
  | 'EXCEPTION_FLAGGED'
  | 'PROJECTION_UPDATED'
  | 'WORKSPACE_SCOPE_CHANGED'
  | 'SELECTION_CHANGED'
  | 'SCANNER_EVENT_RECEIVED'
```

```ts
type LaundryWorkRuntimeEvent = {
  type: LaundryWorkRuntimeEventType
  workId?: string | number
  fromStatus?: WorkStatus
  toStatus?: WorkStatus
  commandType?: LaundryWorkCommandType
  payload?: unknown
  meta: {
    requestId?: string
    occurredAt: string
    source: 'controller' | 'policy' | 'engine' | 'api' | 'projection' | 'scanner'
  }
}
```

Event Rules:

- Events describe runtime activity; they are not backend truth.
- UI consumes projection, not raw events.
- Error events preserve safe message and requestId.
- Event names must not redefine operational workflow.

---

## 9. Policies

### 9.1 Policy Keys

```ts
type LaundryWorkPolicyKey =
  | 'canViewWorkDetail'
  | 'canCreateWork'
  | 'canReceiveBags'
  | 'canFactoryReceive'
  | 'canOpenBag'
  | 'canRecordCountLines'
  | 'canSortType'
  | 'canSortColor'
  | 'canRecordWorkData'
  | 'canReturnWork'
  | 'canCloseWork'
  | 'canCancelWork'
  | 'canSaveDraft'
  | 'canReportIssue'
  | 'canUploadImage'
```

### 9.2 Policy Result

```ts
type LaundryWorkPolicyResult = {
  allowed: boolean
  reasonCode?: PolicyDenyReason
  message?: string
  severity?: 'info' | 'warning' | 'blocking'
  safeForUI: true
}
```

```ts
type PolicyDenyReason =
  | 'MISSING_WORKSPACE_SCOPE'
  | 'MISSING_RESORT_SCOPE'
  | 'RESORT_SCOPE_MISMATCH'
  | 'MISSING_WORK_ID'
  | 'MISSING_WORK_DETAIL'
  | 'DETAIL_NOT_READY'
  | 'ACTION_NOT_SUPPORTED'
  | 'ACTION_NOT_ALLOWED_BY_STATUS'
  | 'MISSING_REQUIRED_INPUT'
  | 'BAG_REQUIREMENT_NOT_MET'
  | 'COUNT_LINE_REQUIREMENT_NOT_MET'
  | 'UNKNOWN_ITEM_TYPE_REQUIRES_REVIEW'
  | 'COLOR_REQUIREMENT_NOT_MET'
  | 'OPEN_ISSUE_BLOCKS_ACTION'
  | 'TERMINAL_WORK'
  | 'BACKEND_CONTRACT_REQUIRED'
```

### 9.3 Policy Rules

- Resort Workspace may view only its own `resortId`.
- Resort Workspace must not override authenticated `resortId` via route or filter.
- Mutation commands require ready work detail unless command is `CREATE_WORK`.
- Terminal `CLOSED` and `CANCELLED` block normal mutation commands.
- `RETURNED` allows review and close, but not normal production commands.
- Open issues may warn or block depending on command policy.
- Unknown item type and missing color group must be explicit policy states, not hidden UI text.
- Policy must not call API, mutate store, or render UI.

---

## 10. Projection Contracts

Every UI projection originates from `LaundryWorkRuntimeState`.

### 10.1 Detail Projection

```ts
type LaundryWorkDetailProjection = {
  loading: boolean
  empty: boolean
  error?: string | null
  requestId?: string
  workHeader: WorkHeaderProjection
  workflowTimeline: WorkflowTimelineProjection
  summaryCards: SummaryCardProjection[]
  mainTaskPanel: MainTaskPanelProjection
  countTable: CountTableProjection
  issuePanel: IssuePanelProjection
  imagePanel: ImagePanelProjection
  historyPanel: HistoryPanelProjection
  actionBar: ActionBarProjection
}
```

### 10.2 UI Projection Models

```ts
type WorkHeaderProjection = {
  workNo?: string
  resortName?: string
  statusLabel: string
  description?: string
  receivedAtLabel?: string
  updatedAtLabel?: string
}
```

```ts
type WorkflowTimelineProjection = {
  steps: WorkflowStep[]
  currentStepKey?: WorkflowStepKey
  nextHint?: string
}
```

```ts
type SummaryCardProjection = {
  key: 'bag-count' | 'count-lines' | 'issue-count' | 'status' | string
  label: string
  value: string | number
  unit?: string
  tone?: 'default' | 'warning' | 'danger' | 'success'
  helperText?: string
}
```

```ts
type MainTaskPanelProjection = {
  activeStepKey?: WorkflowStepKey
  title: string
  description?: string
  mode: 'read-only' | 'interactive' | 'blocked'
  blockerReason?: string
}
```

```ts
type CountTableProjection = {
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' | 'center' }>
  rows: Array<Record<string, string | number | null | undefined>>
  emptyText: string
}
```

```ts
type IssuePanelProjection = {
  issues: Array<{
    id: string | number
    title: string
    description?: string
    quantity?: number
    statusLabel: string
    reportedAtLabel?: string
  }>
  canCreateIssue: boolean
  emptyText: string
}
```

```ts
type ImagePanelProjection = {
  images: Array<{
    id: string | number
    url?: string
    thumbnailUrl?: string
    alt: string
    caption?: string
  }>
  canUploadImage: boolean
  emptyText: string
}
```

```ts
type HistoryPanelProjection = {
  events: Array<{
    id: string | number
    label: string
    timestampLabel?: string
    actorName?: string
    note?: string
  }>
  emptyText: string
}
```

```ts
type ActionBarProjection = {
  primaryAction?: RuntimeActionProjection
  secondaryActions: RuntimeActionProjection[]
  backAction: RuntimeActionProjection
  destructiveAction?: RuntimeActionProjection
}

type RuntimeActionProjection = {
  key: string
  label: string
  disabled: boolean
  loading?: boolean
  reasonCode?: PolicyDenyReason
  message?: string
  command?: LaundryWorkCommandType
}
```

Projection Rules:

- UI must not calculate current step from status.
- UI must not calculate action eligibility.
- UI must not calculate business metrics that belong to runtime projection.
- Projection may create display labels, but not source-of-truth values.
- Empty/error projection must not leak cross-resort existence.

---

## 11. Controller Responsibilities

```ts
type LaundryWorkControllerResponsibilities = {
  readRouteParams: true
  resolveWorkspaceScope: true
  requestWorkDetailViaApiBoundary: true
  updateSelectedIdsViaStoreBoundary: true
  receivePolicyActionModel: true
  buildProjectionForUI: true
  exposeActionsToUI: true
  preserveRequestIdForErrors: true
}
```

Controller must:

- Read route/work identity.
- Resolve actor/workspace scope before scoped data access.
- Request server data through API boundary only.
- Use store only for selected IDs / UI-safe client state.
- Ask policy for action model.
- Send projection to UI.
- Expose action handlers that dispatch commands through policy.
- Preserve loading, empty, error, requestId, and retryability.

Controller must not:

- Render business UI.
- Redefine workflow transitions.
- Mutate backend truth.
- Let UI bypass policy or API boundary.

---

## 12. Artifact Dependency Map

| Artifact | Consumes | Produces | Must Not Do |
|---|---|---|---|
| FE-02 Operational Workflow | Business workflow | Approved workflow source | Runtime implementation |
| FE-03 Runtime Contract | FE-02 | Runtime states, commands, policies, projections | React/store/API implementation |
| FE-04 UI Composition | FE-03 projections | UI package structure | Business workflow interpretation |
| FE-05 Components/State | FE-03 state/projection contracts | Component and store implementation | Transition redefinition |
| FE-06 API Mapping | FE-03 commands/events | API boundary mapping | UI logic |
| FE-07 Runtime Wiring/Quality | FE-03 transitions/policies | Integration validation | Transition redesign |

---

## 13. Required Runtime Flows

### 13.1 API → Projection → UI

```text
API boundary
↓
Runtime server snapshot
↓
Runtime state builder
↓
WorkflowStep builder
↓
Policy snapshot
↓
Projection builder
↓
Controller hook
↓
UI package
```

### 13.2 Action → Policy → Command → Event

```text
UI package action
↓
Controller hook
↓
Policy check
↓
Command dispatch
↓
API / runtime boundary
↓
Runtime event
↓
Projection refresh
```

### 13.3 Scanner → Controller → Runtime

```text
Scanner event
↓
Controller hook
↓
Policy check
↓
Command dispatch
↓
Runtime/API boundary
↓
Projection refresh
```

---

## 14. Remaining Blockers / Open Policy Questions

These are not blockers for FE-04 composition, but must be resolved before production behavior is locked:

1. Whether bag receipt can advance with zero bags.
2. Whether all bags or at least one bag must be opened before counting.
3. Whether `Sort Type` is automatic when item types already exist or manual confirmation.
4. Whether color group is required, optional, or defaulted per item type/workflow mode.
5. Whether unresolved issues block data recording, return, or close.
6. Whether reopen/adjustment is supported after `CLOSED` in MVP.
7. Exact backend route and response envelope confirmation.

---

## 15. Done Interface for FE-04 / FE-05 / FE-07

FE-04 can derive UI Composition from:

- `WorkflowStep[]`
- `LaundryWorkDetailProjection`
- `ActionBarProjection`
- projection slot map

FE-05 can implement components without interpreting business workflow because:

- runtime states are enumerated
- projection models are declared
- UI does not calculate transitions

FE-07 can wire runtime without redefining transitions because:

- command names are declared
- event names are declared
- explicit transition table exists
- policy deny reasons are declared

Status: READY_FOR_UI_STATE_CONTROLLER_INTEGRATION_HANDOFF
