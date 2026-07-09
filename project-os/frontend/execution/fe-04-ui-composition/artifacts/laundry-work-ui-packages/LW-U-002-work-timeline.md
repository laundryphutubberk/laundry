# LW-U-002 WorkTimeline

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI

## TASK
Implement the Laundry Work timeline component.

## Target File
`frontend/src/features/laundry-works/components/WorkTimeline.tsx`

## Scope
- Render workflow steps
- Show completed/current/pending states
- Show safe next-step hint when provided
- Support compact mobile layout

## Dependencies
- `FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`
- `laundryWorkWorkflow.engine.ts`
- `laundryWorkProjection.ts`

## Inputs
- Timeline projection
- Current workflow step
- Step display metadata

## Outputs
- Presentational timeline component only

## Rules
- No transition calculation in JSX
- No policy decisions inside component
- No hardcoded backend enum interpretation beyond display mapping supplied by projection/model

## Acceptance Criteria
- Timeline renders all supported steps
- Current step is visually clear
- Mobile layout remains readable
- Component can render empty or unknown state safely
