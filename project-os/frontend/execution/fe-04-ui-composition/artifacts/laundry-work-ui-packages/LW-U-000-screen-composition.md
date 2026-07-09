# LW-U-000 Laundry Work Detail Screen Composition

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Composition Package
Runtime Source: `project-os/frontend/execution/fe-03-runtime-contract/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Compose the Laundry Work Detail screen from FE-03 projection, policy, and controller outputs.

## Target Files

```text
frontend/src/features/laundry-works/pages/LaundryWorkDetailPage.tsx
frontend/src/features/laundry-works/dev/laundryWorkDetail.preview.tsx
```

## Runtime Contract Mapping

FE-03 declares the UI projection boundary:

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

FE-04 consumes only:

```text
WorkflowStep[]
LaundryWorkDetailProjection
ActionBarProjection
projection slot map
```

## Screen Composition

```text
LaundryWorkDetailPage
↓
WorkHeader                 from workHeader slot
↓
WorkSummaryCards           from summaryCards slot
↓
WorkTimeline + Main Content
  ↓
  WorkTimeline             from workflowTimeline slot
  ↓
  MainTaskPanel            from mainTaskPanel slot
  ↓
  CountTable               from countTable slot
  ↓
  IssuePanel               from issuePanel slot
  ↓
  ImagePanel               from imagePanel slot
  ↓
  HistoryPanel             from historyPanel slot
↓
BottomActionBar            from actionBar slot
```

## Component Packages

```text
LW-U-001 WorkHeader
LW-U-002 WorkTimeline
LW-U-003 WorkSummaryCards
LW-U-004 CountTable
LW-U-005 IssuePanel
LW-U-006 ImagePanel
LW-U-007 HistoryPanel
LW-U-008 BottomActionBar
LW-U-009 MainTaskPanel
```

## Inputs

Inputs must be supplied by projection / policy / controller props:

```text
LaundryWorkDetailProjection.loading
LaundryWorkDetailProjection.empty
LaundryWorkDetailProjection.error
LaundryWorkDetailProjection.requestId
LaundryWorkDetailProjection.workHeader
LaundryWorkDetailProjection.workflowTimeline
LaundryWorkDetailProjection.summaryCards
LaundryWorkDetailProjection.mainTaskPanel
LaundryWorkDetailProjection.countTable
LaundryWorkDetailProjection.issuePanel
LaundryWorkDetailProjection.imagePanel
LaundryWorkDetailProjection.historyPanel
LaundryWorkDetailProjection.actionBar
```

## Outputs

- Screen-level UI composition.
- Component props mapped from projection/action/state model.
- Empty/loading/error display routing.
- No direct API/store/runtime access.

## Rules

- No API calls.
- No store access.
- No runtime engine access.
- No backend calls.
- No business logic.
- No workflow transition calculation.
- No policy decision inside screen JSX.
- No resort/workspace filtering inside UI.
- No business metric calculation inside UI.
- Composition may choose layout order only.

## Responsive Rules

### Desktop

```text
Header
SummaryCards
Timeline | Main Content
BottomActionBar
```

### Tablet

```text
Header
SummaryCards
Timeline
Main Content
BottomActionBar
```

### Mobile

```text
Header
SummaryCards
Timeline compact
Main Content stacked
Sticky BottomActionBar
```

## Acceptance Criteria

- Laundry Work Detail renders from `LaundryWorkDetailProjection` and `ActionBarProjection` only.
- Child packages LW-U-001 through LW-U-009 are composed in the required order.
- Empty/loading/error state can be passed through safely.
- Screen remains responsive on desktop, tablet, and mobile.
- FE-05 can connect controller output without changing presentation component boundaries.
