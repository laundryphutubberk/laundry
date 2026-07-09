# Dashboard Blueprint

Status: ACTIVE
Phase: FW-05-A

## Purpose
Own task-oriented dashboard surfaces for Laundry Workspace and Resort Workspace.

## User Goals
- See the most important operational tasks first
- Enter the correct work quickly
- Understand current workload and issues
- View workspace-appropriate information only

## Business Rule
Dashboard is task-oriented. It is not a static menu page.

## Primary Screens
- Laundry Workspace Dashboard
- Resort Workspace Dashboard
- Workload Summary
- Priority Task Panel

## Runtime Ownership
- Dashboard task ranking
- Widget visibility
- Workspace-specific dashboard projection

## State Ownership
- Dashboard filters
- Selected date/range
- Panel UI state

## API Mapping
- Dashboard summary
- Priority work items
- Issue highlights
- Inventory highlights when available

## UI Component Plan
- DashboardTaskPanel
- WorkloadSummaryCards
- PriorityTaskPanel
- DashboardRuntimeHost

## Integration Plan
Dashboard composes projections from Laundry Work, Issues, Inventory, and Workspace through approved boundaries only.

## Quality Gate
Dashboard must not bypass workspace isolation or directly import internal feature logic.

## Regression Lock Criteria
Dashboard renders actionable task summaries correctly per workspace type.
