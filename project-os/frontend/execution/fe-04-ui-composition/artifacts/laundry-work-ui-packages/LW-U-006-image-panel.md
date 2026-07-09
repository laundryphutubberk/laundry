# LW-U-006 ImagePanel

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI

## TASK
Implement the Laundry Work image panel component.

## Target File
`frontend/src/features/laundry-works/components/ImagePanel.tsx`

## Scope
- Display work-related images or attachments when available
- Support empty image state
- Provide upload/view entry point only when policy output allows it
- Keep image UI separate from image API implementation

## Dependencies
- `LaundryWorkDetail.blueprint.md`
- `laundryWorkProjection.ts`
- `laundryWork.policy.ts`

## Inputs
- Image projection
- Policy-provided action availability

## Outputs
- Presentational image panel

## Rules
- No upload implementation
- No direct API calls
- No file processing logic
- No permission checks inside JSX

## Acceptance Criteria
- Renders image list or empty state safely
- Supports responsive gallery/list layout
- Action visibility comes from policy output
- Component remains presentation-only
