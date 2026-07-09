# LW-U-007 HistoryPanel

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI

## TASK
Implement the Laundry Work history panel component.

## Target File
`frontend/src/features/laundry-works/components/HistoryPanel.tsx`

## Scope
- Display work timeline/history entries when available
- Show user-safe event labels and timestamps
- Support empty history state
- Support compact layout inside Laundry Work Detail

## Dependencies
- `laundryWorkProjection.ts`
- `LaundryWorkDetail.blueprint.md`
- FE-04 UI Composition Standard

## Inputs
- History projection

## Outputs
- Presentational history panel

## Rules
- No timeline derivation in component
- No API calls
- No audit/business interpretation inside JSX
- No workspace filtering logic

## Acceptance Criteria
- History entries render in stable order from projection
- Empty state is clear
- Mobile layout remains readable
- Component is presentation-only
