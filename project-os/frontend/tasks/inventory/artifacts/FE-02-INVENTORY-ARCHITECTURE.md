# FE-02 Inventory Architecture

Status: ARCHITECTURE_FOUNDATION_READY
Owner Standard: FE-02 Architecture
Feature Task: Inventory
Implementation Task Status: NOT_STARTED

## Purpose

Define the architecture foundation for resort-scoped linen inventory and movement visibility before FE-03 runtime and FE-04 UI composition begin.

Primary operational flow:

```text
Count Line
→ Linen Movement
→ Resort Inventory Summary
→ Stock Visibility
→ Movement Drill-down
```

This document does not create runtime code, UI implementation, API implementation, schema changes, or business logic.

## Actors

| Actor | Workspace | Responsibility |
|---|---|---|
| Laundry Owner | Laundry Workspace | Oversees inventory truth across resorts and reviews discrepancies. |
| Laundry Manager | Laundry Workspace | Reviews movement history, stock visibility, and operational anomalies. |
| Laundry Staff | Laundry Workspace | Produces upstream counted and recorded work data that may generate movements. |
| Resort Owner | Resort Workspace | Views inventory and movement history for the resort only. |
| Resort Staff | Resort Workspace | Views authorized resort-scoped stock information. |

## User Goals

- See current linen stock by resort, item type, and color group.
- Trace every quantity back to immutable movement history.
- Distinguish items at resort, at laundry, returned, damaged, or otherwise affected when contracts support those categories.
- Drill down from a summary to the movements and Laundry Works that produced it.
- Preserve resort isolation and avoid manual summary values becoming the source of truth.
- Refresh and see the same derived result from durable source data.

## Source-of-Truth Boundary

Inventory summary is derived state.

```text
Validated Count Line / Work Event
  → Immutable Linen Movement
  → Inventory Derivation Contract
  → Inventory Projection
  → UI
```

Architecture rules:

- UI must not calculate durable inventory truth.
- Frontend state must not become the durable source of truth.
- Summary values must be reproducible from movement history.
- Manual corrections require an explicit adjustment movement or approved correction flow.
- Count Line semantics, item type identity, color identity, and resort ownership must be stable before implementation.

## Feature Ownership

Feature package owner:

```text
frontend/src/features/inventory/
```

The Inventory feature owns:

- inventory projections
- movement-history projections
- inventory filters
- inventory-specific policies and mappers
- drill-down composition
- inventory stores and hooks
- inventory presentation components
- inventory public boundary for dashboard/report consumers

The feature does not own:

- Laundry Work lifecycle
- Count Line mutation
- movement creation business rules owned by backend/domain workflow
- packing confirmation
- delivery confirmation
- dashboard or report page shells
- master-data creation

## Workspace Boundary

```text
Laundry Workspace
  → may view multi-resort inventory when role permits

Resort Workspace
  → may view only current resort inventory and movements
```

Resort scope must be preserved through route, page entry, request contract, mapper, store, projection, and component visibility.

## Route Ownership

| Route | Screen | Layout | Page Owner | Feature Owner |
|---|---|---|---|---|
| `/laundry/inventory` | Laundry Inventory Overview | `LaundryWorkspaceLayout` | `inventory` | `inventory` |
| `/laundry/inventory/movements` | Laundry Movement History | `LaundryWorkspaceLayout` | `inventory` | `inventory` |
| `/laundry/inventory/:resortId` | Resort Inventory Detail for Laundry Users | `LaundryWorkspaceLayout` | `inventory` | `inventory` |
| `/resort/inventory` | Resort Inventory Overview | `ResortWorkspaceLayout` | `inventory` | `inventory` |
| `/resort/inventory/movements` | Resort Movement History | `ResortWorkspaceLayout` | `inventory` | `inventory` |

Route definitions must not own derivation logic or movement rules.

## Screen Inventory

| Screen / Surface | Ownership | Purpose |
|---|---|---|
| Laundry Inventory Overview | `inventory` | Multi-resort stock visibility and operational entry. |
| Resort Inventory Detail | `inventory` | Stock visibility for one resort. |
| Resort Inventory Overview | `inventory` | Resort-scoped stock visibility. |
| Movement History | `inventory` | Trace derived stock to immutable movements. |
| Movement Detail | `inventory` | Show source work, item identity, direction, quantity, and timestamp. |
| Inventory Filters | `inventory` | Filter by resort, item type, color, movement type, and date when contracts permit. |
| Summary Empty State | `inventory` | Safe display when no derived stock exists. |
| Derivation Error State | `inventory` | Explain unavailable or inconsistent inventory safely. |

## Layout Ownership

- Laundry screens use `LaundryWorkspaceLayout`.
- Resort screens use `ResortWorkspaceLayout`.
- Inventory must not create a competing workspace shell.
- Desktop and mobile use the same feature components with adaptive composition.
- Drill-down may use a page, drawer, or sheet selected later by FE-04 without changing ownership.

## Component Boundary

Suggested feature boundary:

```text
inventory/
  pages/
    LaundryInventoryPage
    ResortInventoryPage
    InventoryMovementHistoryPage
  components/
    InventorySummaryTable
    InventorySummaryCards
    InventoryFilterBar
    InventoryMovementList
    InventoryMovementRow
    InventoryMovementDetail
    InventoryEmptyState
    InventoryErrorState
```

Rules:

- Components do not derive inventory from raw movement records.
- Components do not call backend transport directly.
- Components consume projection-provided values and labels.
- Shared UI remains business-neutral.
- Container components may connect explicitly to inventory hooks/stores.
- Movement direction, category, and quantity meaning come from contracts, policies, and projections—not JSX inference.

## Main Operational Flow

### 1. Produce Valid Source Data

Upstream owner: Laundry Work / Count Line flow

Result:

- confirmed resort ownership
- confirmed item type
- confirmed color group when required
- confirmed quantity
- valid work or operational event

### 2. Create Linen Movement

Owner boundary: backend/domain integration, not UI

Result:

- immutable movement record
- movement type and direction
- source reference
- resort, item type, color group, quantity, and timestamp

### 3. Derive Inventory Summary

Owner boundary: domain/backend derivation contract and frontend projection mapping

Result:

- reproducible summary grouped by approved dimensions
- no manual summary mutation

### 4. View Inventory

Actor: authorized Laundry or Resort user

Result:

- workspace-safe inventory projection
- filterable and readable stock visibility
- loading, empty, and error states

### 5. Drill Down to Movement History

Actor: authorized viewer

Result:

- movements explain summary quantities
- source work/event is traceable
- resort isolation remains intact

### 6. Refresh Persistence

Result:

- summary and movements remain consistent after reload
- local stale state is reconciled with durable source data

## Exception Flow

### Missing or Invalid Count Source

- movement creation must not proceed from invalid source data
- inventory UI must not compensate by inventing quantities
- FE-03/FE-06 define unavailable and retry behavior

### Duplicate Movement

- duplicate submission must not inflate inventory
- FE-03/FE-06 define idempotency and reconciliation

### Unknown Item Type or Color

- runtime must define whether the source is blocked, flagged, or grouped under an approved unknown category
- UI consumes supplied policy and labels

### Negative or Impossible Summary

- projection must expose an anomaly state
- UI must not silently clamp or hide the value
- resolution requires source correction or adjustment movement

### Missing Movement History

- summary without traceable movement is an architecture/data-integrity failure
- UI shows a safe inconsistency state rather than fabricated history

### Workspace Isolation Failure

- resort users must never receive another resort's inventory or movement data
- filtering only in the UI is insufficient

### Adjustment Request

- direct summary editing is forbidden
- a future adjustment flow must create an explicit auditable movement and requires an approved contract

## Cross-feature Contract Boundary

### Inputs from Laundry Work / Count Source

- source work/event identity
- resort identity
- item type identity
- color group identity when applicable
- confirmed quantity
- movement-triggering event metadata

### Inputs from Master Data

- item type labels and active identity
- color group labels and active identity
- approved grouping metadata

### Public Outputs from Inventory

- resort inventory summary projection
- laundry-wide inventory summary projection
- movement history projection
- inventory anomaly projection
- business-safe summary boundary for dashboard and reports

### Forbidden

- Inventory importing internal Laundry Work stores
- Dashboard or Reports importing Inventory internals
- UI creating movement records directly
- Shared layer importing Inventory feature modules
- Resort projection receiving unscoped multi-resort data

## FE-03 Runtime Handoff

FE-03 must define:

1. inventory load lifecycle
2. movement-history load lifecycle
3. filter and drill-down runtime
4. refresh and reconciliation behavior
5. stale-data behavior
6. empty and unknown states
7. anomaly state handling
8. duplicate-movement protection expectations
9. workspace and permission policies
10. adjustment-flow policy or explicit deferral
11. public projection contract for Dashboard and Reports

Suggested frontend runtime categories:

```text
IDLE
LOADING_SUMMARY
READY
LOADING_MOVEMENTS
REFRESHING
EMPTY
ANOMALY
ERROR
READ_ONLY
```

These are frontend runtime categories, not backend domain enums.

## FE-04 UI Composition Handoff

FE-04 must define:

- Laundry and Resort inventory page composition
- summary hierarchy
- table/card adaptive behavior
- filters and drill-down interaction
- movement history readability
- source-work linking presentation
- loading, empty, anomaly, and error states
- mobile adaptation

FE-04 must not invent quantity derivation, movement meaning, workspace policy, or adjustment rules.

## FE-05 State Handoff

FE-05 should own:

- normalized inventory projection state
- movement-history state
- filter state
- selected drill-down state
- request and refresh state
- projection selectors
- anomaly selectors

Derived display state must remain separate from durable movement truth.

## FE-06 Integration Handoff

FE-06 must confirm:

- inventory summary contracts
- movement history contracts
- resort scoping enforcement
- role and permission enforcement
- source-work references
- pagination/filtering contracts
- duplicate protection
- refresh consistency
- item/color master identity contracts

## Architecture Blockers

Implementation remains blocked until:

- Laundry Issue completion requirements are satisfied where they affect Count Line truth
- Count Line source semantics are validated
- linen item type and color master identities are stable
- movement creation ownership and event rules are authoritative
- summary derivation contract is authoritative
- adjustment policy is defined or explicitly deferred

## Done State

The Inventory FE-02 architecture foundation is ready when:

- source-of-truth chain is defined
- route, screen, layout, and feature ownership are defined
- workspace boundary is defined
- component boundary is defined
- main and exception flows are defined
- cross-feature contracts are defined
- FE-03 and FE-04 handoffs are actionable
- blockers are explicit

Implementation Task status remains unchanged until the Feature Task lifecycle formally advances.
