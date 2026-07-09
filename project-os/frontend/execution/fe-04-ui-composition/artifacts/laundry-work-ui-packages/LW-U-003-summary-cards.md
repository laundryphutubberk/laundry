# LW-U-003 SummaryCards

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI

## TASK
Implement Laundry Work summary cards.

## Target File
`frontend/src/features/laundry-works/components/WorkSummaryCards.tsx`

## Scope
- Render key work metrics
- Support cards for bags, total weight, counted items, and issues when available
- Use projection-provided labels and values
- Support loading/empty-safe display

## Dependencies
- `laundryWorkProjection.ts`
- `LaundryWorkDetail.blueprint.md`
- FE-04 UI Composition Standard

## Inputs
- Summary card projection

## Outputs
- Presentational summary card group

## Rules
- No metric calculation in component
- No API calls
- No direct store mutation
- No business-specific logic in shared UI

## Acceptance Criteria
- Cards render consistently across desktop/mobile
- Missing values degrade gracefully
- Values come from projection only
- Visual hierarchy is clear
