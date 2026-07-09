# LW-U-004 CountTable

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI

## TASK
Implement the Laundry Work count table component.

## Target File
`frontend/src/features/laundry-works/components/CountTable.tsx`

## Scope
- Render counted items by type/category/color when projection provides data
- Display quantity and weight columns when available
- Support empty and loading states
- Support mobile card alternative if table is too dense

## Dependencies
- `laundryWorkProjection.ts`
- `FE-04-UI-COMPOSITION.md`
- `LaundryWorkDetail.blueprint.md`

## Inputs
- Count table projection rows
- Column metadata

## Outputs
- Presentational count table or responsive card list

## Rules
- No count aggregation in component
- No API calls
- No inventory logic
- No workspace visibility logic

## Acceptance Criteria
- Table is readable on desktop
- Mobile fallback is usable
- Empty count state is explicit
- Row values come from projection only
