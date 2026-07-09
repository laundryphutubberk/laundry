# Laundry Work Dashboard Screen Blueprint

Status: ACTIVE
Phase: FW-01-B

## Purpose
Provide a task-oriented dashboard for Laundry Workspace users to understand current operational workload and pick the next work item.

## User Goal
A user should see what needs attention first and enter the correct Laundry Work quickly.

## Layout Structure
1. Dashboard Header
2. Workload Summary
3. Priority Task Panel
4. Work Status Buckets
5. Recent Activity
6. Issue Highlights

## Component Tree
```text
LaundryWorkDashboardPage
  DashboardHeader
  WorkloadSummaryCards
  PriorityTaskPanel
  WorkStatusBucketSection
  RecentWorkSection
  IssueHighlightSection
```

## Runtime Dependencies
- dashboardRuntime.engine.ts for dashboard-level task ordering
- laundryWorkWorkflow.engine.ts for work status interpretation

## Projection Dependencies
- dashboardProjection.ts
- laundryWorkProjection.ts

## Policy Dependencies
- dashboard.policy.ts
- laundryWork.policy.ts
- workspace.policy.ts

## State Dependencies
- dashboard.store.ts
- laundryWork.store.ts

## API Dependencies
- dashboardApi.ts
- laundryWorkApi.ts

## Dashboard Rules
Dashboard must prioritize actionable work over static navigation.

## Empty State
If no active work exists, show an operational empty state with guidance for starting or receiving work.

## Loading State
Show lightweight dashboard skeletons for summary cards and task panels.

## Error State
Dashboard errors must not break the full workspace shell. Show recoverable panel-level errors where possible.

## Responsive Notes
Desktop may use multi-column cards. Mobile must show prioritized tasks first, then summaries.

## Forbidden Logic in UI
- Task ranking logic
- Workspace visibility filtering
- Work status interpretation
- API response mapping
