# LW-U-008 BottomActionBar

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI

## TASK
Implement the Laundry Work bottom action bar component.

## Target File
`frontend/src/features/laundry-works/components/BottomActionBar.tsx`

## Scope
- Render primary and secondary actions for Laundry Work Detail
- Support Back, Save Draft, and Continue Next Step when policy output allows them
- Keep action placement reachable on desktop and mobile
- Support disabled/loading states supplied by controller/runtime

## Dependencies
- `laundryWork.policy.ts`
- `useLaundryWorkController.ts`
- `LaundryWorkDetail.blueprint.md`

## Inputs
- Policy-derived action model
- Controller action handlers
- Loading/disabled state

## Outputs
- Presentational action bar component

## Rules
- No CTA eligibility logic in component
- No direct status mutation
- No API calls
- No navigation decision beyond calling provided handlers

## Acceptance Criteria
- Primary action is visually clear
- Disabled/loading states are safe
- Mobile action bar remains reachable
- Action eligibility comes from policy/controller only
