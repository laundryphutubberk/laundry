# LW-U-002 WorkTimeline

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work workflow timeline component from workflow projection output.

## Target File

`frontend/src/features/laundry-works/components/WorkTimeline.tsx`

## Runtime Contract Mapping

Uses `LaundryWorkWorkflowProjection`:

```text
currentStatus
currentStepKey
steps[]
  - key
  - status
  - backendStatus
  - isCompleted
  - isCurrent
  - isPending
nextActionKeys[]
terminal
  - isClosed
  - isCancelled
```

Projection may convert the runtime workflow shape into UI-ready step objects before passing to this component.

## Inputs

```text
steps[]
  - id/key
  - label/name
  - state
  - description/helperText
  - completedAt
  - actorName
nextHint optional
loading optional
error optional
emptyText optional
```

## Outputs

- Presentational workflow timeline.
- Completed/current/pending/blocked/cancelled/disabled visual states.
- Optional next-step hint from projection.

## Rules

- No transition calculation in JSX.
- No backend enum interpretation in component.
- No policy decisions inside component.
- No action dispatching.
- No API/store/runtime access.
- Component renders what projection provides.

## Acceptance Criteria

- Timeline renders all projected steps in order.
- Current step is visually clear.
- Completed/pending states are distinct.
- Empty/loading/error states render safely.
- Mobile layout remains readable.
- FE-05 can replace mock timeline with workflow projection without component redesign.
