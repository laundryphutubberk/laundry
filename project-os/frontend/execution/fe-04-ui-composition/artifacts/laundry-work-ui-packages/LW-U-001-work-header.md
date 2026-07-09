# LW-U-001 WorkHeader

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `project-os/frontend/execution/fe-03-runtime-contract/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work header component from `WorkHeaderProjection`.

## Target File

`frontend/src/features/laundry-works/components/WorkHeader.tsx`

## Runtime Contract Mapping

Uses `WorkHeaderProjection` from `LaundryWorkDetailProjection`:

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

## Inputs

```text
workHeader
  - workNo
  - resortName
  - statusLabel
  - description
  - receivedAtLabel
  - updatedAtLabel
loading optional
error optional
headerActions optional from controller/policy projection
```

## Outputs

- Presentational screen header.
- Work identity area.
- Status badge display.
- Metadata display.
- Header toolbar buttons when provided by controller/policy projection.

## Rules

- No API calls.
- No store access.
- No workflow calculation.
- No status transition logic.
- No workspace filtering logic.
- No policy checks inside component.
- Header actions only call provided handlers.

## Acceptance Criteria

- Renders safely with partial projection data.
- Shows work number/status/resort/date when provided.
- Loading and error states render safely.
- Responsive on desktop/tablet/mobile.
- Component remains presentation-only.
- FE-05 can pass `WorkHeaderProjection` without changing component boundary.
