# FE-03 Laundry Work Runtime Contract Foundation

Status: READY_FOR_FE_04
Execution Domain: FE-03 Runtime Contract
Feature Cell: Laundry Work

## Purpose

แปลง Operational Workflow ของ Laundry Work ให้เป็น Runtime Contract ที่ FE-04 สามารถนำไปแตก UI package ได้ทันที โดยไม่ต้องเดา workflow, state, command, event, policy หรือ projection ที่ UI ต้องใช้

เอกสารนี้เป็น contract เท่านั้น ไม่ใช่ implementation

---

## 1. Runtime Boundary

Laundry Work Runtime เป็น runtime boundary สำหรับหน้าที่เกี่ยวกับ lifecycle ของงานซักตั้งแต่รับถุงจนปิดงาน

Owns:

- Current Laundry Work runtime state
- Workflow step model
- UI-facing projection contract
- Command contract for user/scanner actions
- Runtime event contract
- Policy contract for action eligibility

Does not own:

- Backend source of truth
- Inventory truth
- Bag-as-inventory interpretation
- Issue resolution truth outside approved issue contract
- Business rules not defined by Blueprint / schema / API contract

---

## 2. Operational Workflow → WorkflowStep

### WorkflowStep Type

```ts
type WorkflowStep = {
  key: WorkflowStepKey
  label: string
  description?: string
  backendStatus: WorkStatus
  state: 'completed' | 'current' | 'pending' | 'blocked' | 'cancelled' | 'disabled'
  command?: LaundryWorkCommandType
  requiredPolicy?: LaundryWorkPolicyKey
  projectionSlot: ProjectionSlot
}
```

### WorkflowStepKey

```ts
type WorkflowStepKey =
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

### WorkStatus

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

### WorkflowStep Contract

| Step Key | Backend Status | Command | Projection Slot |
|---|---|---|---|
| `receive_bags` | `BAG_RECEIVED` | `RECEIVE_BAGS` | `summaryCards`, `timeline`, `actionBar` |
| `factory_receive` | `FACTORY_RECEIVED` | `MARK_FACTORY_RECEIVED` | `timeline`, `actionBar` |
| `open_bag` | `BAG_OPENED` | `OPEN_BAG` | `timeline`, `mainTaskPanel`, `bagPanel` |
| `count_items` | `ITEM_COUNTED` | `RECORD_COUNT_LINES` | `countTable`, `summaryCards`, `actionBar` |
| `sort_type` | `TYPE_SORTED` | `MARK_TYPE_SORTED` | `mainTaskPanel`, `timeline` |
| `sort_color` | `COLOR_SORTED` | `MARK_COLOR_SORTED` | `mainTaskPanel`, `timeline` |
| `record_data` | `DATA_RECORDED` | `RECORD_WORK_DATA` | `summaryCards`, `historyPanel`, `actionBar` |
| `return_work` | `RETURNED` | `RETURN_WORK` | `timeline`, `actionBar` |
| `close_work` | `CLOSED` | `CLOSE_WORK` | `timeline`, `summaryCards`, `actionBar` |

Rules:

- UI must render workflow from `WorkflowStep[]`
- UI must not calculate current step from status by itself
- Current step is provided by runtime projection
- Terminal states are `CLOSED` and `CANCELLED`

---

## 3. Runtime State

### LaundryWorkRuntimeState

```ts
type LaundryWorkRuntimeState = {
  workId?: string | number
  workspaceScope: WorkspaceScope
  server: LaundryWorkServerSnapshot
  client: LaundryWorkClientState
  runtime: LaundryWorkTransientState
  policy: LaundryWorkPolicySnapshot
  request: LaundryWorkRequestState
}
```

### WorkspaceScope

```ts
type WorkspaceScope =
  | { workspaceType: 'LAUNDRY'; role?: string }
  | { workspaceType: 'RESORT'; resortId: number; role?: string }
```

### LaundryWorkServerSnapshot

```ts
type LaundryWorkServerSnapshot = {
  detail?: LaundryWorkDetailDTO | null
  list?: LaundryWorkSummaryDTO[]
  lastSyncedAt?: string
}
```

Server snapshot is read-only from UI perspective. UI must not mutate it.

### LaundryWorkClientState

```ts
type LaundryWorkClientState = {
  activePanelId?: 'overview' | 'bags' | 'count' | 'issues' | 'history' | 'images'
  selectedBagId?: string | number
  selectedIssueId?: string | number
  selectedCountLineId?: string | number
  expandedBagIds: Array<string | number>
}
```

### LaundryWorkTransientState

```ts
type LaundryWorkTransientState = {
  currentMode: 'viewing' | 'counting' | 'issue-review' | 'return-prep'
  scannerSession?: ScannerSession
  pendingCommand?: LaundryWorkCommandType
  warning?: RuntimeWarning
}
```

### LaundryWorkRequestState

```ts
type LaundryWorkRequestState = {
  loading: boolean
  empty: boolean
  error?: RuntimeError | null
  requestId?: string
  retryable?: boolean
}
```

State Rules:

- Runtime state must not become backend truth
- Feature store may hold IDs, panel state, and transient runtime state only
- Server data belongs to API/cache boundary
- Loading, Empty, Error must flow into projection before UI

---

## 4. Commands

### LaundryWorkCommand

```ts
type LaundryWorkCommand = {
  type: LaundryWorkCommandType
  workId?: string | number
  payload?: unknown
  meta: CommandMeta
}
```

### LaundryWorkCommandType

```ts
type LaundryWorkCommandType =
  | 'LOAD_WORK_DETAIL'
  | 'REFRESH_WORK_DETAIL'
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

### CommandMeta

```ts
type CommandMeta = {
  requestId: string
  source: 'ui' | 'scanner' | 'route' | 'runtime'
  actorId?: string | number
  actorRole?: string
  workspaceScope: WorkspaceScope
  createdAt: string
}
```

Command Rules:

- UI may request commands only through controller hook
- Controller must run policy before dispatching command
- Engine/API boundary executes command after policy allows it
- UI must not call API/store directly
- Commands must preserve `requestId` and workspace scope

---

## 5. Events

### LaundryWorkRuntimeEvent

```ts
type LaundryWorkRuntimeEvent = {
  type: LaundryWorkRuntimeEventType
  workId?: string | number
  payload?: unknown
  meta: RuntimeEventMeta
}
```

### LaundryWorkRuntimeEventType

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
  | 'PROJECTION_UPDATED'
  | 'WORKSPACE_SCOPE_CHANGED'
  | 'SELECTION_CHANGED'
  | 'SCANNER_EVENT_RECEIVED'
```

### RuntimeEventMeta

```ts
type RuntimeEventMeta = {
  requestId?: string
  occurredAt: string
  source: 'controller' | 'policy' | 'engine' | 'api' | 'projection' | 'scanner'
}
```

Event Rules:

- Events describe runtime activity, not business truth
- UI may react only to projected state, not raw events
- Events must not bypass policy
- Error events must preserve safe error message and requestId

---

## 6. Policies

### LaundryWorkPolicyKey

```ts
type LaundryWorkPolicyKey =
  | 'canViewWorkDetail'
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

### Policy Input

```ts
type LaundryWorkPolicyInput = {
  policyKey: LaundryWorkPolicyKey
  commandType?: LaundryWorkCommandType
  work?: LaundryWorkSummaryDTO | LaundryWorkDetailDTO | null
  workspaceScope: WorkspaceScope
  runtimeState: LaundryWorkRuntimeState
}
```

### Policy Result

```ts
type LaundryWorkPolicyResult = {
  allowed: boolean
  reasonCode?: PolicyDenyReason
  message?: string
  safeForUI: boolean
}
```

### PolicyDenyReason

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
  | 'TERMINAL_WORK'
  | 'BACKEND_CONTRACT_REQUIRED'
```

Policy Rules:

- Resort Workspace may view only its own `resortId`
- Mutation commands require ready work detail
- Terminal work blocks mutation commands unless backend contract explicitly allows action
- Policy determines action eligibility; UI only renders policy output
- Policy must not call API or mutate state

---

## 7. Projection Required by UI

FE-04 UI packages must consume these projection slots only

### LaundryWorkDetailProjection

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

### WorkHeaderProjection

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

### WorkflowTimelineProjection

```ts
type WorkflowTimelineProjection = {
  steps: WorkflowStep[]
  currentStepKey?: WorkflowStepKey
  nextHint?: string
}
```

### SummaryCardProjection

```ts
type SummaryCardProjection = {
  key: string
  label: string
  value: string | number
  unit?: string
  tone?: 'default' | 'warning' | 'danger' | 'success'
  helperText?: string
}
```

### MainTaskPanelProjection

```ts
type MainTaskPanelProjection = {
  activeStepKey?: WorkflowStepKey
  title: string
  description?: string
  mode: 'read-only' | 'interactive' | 'blocked'
  blockerReason?: string
}
```

### CountTableProjection

```ts
type CountTableProjection = {
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' | 'center' }>
  rows: Array<Record<string, string | number | null | undefined>>
  emptyText: string
}
```

### IssuePanelProjection

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

### ImagePanelProjection

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

### HistoryPanelProjection

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

### ActionBarProjection

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

- UI packages consume projection only
- UI packages must not calculate business metrics
- UI packages must not map backend status themselves
- UI packages must not call policy directly
- Projection may derive display labels but not source-of-truth values

---

## 8. UI Package Handoff Map

| FE-04 UI Package | Required Projection |
|---|---|
| Work Header | `workHeader` |
| Workflow Timeline | `workflowTimeline.steps`, `workflowTimeline.nextHint` |
| Summary Cards | `summaryCards` |
| Main Task Panel | `mainTaskPanel` |
| Count Table | `countTable.columns`, `countTable.rows` |
| Issue Panel | `issuePanel.issues`, `issuePanel.canCreateIssue` |
| Image Panel | `imagePanel.images`, `imagePanel.canUploadImage` |
| History Panel | `historyPanel.events` |
| Bottom Action Bar | `actionBar` |

---

## 9. Required Runtime Flow

### API → Projection → UI

```text
API boundary
↓
Runtime server snapshot
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

### Action → Policy → Command → Event

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

---

## 10. FE-04 Done Interface

FE-04 can begin immediately when it uses this interface:

```ts
type LaundryWorkDetailRuntimeView = {
  projection: LaundryWorkDetailProjection
  actions: ActionBarProjection
  state: LaundryWorkRequestState
}
```

FE-04 must not require:

- raw API response
- direct store access
- direct policy invocation
- status transition calculation in JSX
- business-specific logic inside presentational components

---

## 11. Done Criteria

- WorkflowStep contract exists
- Runtime State contract exists
- Commands contract exists
- Events contract exists
- Policies contract exists
- UI projection slots are specified
- FE-04 package handoff map is specified
- Contract does not implement runtime logic
- Contract does not write React UI

Status: READY_FOR_FE_04_UI_PACKAGE_SPLIT
