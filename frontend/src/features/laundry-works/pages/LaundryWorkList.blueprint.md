# Laundry Work List Screen Blueprint

Status: ACTIVE
Phase: FW-01-B

## Purpose
Provide a searchable and filterable list of Laundry Work records for operational navigation.

## User Goal
A user should find the correct Laundry Work quickly by status, resort, date, or operational priority.

## Layout Structure
1. List Header
2. Filter Bar
3. Status Tabs or Buckets
4. Work List Table / Cards
5. Pagination or Infinite Load Boundary
6. Empty / Loading / Error States

## Component Tree
```text
LaundryWorkListPage
  WorkListHeader
  WorkFilterBar
  WorkStatusTabs
  WorkListTable
  WorkListCardCollection
  WorkListPagination
```

## Runtime Dependencies
- laundryWorkWorkflow.engine.ts for status labels and status grouping

## Projection Dependencies
- laundryWorkProjection.ts

## Policy Dependencies
- laundryWork.policy.ts
- workspace.policy.ts

## State Dependencies
- laundryWork.store.ts

## API Dependencies
- laundryWorkApi.ts

## List Rules
The list must never expose work outside the active workspace boundary.

## Empty State
Show filtered-empty state when filters hide all results, and no-work state when no records exist.

## Loading State
Initial load uses page-level placeholder. Filter changes may use inline loading state.

## Error State
Show recoverable list error with retry action and requestId if available.

## Responsive Notes
Desktop may use table layout. Mobile should use work cards with status and next action summary.

## Forbidden Logic in UI
- Workspace filtering
- API response mapping
- Status grouping calculation
- Permission checks
