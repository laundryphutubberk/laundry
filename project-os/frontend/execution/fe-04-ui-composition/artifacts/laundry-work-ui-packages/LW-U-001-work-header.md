# LW-U-001 WorkHeader

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI

## TASK
Implement the Laundry Work header component.

## Target File
`frontend/src/features/laundry-works/components/WorkHeader.tsx`

## Scope
- Display work identity
- Display current status label
- Display resort/customer context when available
- Display created/updated metadata when available
- Provide a compact summary for the current work

## Dependencies
- `LaundryWorkDetail.blueprint.md`
- `laundryWorkProjection.ts`
- `laundryWork.policy.ts`

## Inputs
- Laundry Work projection
- Workspace context
- Status display metadata

## Outputs
- Presentational header component only

## Rules
- No API calls
- No workflow calculation
- No direct status transition logic
- No workspace filtering logic

## Acceptance Criteria
- Renders safely with partial projection data
- Responsive on desktop and mobile
- Does not own business logic
- Uses feature-owned types or projection output only
