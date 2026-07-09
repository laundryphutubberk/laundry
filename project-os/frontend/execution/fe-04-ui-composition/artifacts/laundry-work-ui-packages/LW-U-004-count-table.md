# LW-U-004 CountTable

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work count table component from projection rows and column metadata.

## Target File

`frontend/src/features/laundry-works/components/CountTable.tsx`

## Runtime Contract Mapping

Uses projection output from detail data:

```text
LaundryWorkDetailDTO
- countLines

LaundryWorkViewModel.detail
- countSummary
```

Projection must convert raw count lines into UI rows and columns before this component receives them.

## Inputs

```text
rows[]
  - id
  - display fields by column key
columns[]
  - key
  - label
  - align
loading optional
error optional
emptyText optional
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
- Row values and column labels come from projection only.
- FE-05 can pass count-line view models directly without UI refactor.
