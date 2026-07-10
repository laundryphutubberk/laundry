# FE-02 Packing Architecture

Status: ARCHITECTURE_FOUNDATION_READY
Owner Standard: FE-02 Architecture
Feature Task: Packing
Implementation Task Status: NOT_STARTED

## 1. Purpose

Define the architecture boundary for packing preparation and quantity confirmation before delivery.

Primary operational flow:

```text
Select Work
→ Prepare Packing
→ Record Packed Quantity
→ Validate Difference
→ Confirm Packing
```

This document defines FE-02 ownership and handoff only. It does not create runtime code, UI implementation, business logic implementation, schema changes, or API implementation.

## 2. Actors

| Actor | Workspace | Responsibility |
|---|---|---|
| Laundry Staff | Laundry Workspace | Prepare packing lines, enter packed quantities, and report discrepancies. |
| Laundry Manager | Laundry Workspace | Review differences, authorize corrections, and confirm packing. |
| Laundry Owner | Laundry Workspace | Review readiness, audit confirmation, and supervise exceptional decisions. |
| Delivery Staff | Laundry Workspace | Consume confirmed packing output for dispatch preparation; does not own packing calculation. |

## 3. User Goals

- Select a Laundry Work that is eligible for packing.
- See the authoritative returnable quantity by item type and color group.
- Record the quantity actually packed.
- Detect shortages, overages, unknown items, and unresolved differences.
- Resolve or explicitly carry forward discrepancies according to policy.
- Confirm one auditable packing result for delivery.
- Reload the workflow without losing confirmed state.

## 4. Feature Ownership

Suggested feature package owner:

```text
frontend/src/features/packing/
```

Packing owns:

- packing session projections
- packing line projections
- packed quantity entry state
- difference projections
- confirmation eligibility projection
- packing-specific policies, mappers, hooks, stores, and API boundary
- packing UI composition inside its feature package

Packing does not own:

- Laundry Work lifecycle
- Count Line creation
- inventory movement truth
- issue lifecycle
- delivery dispatch lifecycle
- linen type or color master data

## 5. Host and Dependency Boundary

Packing is a downstream operational capability of Laundry Work and Inventory truth.

```text
Laundry Work
  -> recorded Count Lines / returnable truth
  -> Inventory / movement truth
  -> Packing
  -> Delivery
```

Packing may consume authoritative inputs through public contracts only.

It must not import internal stores, runtime files, or API clients from `laundry-works`, `inventory`, `issues`, or `delivery`.

## 6. Route Ownership

Baseline routes:

| Route | Screen | Layout | Page Owner | Feature Surface Owner |
|---|---|---|---|---|
| `/laundry/packing` | Packing Queue | `LaundryWorkspaceLayout` | `packing` | `packing` |
| `/laundry/works/:workId/packing` | Packing Workspace | `WorkDetailLayout` | `packing` | `packing` |

Optional Work Detail summary surface:

| Route | Surface | Layout | Host Owner | Feature Owner |
|---|---|---|---|---|
| `/laundry/works/:workId` | Packing Status Panel | `WorkDetailLayout` | `laundry-works` | `packing` |

Route definitions own navigation only and must not calculate returnable quantities or confirmation eligibility.

## 7. Screen Inventory

| Screen / Surface | Owner | Purpose |
|---|---|---|
| Packing Queue | `packing` | Show work that is ready, blocked, in progress, or confirmed for packing. |
| Packing Workspace | `packing` | Prepare and confirm packing for one Laundry Work. |
| Packing Source Summary | `packing` | Show authoritative expected/returnable quantities supplied through contracts. |
| Packing Line Editor | `packing` | Record packed quantities by item identity. |
| Difference Summary | `packing` | Show packed-versus-authoritative differences. |
| Discrepancy Resolution Surface | `packing` | Capture approved handling of differences. |
| Packing Confirmation Surface | `packing` | Confirm packing when guards allow it. |
| Packing Status Panel | `packing` | Present status inside Work Detail without taking over the host page. |
| Loading / Empty / Error / Read-only States | `packing` | Render safe operational fallback states. |

## 8. Layout Ownership

- `LaundryWorkspaceLayout` hosts the packing queue.
- `WorkDetailLayout` hosts work-specific packing and packing status.
- Packing must not create another workspace shell.
- Desktop and mobile use the same feature components with adaptive composition.
- A focused mobile packing flow may use sheets or step composition, but not duplicate business components.

## 9. Component Boundary

Suggested component boundary:

```text
packing/
  components/
    PackingQueue
    PackingWorkspace
    PackingSourceSummary
    PackingLineList
    PackingLineEditor
    PackingDifferenceSummary
    PackingDiscrepancyPanel
    PackingConfirmationPanel
    PackingStatusPanel
    PackingEmptyState
    PackingErrorState
```

Rules:

- Components do not calculate authoritative returnable quantity.
- Components do not decide discrepancy policy.
- Components do not call backend transport directly.
- Components consume projections, validation messages, and allowed-action metadata.
- Container components may connect to explicit packing hooks or stores.
- Shared UI remains business-neutral.

## 10. Source-of-Truth Boundary

Packing is not the source of expected quantity.

Authoritative chain:

```text
Validated Count Line / movement / returnable quantity contract
  -> packing source contract
  -> packing mapper
  -> expected quantity projection
```

Packed quantity is a packing-owned operational fact:

```text
User packed quantity input
  -> packing runtime validation
  -> persisted packing line
  -> packing projection
```

Difference is derived:

```text
packed quantity - authoritative returnable quantity
  -> difference projection
```

The UI must not infer confirmation eligibility from displayed numbers alone.

## 11. Main Operational Flow

### Step 1 — Select Work

Actor: Laundry Staff or Manager

Goal: Open a Laundry Work eligible for packing.

Expected architecture output:

- `workId`
- workspace context
- work terminal/read-only state
- source readiness projection
- packing session status

### Step 2 — Load Authoritative Packing Source

Goal: See the returnable quantity by item type and color group.

Expected output:

- source lines
- source version or freshness metadata when contract supports it
- blockers such as missing source data or unresolved upstream truth

### Step 3 — Prepare Packing

Goal: Create or resume a packing session for the work.

Expected output:

- packing session identity
- draft packing lines
- allowed actions

### Step 4 — Record Packed Quantity

Goal: Enter the actual quantity placed into packing.

Expected output:

- persisted packing quantities
- validation feedback
- recalculated difference projection

### Step 5 — Validate Difference

Goal: Identify where packed quantity differs from returnable quantity.

Expected output:

- matched lines
- shortages
- overages
- unknown or unmapped lines
- confirmation blockers or warnings

### Step 6 — Resolve or Record Discrepancy

Goal: Apply the approved handling for differences.

Expected output:

- corrected packing line, approved variance, or linked issue/escalation result
- updated confirmation eligibility

### Step 7 — Confirm Packing

Actor: Authorized Laundry Manager or permitted Staff

Goal: Lock the packing result for delivery consumption.

Expected output:

- confirmed packing state
- confirmation timestamp and actor metadata when contract supports it
- immutable or controlled-revision packing snapshot
- delivery-ready public contract

### Step 8 — Refresh Persistence

Goal: Confirm draft or confirmed packing remains correct after reload.

Expected output:

- packing lines persist
- differences remain synchronized with the authoritative source contract
- confirmed state and allowed actions remain correct

## 12. Exception Flow

### Source Not Ready

Examples:

- no validated Count Lines
- inventory movement incomplete
- returnable quantity unavailable

Rule:

- Packing must enter a blocked state.
- UI must not manufacture expected quantity.

### Quantity Difference

Examples:

- shortage
- overage
- partial packing

Rule:

- FE-03 defines whether the result blocks confirmation, allows an approved variance, or requires an Issue.
- UI displays supplied policy result only.

### Unknown Item Identity

Rule:

- Unknown item type/color must not be silently merged.
- Runtime must provide a blocked or explicit exception path.

### Source Changes During Packing

Rule:

- FE-03 and FE-06 must define stale-source detection and refresh reconciliation.
- Confirming against an obsolete source must be prevented or explicitly revalidated.

### Duplicate Submission

Rule:

- Repeated save or confirm must not create duplicate packing sessions or duplicate confirmation effects.

### Terminal Work

Rule:

- CLOSED or CANCELLED work is read-only unless an approved reopen/correction policy exists.

### Confirmed Packing Revision

Rule:

- FE-03 must define whether confirmed packing is immutable, cancellable, or revised through a new controlled version.
- UI must not allow direct silent edits after confirmation.

### Workspace or Permission Failure

Rule:

- Resort users do not mutate packing.
- Laundry permissions and work access must be enforced through runtime and integration contracts.

## 13. Cross-feature Contracts

### Inputs from `laundry-works`

- `workId`
- work identity and resort identity
- terminal/read-only state
- work accessibility result

### Inputs from `inventory` or authoritative returnable source

- returnable quantity lines
- item type/color identity
- source readiness
- source version or freshness data when available

### Optional input/output with `issues`

- discrepancy escalation request
- linked issue identity and status

### Public output to `delivery`

- confirmed packing identity
- confirmed packing lines
- totals
- confirmation status
- delivery readiness
- read-only snapshot/version metadata when supported

### Forbidden

- direct import of another feature's internal files
- direct mutation of Laundry Work status
- deriving inventory movements inside Packing
- Delivery reading Packing internals instead of its public contract

## 14. Cross-feature Import Rules

Default direction:

```text
app / routes / layouts
  -> packing public boundary
  -> packing internals
  -> shared
```

Packing may import only:

- its own package
- approved public contracts
- business-neutral shared modules

Long-lived cross-feature dependency requires a public boundary or ADR.

## 15. FE-03 Runtime Handoff

FE-03 must define:

1. packing session state model
2. source loading and readiness lifecycle
3. draft creation/resume lifecycle
4. packed quantity mutation lifecycle
5. difference derivation inputs
6. discrepancy policy outcomes
7. confirmation guards
8. confirmed-state mutation policy
9. stale-source reconciliation
10. duplicate-submit protection
11. terminal Work policy
12. workspace and permission policy
13. allowed-action projection
14. delivery-ready public projection

Suggested frontend runtime categories:

```text
IDLE
LOADING_SOURCE
BLOCKED_SOURCE_NOT_READY
READY_TO_PREPARE
DRAFT
SAVING
DIFFERENCE_REVIEW
BLOCKED_BY_DISCREPANCY
READY_TO_CONFIRM
CONFIRMING
CONFIRMED
STALE_SOURCE
READ_ONLY
ERROR
```

These are runtime categories, not backend domain enums.

## 16. FE-04 UI Composition Handoff

FE-04 must define:

- Packing Queue composition
- source-versus-packed quantity hierarchy
- fast quantity entry interaction
- discrepancy emphasis
- confirmation placement
- loading, blocked, empty, error, and read-only states
- mobile packing workflow
- Work Detail packing status panel

FE-04 must not invent returnable quantity, discrepancy, permission, terminal, or confirmation policy.

## 17. FE-05 State Handoff

FE-05 should define:

- packing session store boundary
- source projection state
- draft line state
- persisted line state
- difference selectors
- dirty state
- confirmation state
- stale-source state
- allowed-action selectors

Draft inputs must remain distinguishable from confirmed persisted packing data.

## 18. FE-06 Integration Handoff

FE-06 must confirm:

- eligible-work query contract
- returnable/source quantity contract
- create/resume packing contract
- save packing lines contract
- discrepancy/issue linkage contract
- confirm packing contract
- confirmed packing read contract
- stale-source/version conflict behavior
- workspace and permission enforcement
- duplicate-submit behavior
- delivery consumption contract

## 19. Done State

Packing architecture foundation is ready when:

- actor and user goals are defined
- route, screen, and layout ownership are defined
- source-of-truth and difference boundaries are defined
- main and exception flows are defined
- cross-feature contracts are defined
- FE-03 and FE-04 handoffs are actionable
- blockers are explicit

Implementation remains `NOT_STARTED` until the Feature Task is formally opened and upstream contracts are ready.

## 20. Architecture Blockers

- Inventory movement and returnable quantity rules must be stable.
- Item type and color identity must be authoritative.
- Packing session persistence ownership must be confirmed.
- Discrepancy-to-Issue policy must be defined.
- Confirmed packing revision policy must be defined.
- Delivery input contract must be agreed before downstream implementation.
