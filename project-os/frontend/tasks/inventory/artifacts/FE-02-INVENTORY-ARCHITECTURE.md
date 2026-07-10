# FE-02 Inventory Architecture

Status: ARCHITECTURE_FOUNDATION_READY
Owner: FE-02 Architecture
Feature Task: Inventory
Implementation Status: NOT_STARTED

## 1. Purpose

Define the frontend architecture foundation for resort-scoped linen inventory, immutable movement history, derived summaries, and stock visibility.

This artifact defines ownership, boundaries, routes, screens, layouts, source-of-truth rules, operational flow, exceptions, and downstream handoff.

It does not create runtime code, UI implementation, business logic code, API implementation, schema changes, or task lifecycle transitions.

## 2. Mission

Deliver resort-scoped linen inventory from validated Count Line source data, immutable Linen Movement history, and derived Resort Inventory Summary.

Primary flow:

```text
Validated Count Line
  -> Linen Movement
  -> Resort Inventory Summary
  -> Stock Visibility
  -> Movement Drill-down
```

## 3. Actors

| Actor | Workspace | Goal |
|---|---|---|
| Laundry Owner | Laundry Workspace | See inventory position across resorts and investigate operational anomalies. |
| Laundry Manager | Laundry Workspace | Review current stock position, movement history, and discrepancies by resort. |
| Laundry Staff | Laundry Workspace | View operational inventory context when needed without manually rewriting derived stock. |
| Resort Owner | Resort Workspace | See only the resort's own linen quantities, location, issues, and movement history. |
| Resort Staff | Resort Workspace | Review resort-scoped inventory and history when authorized. |

## 4. Source of Truth

Inventory is derived, not manually captured as primary truth.

Source order:

```text
Validated Count Line
  -> Immutable Linen Movement
  -> Derived Inventory Summary
  -> Frontend Projection
  -> Screen
```

Rules:

- Count Line is the operational count source after laundry counting.
- Linen Movement is the historical source of stock changes.
- Inventory Summary is a derived read model.
- UI must not calculate authoritative inventory totals independently.
- UI must not mutate inventory summary directly.
- Adjustments require an explicit adjustment contract and movement record.

## 5. Workspace Boundary

### Laundry Workspace

May view:

- inventory across resorts
- resort filters
- item type and color group breakdown
- movement history
- issue-linked quantities
- discrepancy and stale-summary indicators

### Resort Workspace

May view only:

- current resort inventory
- current resort movement history
- current resort issue quantities
- current resort work-linked drill-down

Resort Workspace must never select or infer another `resortId`.

## 6. Feature Ownership

Owner package:

```text
frontend/src/features/inventory/
```

The Inventory feature owns:

- inventory page composition
- inventory projections
- movement-history projections
- inventory filters and view state
- inventory-specific policies
- inventory-specific mappers
- inventory API boundary
- inventory stores when required by FE-05

The Inventory feature does not own:

- Count Line creation or editing
- Laundry Work status transitions
- Issue lifecycle
- packing decisions
- delivery confirmation
- backend movement creation rules
- direct mutation of derived summary rows

## 7. Cross-feature Boundaries

### `laundry-works` -> `inventory`

Provides work and Count Line references through a public contract or backend API response.

Inventory must not import Laundry Work internal stores, engines, or components.

### `issues` -> `inventory`

Provides issue-linked quantities or issue summary data through a public boundary.

Inventory must not import Issue internals.

### `packing` -> `inventory`

Future Packing may consume available inventory projections or movement-safe quantities through an approved public contract.

Inventory does not own packing allocation.

### `delivery` -> `inventory`

Future Delivery may produce return movements through backend/runtime contracts.

Inventory displays resulting movement history; it does not own delivery state.

### `dashboard` -> `inventory`

Dashboard may consume inventory summary projections through a public read boundary.

Dashboard must not import Inventory internal stores or mappers.

## 8. Route Ownership

Route definitions remain in `frontend/src/routes/`.

| Route | Screen | Workspace | Feature Owner | Layout |
|---|---|---|---|---|
| `/laundry/inventory` | Laundry Inventory Overview | Laundry | `inventory` | `LaundryWorkspaceLayout` |
| `/laundry/inventory/resorts/:resortId` | Resort Inventory Detail | Laundry | `inventory` | `LaundryWorkspaceLayout` |
| `/laundry/inventory/resorts/:resortId/movements` | Resort Movement History | Laundry | `inventory` | `LaundryWorkspaceLayout` |
| `/resort/inventory` | My Linen Inventory | Resort | `inventory` | `ResortWorkspaceLayout` |
| `/resort/inventory/movements` | My Movement History | Resort | `inventory` | `ResortWorkspaceLayout` |

Route rules:

- Routes only compose workspace and feature entry.
- Routes do not calculate inventory.
- Laundry route params must be permission-checked downstream.
- Resort routes derive resort scope from authenticated workspace context, not arbitrary route input.

## 9. Screen Inventory

### Laundry Inventory Overview

Purpose:

- compare inventory across resorts
- identify high at-laundry quantities
- identify issue quantities
- inspect stale or inconsistent summaries

Owner:

- `inventory`

Layout:

- `LaundryWorkspaceLayout`

### Resort Inventory Detail

Purpose:

- view one resort's inventory by item type and color group
- inspect known total, at resort, at laundry, issue, and returned quantities
- navigate to movement history

Owner:

- `inventory`

Layout:

- `LaundryWorkspaceLayout`

### Resort Movement History

Purpose:

- inspect immutable movement entries
- filter by item type, color group, movement type, work, and date
- trace summary quantities to history

Owner:

- `inventory`

Layout:

- `LaundryWorkspaceLayout`

### My Linen Inventory

Purpose:

- show resort owner the resort's own inventory only
- highlight at-resort, at-laundry, issue, and returned quantities
- avoid internal laundry-only operational detail

Owner:

- `inventory`

Layout:

- `ResortWorkspaceLayout`

### My Movement History

Purpose:

- show resort-scoped movement history
- support read-only work and issue references where allowed

Owner:

- `inventory`

Layout:

- `ResortWorkspaceLayout`

## 10. Component Boundary

Suggested feature-owned component responsibilities:

```text
InventoryOverviewPage
ResortInventoryDetailPage
InventoryMovementHistoryPage
InventorySummaryTable
InventoryMetricCards
InventoryBreakdownList
MovementHistoryTable
MovementFilterBar
InventoryEmptyState
InventoryStaleState
InventoryErrorState
```

Rules:

- Pages compose screens and controllers.
- Presentational components consume projections.
- Components do not calculate authoritative stock.
- Components do not call APIs directly.
- Shared UI contains only business-neutral primitives.
- Inventory-specific terminology and presentation remain inside the feature.

## 11. Operational Main Flow

```text
Validated Count Line exists
  -> backend/runtime emits movement exactly once
  -> movement history persists
  -> summary is derived or refreshed
  -> frontend loads resort-scoped projection
  -> user views summary
  -> user drills into movement history
  -> refresh preserves the same result
```

## 12. Exception Flow

### Missing or Unvalidated Count Line

Result:

- no authoritative movement should be assumed
- inventory screen may show pending source-data state

FE-03 must define runtime projection state.

### Duplicate Movement Attempt

Result:

- no duplicate inventory effect
- existing movement remains authoritative

FE-03/FE-06 must define idempotency evidence.

### Summary and Movement Mismatch

Result:

- movement history remains historical truth
- summary is flagged stale or inconsistent
- UI must not silently recalculate and overwrite server truth

### Unknown Linen Type or Color Group

Result:

- show safe unknown/unclassified projection
- do not merge unknown records into an incorrect known group

### Unauthorized Resort Access

Result:

- deny data access
- do not render partial cross-resort data

### Empty Inventory

Result:

- show valid empty state
- do not imply an error when no movement exists

### Adjustment Required

Result:

- require an explicit adjustment movement flow
- do not edit summary values directly

## 13. Done State

The inventory operational flow is complete when:

- validated source data produces movement once
- movement persists across refresh
- derived summary matches movement history
- laundry users can inspect allowed resorts
- resort users see only their own inventory
- drill-down traces summary to movement history
- duplicate movement creation is prevented
- empty, stale, unknown, and unauthorized states are safe

## 14. FE-03 Runtime Handoff

FE-03 must define:

1. inventory runtime load states
2. summary freshness states
3. movement history load and pagination states
4. source-data pending state
5. duplicate-protection state
6. mismatch/stale-summary state
7. resort-scope guard state
8. safe retry and refresh behavior
9. drill-down runtime contract
10. adjustment-flow eligibility state

Suggested runtime categories:

```text
IDLE
LOADING
READY
EMPTY
SOURCE_PENDING
SUMMARY_STALE
SOURCE_MISMATCH
UNAUTHORIZED
ERROR
```

FE-03 must not invent inventory-changing transitions inside frontend UI runtime.

## 15. FE-04 UI Composition Handoff

FE-04 should define:

- inventory overview composition
- resort inventory detail composition
- movement history composition
- task-oriented summary hierarchy
- responsive table/list behavior
- empty, loading, stale, unknown, unauthorized, and error states
- drill-down affordances

FE-04 must consume projections and must not calculate stock values.

## 16. FE-05 State / Domain Handoff

FE-05 should define:

- inventory query state
- filter state
- selected resort state for Laundry Workspace
- resort scope from authenticated context for Resort Workspace
- summary projection types
- movement projection types
- stale/mismatch policy selectors

State must not become the authoritative inventory source.

## 17. FE-06 Integration Handoff

FE-06 should verify:

- inventory summary API contract
- movement history API contract
- resort isolation at backend and frontend boundaries
- pagination/filter contracts
- work/issue reference contracts
- duplicate movement protection
- summary refresh semantics
- adjustment movement contract when approved

## 18. Architecture Blockers

Implementation remains blocked until:

1. Laundry Issue completion and handoff are recorded.
2. Linen type and color master readiness is confirmed.
3. Count Line semantics and source data are validated.
4. Movement creation ownership is explicitly confirmed.
5. Summary derivation and refresh contract is confirmed.
6. Adjustment policy is defined or explicitly deferred.

## 19. Non-goals

This artifact does not:

- implement inventory UI
- create runtime code
- create stores
- create API calls
- create movement records
- update inventory summary
- change schema
- change Inventory Task status

## 20. FE-02 Architecture Gate

FE-02 architecture is ready for downstream review when:

- source-of-truth chain is accepted
- route/screen/layout ownership is accepted
- workspace isolation boundary is accepted
- cross-feature contracts are accepted
- movement ownership and summary derivation blockers are resolved or recorded
- FE-03 and FE-04 can proceed without inventing architecture
