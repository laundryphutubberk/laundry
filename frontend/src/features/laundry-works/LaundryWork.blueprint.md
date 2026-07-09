# Laundry Work Blueprint

Status: ACTIVE
Phase: FW-01-A

## Purpose
The operational center of the laundry workflow. Owns the lifecycle of a laundry work from intake through completion.

## User Goals
- View current work status
- Execute the next workflow step
- Manage bags, counting, issues, notes, images, and history
- Complete work safely with clear operational guidance

## Business Flow
1. Intake
2. Open Bag
3. Count Items
4. Classify
5. Processing
6. Verification
7. Ready to Return
8. Completed

## Primary Screens
- Laundry Work Dashboard
- Laundry Work List
- Laundry Work Detail
- Laundry Work Timeline

## Runtime Ownership
- Workflow Engine
- Runtime Host
- Projection Layer
- Policy Layer

## State Ownership
- Runtime State
- Draft State
- UI State
- Feature-local State

## API Mapping
- Laundry Work
- Laundry Bags
- Issues
- Timeline
- Attachments

## UI Component Plan
- WorkHeader
- WorkTimeline
- SummaryCards
- CountTable
- IssuePanel
- ImagePanel
- HistoryPanel
- BottomActionBar

## Integration Plan
Follow FE-06 Integration Standard.

## Quality Gate
Follow FE-07 Quality Standard.

## Performance Gate
Follow FE-08 Performance Standard.

## Regression Lock Criteria
The feature is considered regression-locked only after workflow, runtime, state, integration, and UI pass their defined quality gates.
