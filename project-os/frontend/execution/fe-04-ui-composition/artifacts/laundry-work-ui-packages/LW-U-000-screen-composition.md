# LW-U-000 Laundry Work Detail Screen Composition

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Composition Package
Runtime Source: `project-os/frontend/execution/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Compose the Laundry Work Detail screen from projection, policy, and controller outputs.

## Target Files

```text
frontend/src/features/laundry-works/pages/LaundryWorkDetailPage.tsx
frontend/src/features/laundry-works/dev/laundryWorkDetail.preview.tsx
```

## Runtime Contract Mapping

FE-03 defines that UI must consume controller output only:

```text
Runtime State
↓
Workflow Projection
↓
Policy Results
↓
LaundryWorkProjection
↓
Controller Output
↓
UI Composition
```

This package maps that output into the screen composition below.

## Screen Composition

```text
LaundryWorkDetailPage
↓
WorkHeader
↓
WorkSummaryCards
↓
WorkTimeline + Main Content
  ↓
  CountTable
  ↓
  IssuePanel
  ↓
  ImagePanel
  ↓
  HistoryPanel
↓
BottomActionBar
```

## Inputs

Inputs must be supplied by projection / policy / controller props:

```text
projection.work
projection.status
projection.workspace
projection.meta
projection.summaryCards
projection.timeline
projection.nextHint
projection.countColumns
projection.countRows
projection.issues
projection.images
projection.history
actions.work
actions.issue
actions.image
state.loading
state.error
state.actionStatus
```

## Outputs

- Screen-level UI composition.
- Child component props passed from projection/action/state model.
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

- Laundry Work Detail renders from projection/controller props only.
- Child packages LW-U-001 through LW-U-008 are composed in the required order.
- Empty/loading/error state can be passed through safely.
- Screen remains responsive on desktop, tablet, and mobile.
- FE-05 can connect controller output without changing presentation component boundaries.
