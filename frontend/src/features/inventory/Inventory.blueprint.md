# Inventory Blueprint

Status: ACTIVE
Phase: FW-04-A

## Purpose
Own linen inventory visibility and movement-derived read models.

## User Goals
- View current linen inventory summary
- Understand movement history
- See resort-scoped inventory data safely
- Avoid manual inventory entry unless explicitly approved as adjustment workflow

## Business Rule
Inventory is calculated from work and movement history. It is not a direct manual input surface.

## Primary Screens
- Inventory Summary Page
- Movement History View
- Resort Inventory Dashboard Section

## Runtime Ownership
- Inventory visibility
- Movement projection eligibility
- Adjustment eligibility if future workflow is approved

## State Ownership
- Inventory filters
- Selected resort context
- Movement list UI state

## API Mapping
- Inventory summary
- Movement history
- Resort-scoped inventory summary

## UI Component Plan
- InventorySummaryPanel
- InventorySummaryCard
- MovementList
- ResortInventoryPanel
- InventoryRuntimeHost

## Integration Plan
Inventory consumes output from Laundry Work and movement records. It must not own source operational workflow.

## Quality Gate
Inventory projections must be read-only unless adjustment workflow is explicitly approved.

## Regression Lock Criteria
Inventory summaries and movement history render correctly by workspace scope.
