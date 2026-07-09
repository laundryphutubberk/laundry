# LW-U-004 CountTable

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `project-os/frontend/execution/fe-03-runtime-contract/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work count table component from `CountTableProjection`.

## Target File

`frontend/src/features/laundry-works/components/CountTable.tsx`

## Runtime Contract Mapping

Uses `countTable` from `LaundryWorkDetailProjection`:

```ts
type CountTableProjection = {
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' | 'center' }>
  rows: Array<Record<string, string | number | null | undefined>>
  emptyText: string
}
```

## Inputs

```text
countTable
  - columns[]
  - rows[]
  - emptyText
loading optional
error optional
title optional
```

## Outputs

- Presentational count table on desktop.
- Responsive card/list fallback on mobile.
- Explicit empty/loading/error states.

## Rules

- No count aggregation in component.
- No inventory truth calculation.
- No API calls.
- No store access.
- No workspace visibility logic.
- No Prisma/backend field dependency.
- Component displays projection-provided rows only.

## Acceptance Criteria

- Table is readable on desktop.
- Mobile fallback is usable without horizontal dependency.
- Empty count state is explicit.
- Loading/error states render safely.
- Row values and column labels come from `CountTableProjection` only.
- FE-05 can pass count table projection directly without UI refactor.
