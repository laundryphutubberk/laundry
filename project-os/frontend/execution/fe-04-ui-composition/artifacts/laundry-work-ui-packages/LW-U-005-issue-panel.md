# LW-U-005 IssuePanel

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI

## TASK
Implement the Laundry Work issue panel component.

## Target File
`frontend/src/features/laundry-works/components/IssuePanel.tsx`

## Scope
- Display work-related issue summary
- Show issue list or compact issue status
- Provide action entry point only when policy output allows it
- Integrate visually with Laundry Work Detail

## Dependencies
- `Issue.blueprint.md`
- `laundryWorkProjection.ts`
- `laundryWork.policy.ts`

## Inputs
- Issue projection
- Policy-provided action availability

## Outputs
- Presentational issue panel

## Rules
- No issue workflow logic
- No direct issue API calls
- No issue status mutation
- No hidden issue state inside component

## Acceptance Criteria
- Issues are explicit and visible
- Empty issue state is clear
- Action visibility comes from policy output
- Component does not own issue domain logic
