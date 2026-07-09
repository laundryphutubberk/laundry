# LW-U-009 MainTaskPanel

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `project-os/frontend/execution/fe-03-runtime-contract/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work main task panel from `MainTaskPanelProjection`.

## Target File

`frontend/src/features/laundry-works/components/MainTaskPanel.tsx`

## Runtime Contract Mapping

Uses `MainTaskPanelProjection` from `LaundryWorkDetailProjection`:

```ts
type MainTaskPanelProjection = {
  activeStepKey?: WorkflowStepKey
  title: string
  description?: string
  mode: 'read-only' | 'interactive' | 'blocked'
  blockerReason?: string
}
```

This package represents the current operational focus area. It does not decide which step is active; FE-03 projection supplies that.

## Inputs

```text
mainTaskPanel
  - activeStepKey
  - title
  - description
  - mode
  - blockerReason
loading optional
error optional
emptyText optional
```

## Outputs

- Presentational current task panel.
- Read-only / interactive / blocked visual mode.
- Safe display of blocker reason when provided.

## Rules

- No workflow calculation.
- No command dispatching.
- No action eligibility logic.
- No API calls.
- No store access.
- No runtime engine access.
- No business logic.
- Component displays projection-provided task state only.

## Acceptance Criteria

- Current task title and description render clearly.
- `read-only`, `interactive`, and `blocked` modes are visually distinct.
- Blocker reason displays only when provided by projection.
- Empty/loading/error states render safely.
- FE-05 can wire `MainTaskPanelProjection` without changing component boundary.
