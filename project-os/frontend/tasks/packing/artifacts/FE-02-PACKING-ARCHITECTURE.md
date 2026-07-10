# FE-02 Packing Architecture

Status: ARCHITECTURE_DRAFT
Owner: FE-02 Architecture
Feature Task: Packing
Implementation Status: NOT_STARTED

## 1. Purpose

Define the frontend architecture boundary for packing preparation and confirmation before delivery.

This document covers actors, goals, operational flow, route/screen/layout ownership, feature ownership, source-of-truth boundaries, exception handling, and handoff inputs for FE-03 and FE-04.

It does not create runtime code, UI implementation, business logic code, schema changes, or API implementation.

## 2. Actors

| Actor | Workspace | Responsibility |
|---|---|---|
| Laundry Staff | Laundry Workspace | Prepares packing, records packed quantities, and reports differences. |
| Laundry Manager | Laundry Workspace | Reviews discrepancies, confirms packing readiness, and supervises handoff to delivery. |
| Laundry Owner | Laundry Workspace | Reviews packing readiness and audit visibility when needed. |
| Resort Owner / Staff | Resort Workspace | Receives downstream visibility only after delivery/return contracts allow it. |

## 3. User Goals

- Select a Laundry Work that is eligible for packing.
- See expected returnable quantities from validated upstream data.
- Record actual packed quantities by item type and color grouping where applicable.
- Detect and explain differences between expected and packed quantities.
- Confirm packing only when required checks pass.
- Preserve packing audit evidence for delivery and later review.

## 4. Host and Feature Boundary

Packing is a downstream operational feature that depends on Laundry Work and Inventory truth.

```text
Laundry Work
  -> validated Count / Recorded Data
  -> Linen Movement / Returnable Quantity
  -> Packing
  -> Delivery
```

Ownership:

- `laundry-works` owns the host work identity and overall work lifecycle.
- `inventory` owns movement-derived stock and returnable quantity truth.
- `packing` owns packing preparation, packed quantities, discrepancy review, confirmation, and packing audit projection.
- `delivery` consumes confirmed packing output.

Packing must not calculate inventory truth independently or mutate Laundry Work internals directly.

## 5. Route Ownership

Proposed route ownership belongs to the Packing feature cell.

| Route | Screen | Layout | Ownership |
|---|---|---|---|
| `/laundry/packing` | Packing Queue | `LaundryWorkspaceLayout` | List works eligible or blocked for packing. |
| `/laundry/works/:workId/packing` | Packing Detail | `WorkDetailLayout` | Prepare, validate, and confirm packing for one work. |

Route definitions must not contain quantity rules or workflow decisions.

## 6. Screen Ownership

### Packing Queue

Purpose:

- Show works that may enter packing.
- Show readiness, discrepancy, blocked, and confirmed states.
- Allow entry into Packing Detail.

Owning feature:

- `packing`

### Packing Detail

Purpose:

- Show expected returnable quantities.
- Record actual packed quantities.
- Show differences and required explanations.
- Confirm packing when allowed.

Owning feature:

- `packing`

Host relationship:

- Rendered inside the Laundry Work context.
- Does not own the full Work Detail shell.

## 7. Layout Ownership

| Layout | Responsibility |
|---|---|
| `LaundryWorkspaceLayout` | Packing queue, navigation, and task entry. |
| `WorkDetailLayout` | Focused packing detail inside one Laundry Work. |

Layouts own responsive framing and navigation only. They must not own packing validation or confirmation logic.

## 8. Component Boundary

Feature-owned components may include:

```text
packing/
  components/
    PackingReadinessSummary
    PackingLineList
    PackingQuantityEditor
    PackingDifferencePanel
    PackingConfirmationPanel
    PackingAuditSummary
```

Rules:

- Components receive projection/model data.
- No returnable quantity calculation in JSX.
- No direct API calls from presentational components.
- No cross-feature internal imports.
- No direct store mutation except explicit feature container/controller boundaries.
- Business-neutral primitives may come from `shared/ui`.

## 9. Source-of-Truth Boundary

Packing reads upstream truth but does not redefine it.

```text
Validated Count Lines
  -> Linen Movements
  -> Returnable Quantity Projection
  -> Packing Expected Quantity
```

Packing-owned truth:

- packing batch or packing session identity
- packed quantity
- discrepancy reason or note
- packing status
- confirmation actor and timestamp
- packing audit history

Upstream-owned truth:

- work identity and lifecycle
- item type and color semantics
- counted quantities
- movement history
- returnable quantity rules

## 10. Main Operational Flow

```text
Select Eligible Work
  -> Load Expected Returnable Quantities
  -> Create or Resume Packing Draft
  -> Record Packed Quantities
  -> Compare Expected vs Packed
  -> Resolve or Explain Differences
  -> Confirm Packing
  -> Expose Confirmed Output to Delivery
```

### Step 1 — Select Eligible Work

Eligibility must be supplied by FE-03 policy based on upstream state.

### Step 2 — Load Expected Quantities

Expected quantities must come from a stable inventory/returnable quantity contract.

### Step 3 — Create or Resume Draft

Packing supports draft-safe continuation until confirmation.

### Step 4 — Record Packed Quantities

Packed quantities are feature-owned inputs grouped by the approved item/color identity.

### Step 5 — Validate Difference

Difference must be derived outside JSX:

```text
expected quantity - packed quantity = difference projection
```

The final rule and sign convention belong to FE-03/FE-05 contracts.

### Step 6 — Resolve or Explain Difference

Runtime policy determines whether differences:

- block confirmation
- require a reason
- require an Issue
- permit confirmation with warning

### Step 7 — Confirm Packing

Confirmation freezes or version-locks the packing output according to runtime policy.

### Step 8 — Handoff to Delivery

Delivery receives confirmed packing output through a public contract, not internal feature imports.

## 11. Exception Flow

### Upstream Quantity Not Ready

- Packing remains blocked.
- UI shows readiness reason supplied by projection.
- User cannot create a confirmable packing state.

### Packed Quantity Difference

- Difference is displayed explicitly.
- Reason or Issue linkage may be required.
- Confirmation follows runtime policy.

### Unknown Item or Color Mapping

- Packing line is marked unresolved.
- Confirmation is blocked or warned according to master-data policy.

### Duplicate Packing Draft

- Runtime prevents competing active drafts for the same work unless versioning is explicitly supported.

### Confirmed Packing Edited

- Direct edit is forbidden by default.
- Correction requires reopen, revision, or replacement policy defined by FE-03.

### Terminal or Cancelled Work

- Packing mutation is blocked.
- Read-only audit visibility may remain.

### Refresh or Retry

- Draft and confirmed state must rehydrate consistently.
- Duplicate-submit protection is required for confirmation.

## 12. Cross-feature Contract Boundary

### Inputs from `laundry-works`

- `workId`
- resort/work display context
- lifecycle eligibility projection
- terminal/cancelled protection

### Inputs from `inventory`

- returnable quantity projection
- item type/color identity
- source movement references when needed
- readiness/blocker projection

### Outputs to `delivery`

- confirmed packing identity
- packed lines and quantities
- discrepancy state
- confirmation metadata
- delivery readiness projection

Cross-feature access must use public boundaries or shared contracts. Internal imports are forbidden.

## 13. Workspace Boundary

Packing is primarily Laundry Workspace operational data.

- Laundry roles may view or mutate according to permission policy.
- Resort Workspace must not access internal draft, discrepancy review, or packing audit data unless an explicit downstream contract allows a safe projection.
- All work access must preserve resort/work ownership isolation.

## 14. FE-03 Runtime Handoff

FE-03 must define:

1. Packing lifecycle states
2. Work eligibility policy
3. Draft creation/resume rules
4. Packed quantity validation rules
5. Difference calculation contract
6. Discrepancy policy
7. Confirmation guards
8. Confirmed-state immutability or revision policy
9. Duplicate-submit protection
10. Terminal/cancelled work protection
11. Refresh and hydration behavior
12. Delivery readiness output

Suggested lifecycle categories:

```text
NOT_READY
READY
DRAFT
HAS_DIFFERENCE
BLOCKED
READY_TO_CONFIRM
CONFIRMED
CANCELLED
```

Final names belong to FE-03 and contracts.

## 15. FE-04 UI Composition Handoff

FE-04 must compose:

- Packing Queue
- Packing Detail
- readiness summary
- expected versus packed lines
- quantity entry surface
- discrepancy panel
- confirmation surface
- loading, empty, blocked, unknown, and confirmed states
- adaptive desktop/tablet/mobile presentation

FE-04 must not invent eligibility, difference, discrepancy, or confirmation rules.

## 16. FE-05 State / Domain Handoff

FE-05 must define:

- packing models
- draft state ownership
- packing projections
- mappers from API contracts
- controller/store boundary
- dirty-state and retry behavior
- confirmed/read-only projection

## 17. FE-06 Integration Handoff

FE-06 must verify:

- eligible-work query contract
- expected quantity query contract
- draft create/update contract
- confirmation contract
- idempotency and duplicate-submit behavior
- workspace and permission enforcement
- refresh persistence
- delivery handoff contract

## 18. Architecture Blockers

Implementation must not begin until these are resolved:

1. Inventory movement is validated and stable.
2. Returnable quantity rules are authoritative.
3. Item type and color identity are stable.
4. Packing batch/session persistence ownership is defined.
5. Discrepancy-to-Issue policy is defined or explicitly deferred.
6. Confirmed packing revision policy is defined.
7. Delivery input contract is agreed.

## 19. Done State

FE-02 Packing Architecture is ready for downstream work when:

- actors and goals are defined
- host and feature ownership are defined
- route/screen/layout ownership is defined
- source-of-truth boundary is defined
- main and exception flows are defined
- cross-feature contracts are defined
- FE-03 and FE-04 handoffs are actionable
- blockers are explicit

Implementation Task status remains `NOT_STARTED` until registry dependencies and opening rules are satisfied.
