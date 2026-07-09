# LW-U-003 WorkSummaryCards

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement Laundry Work summary cards from UI-ready projection metrics.

## Target File

`frontend/src/features/laundry-works/components/WorkSummaryCards.tsx`

## Runtime Contract Mapping

Uses projection output from:

```text
LaundryWorkViewModel.detail
- bagsSummary
- countSummary
- issueSummary
- loading
- error
```

Projection is responsible for creating display labels, units, formatted values, and tones.

## Inputs

```text
items[]
  - id/key
  - label
  - value
  - unit
  - description/helperText
  - tone
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
- Values come from projection only.
- FE-05 can map `bagsSummary`, `countSummary`, and `issueSummary` into this package without changing component boundaries.
