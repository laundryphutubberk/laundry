# LW-U-001 WorkHeader

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work header component from projection output.

## Target File

`frontend/src/features/laundry-works/components/WorkHeader.tsx`

## Runtime Contract Mapping

Uses projection output derived from:

```text
LaundryWorkDetailVM
- id
- workNo
- resortName
- currentStatus
- statusLabel
- receivedDateLabel
- returnedAtLabel optional
- closedAtLabel optional
- note optional

LaundryWorkViewModel.workspace
- workspaceType
- resortScoped

LaundryWorkViewModel.meta
- lastUpdatedAt
```

## Inputs

```text
work
  - id
  - workNo
  - resortName/customerName
  - status/currentStatus
  - receivedAt/receivedDateLabel
  - updatedAt/lastUpdatedAt
  - note/description
status
  - label
  - tone
workspace
  - workspaceLabel
  - resortName
meta
  - receivedAt
  - updatedAt
  - ownerName
actions optional
  - label
  - variant
  - disabled
  - onClick
loading optional
error optional
```

## Outputs

- Presentational screen header.
- Work identity area.
- Status badge display.
- Metadata cards.
- Header toolbar buttons when provided.

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
- Shows work number/status/resort/date/owner when provided.
- Loading and error states render safely.
- Responsive on desktop/tablet/mobile.
- Component remains presentation-only.
- FE-05 can pass controller/projection props without changing component boundary.
