# Issue Blueprint

Status: ACTIVE
Phase: FW-03-A

## Purpose
Own explicit issue reporting and issue management across laundry operations.

## User Goals
- Report damaged, missing, mismatch, or other operational issues
- View issue status clearly
- Resolve or track issue progress
- Keep issues visible without hiding them inside count or inventory screens

## Business Rule
Issues must be explicit. They are operational records, not comments hidden in another workflow.

## Primary Screens
- Issue Panel inside Laundry Work Detail
- Issue List / Management Page when needed
- Issue Detail Panel

## Runtime Ownership
- Issue creation eligibility
- Issue visibility
- Issue status action policy

## State Ownership
- Issue draft form state
- Issue filters
- Selected issue

## API Mapping
- List issues by workId
- Create issue
- Update issue status when backend contract is available
- Get issue detail when needed

## UI Component Plan
- IssuePanel
- IssueList
- IssueForm
- IssueStatusBadge
- IssueRuntimeHost

## Integration Plan
Issue feature must integrate with Laundry Work Detail and Dashboard without taking ownership of Laundry Work runtime.

## Quality Gate
Issue data must preserve workspace isolation and user-safe error handling.

## Regression Lock Criteria
Issue creation, display, and status visibility are stable within the owning workspace.
