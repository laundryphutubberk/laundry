# Laundry Work Detail Screen Blueprint

Status: ACTIVE
Phase: FW-01-B

## Purpose
Provide the primary operational screen for executing a Laundry Work through its current workflow step.

## User Goal
A user should understand the current work status, review important work data, and execute the next safe action without navigating away.

## Layout Structure
1. Work Header
2. Workflow Timeline
3. Summary Cards
4. Main Operational Section
5. Supporting Panels
6. Bottom Action Bar

## Component Tree
```text
LaundryWorkDetailPage
  WorkHeader
  WorkTimeline
  WorkSummaryCards
  WorkMainSection
    CountTable
    CurrentStepPanel
  WorkSupportingPanels
    NotesPanel
    HistoryPanel
    ImagePanel
    IssuePanel
  BottomActionBar
```

## Runtime Dependencies
- laundryWorkWorkflow.engine.ts
- laundryWorkRuntime.engine.ts
- LaundryWorkRuntimeHost.tsx

## Projection Dependencies
- laundryWorkProjection.ts

## Policy Dependencies
- laundryWork.policy.ts

## State Dependencies
- laundryWork.store.ts

## API Dependencies
- laundryWorkApi.ts

## Action Bar Rules
The bottom action bar must render actions from policy output only. UI must not decide action eligibility directly.

Expected actions:
- Back
- Save Draft
- Continue Next Step

## Empty State
Show work-not-found or no-operational-data state through shared EmptyState when data is missing.

## Loading State
Use route-level loading placeholder until work detail projection is ready.

## Error State
Show user-safe error and preserve backend requestId when available.

## Responsive Notes
Desktop layout may show timeline and content side by side. Mobile layout should stack timeline above content and keep action bar reachable.

## Forbidden Logic in UI
- Status transition calculation
- CTA eligibility
- Workspace visibility decisions
- API response mapping
