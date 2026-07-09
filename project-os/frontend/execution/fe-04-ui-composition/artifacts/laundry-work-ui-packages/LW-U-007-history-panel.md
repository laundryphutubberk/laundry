# LW-U-007 HistoryPanel

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `project-os/frontend/execution/fe-03-runtime-contract/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work history panel component from `HistoryPanelProjection`.

## Target File

`frontend/src/features/laundry-works/components/HistoryPanel.tsx`

## Runtime Contract Mapping

Uses `historyPanel` from `LaundryWorkDetailProjection`:

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

Projection must convert raw status logs/events into display-safe events before this component receives them.

## Inputs

```text
historyPanel
  - events[]
  - emptyText
loading optional
error optional
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
- FE-05 can pass `HistoryPanelProjection` without component redesign.
