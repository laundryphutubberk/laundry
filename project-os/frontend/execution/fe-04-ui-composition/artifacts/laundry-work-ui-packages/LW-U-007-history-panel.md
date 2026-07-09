# LW-U-007 HistoryPanel

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work history panel component from projected status log / activity history.

## Target File

`frontend/src/features/laundry-works/components/HistoryPanel.tsx`

## Runtime Contract Mapping

Uses projection output from:

```text
LaundryWorkDetailDTO
- statusLogs

LaundryWorkViewModel.detail
- timeline
- loading
- error
```

Projection must convert raw logs/status history into display-safe events before this component receives them.

## Inputs

```text
events[]
  - id
  - label/title/eventLabel
  - description/note
  - timestamp/createdAt/time
  - actorName
loading optional
error optional
emptyText optional
```

## Outputs

- Presentational work history panel.
- Read-only activity timeline.
- Empty/loading/error-safe states.

## Rules

- No timeline derivation in component.
- No audit/business interpretation inside JSX.
- No API calls.
- No store access.
- No workspace filtering logic.
- Event order comes from projection.
- Component must not become workflow control.

## Acceptance Criteria

- History entries render in stable projection order.
- Empty state is clear.
- Loading/error states render safely.
- Mobile layout remains readable.
- Component is presentation-only.
- FE-05 can pass projected status logs without component redesign.
