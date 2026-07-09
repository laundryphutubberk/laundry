# LW-U-002 WorkTimeline

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `project-os/frontend/execution/fe-03-runtime-contract/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work workflow timeline component from `WorkflowTimelineProjection`.

## Target File

`frontend/src/features/laundry-works/components/WorkTimeline.tsx`

## Runtime Contract Mapping

Uses `WorkflowTimelineProjection` from `LaundryWorkDetailProjection`:

```ts
type WorkflowTimelineProjection = {
  steps: WorkflowStep[]
  currentStepKey?: WorkflowStepKey
  nextHint?: string
}
```

`WorkflowStep.state` may be:

```text
completed | current | pending | blocked | cancelled | disabled
```

## Inputs

```text
workflowTimeline
  - steps[]
  - currentStepKey
  - nextHint
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
- FE-05 can pass `WorkflowTimelineProjection` without component redesign.
