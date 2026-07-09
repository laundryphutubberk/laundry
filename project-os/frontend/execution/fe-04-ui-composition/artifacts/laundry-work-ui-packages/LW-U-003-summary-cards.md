# LW-U-003 WorkSummaryCards

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `project-os/frontend/execution/fe-03-runtime-contract/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement Laundry Work summary cards from `SummaryCardProjection[]`.

## Target File

`frontend/src/features/laundry-works/components/WorkSummaryCards.tsx`

## Runtime Contract Mapping

Uses `summaryCards` from `LaundryWorkDetailProjection`:

```ts
type SummaryCardProjection = {
  key: 'bag-count' | 'count-lines' | 'issue-count' | 'status' | string
  label: string
  value: string | number
  unit?: string
  tone?: 'default' | 'warning' | 'danger' | 'success'
  helperText?: string
}
```

## Inputs

```text
summaryCards[]
  - key
  - label
  - value
  - unit
  - tone
  - helperText
loading optional
error optional
emptyText optional
```

## Outputs

- Presentational KPI / summary card group.
- Safe display for missing values.
- Loading/error/empty-safe rendering.

## Rules

- No metric calculation in component.
- No count aggregation.
- No inventory logic.
- No API calls.
- No store access.
- No business-specific rules inside visual cards.
- Values, labels, units, and tones come from projection.

## Acceptance Criteria

- Cards render consistently across desktop/tablet/mobile.
- Missing values degrade gracefully.
- Loading and error states render safely.
- Values come from `SummaryCardProjection[]` only.
- FE-05 can pass `summaryCards` without changing component boundary.
