# FE-02 Delivery Architecture

Status: ARCHITECTURE_FOUNDATION_READY
Owner Standard: FE-02 Architecture
Feature Task: Delivery
Implementation Task Status: NOT_STARTED

## 1. Purpose

Define the frontend architecture boundary for dispatch, resort receipt confirmation, returned quantity verification, return movement visibility, and safe Laundry Work closure.

Primary operational flow:

```text
Packed
→ Ready for Delivery
→ Dispatch
→ Resort Receives
→ Verify Returned Quantity
→ Confirm Return
→ Create Return Movement
→ Close Work
```

This document does not create UI, runtime code, API implementation, schema changes, or business logic.

## 2. Actors

| Actor | Workspace | Responsibility |
|---|---|---|
| Laundry Staff | Laundry Workspace | Prepare dispatch, record delivery details, and support returned quantity verification. |
| Laundry Manager | Laundry Workspace | Approve dispatch, resolve discrepancies, confirm return, and close work when allowed. |
| Laundry Owner | Laundry Workspace | Review delivery status, audit discrepancies, and oversee closure. |
| Resort Staff | Resort Workspace | Confirm receipt for the resort's own work and review returned quantities. |
| Resort Owner | Resort Workspace | Review delivery history, receipt status, and discrepancies for the resort. |

## 3. User Goals

### Laundry Workspace

- See which packed works are ready for delivery.
- Dispatch the correct work to the correct resort.
- Record dispatch metadata and preserve audit history.
- Receive resort confirmation safely.
- Verify returned quantities against confirmed packing.
- Record discrepancies explicitly.
- produce a return movement through an authoritative contract.
- Close Laundry Work only when all required delivery conditions are satisfied.

### Resort Workspace

- See incoming delivery for the resort's own work.
- Confirm receipt without accessing another resort's data.
- Review returned quantities and report discrepancies where allowed.
- See final returned and closed status.

## 4. Feature Ownership

Suggested feature package owner:

```text
frontend/src/features/delivery/
```

The Delivery feature owns:

- delivery queue projections
- dispatch preparation and confirmation surfaces
- receipt confirmation surfaces
- returned quantity verification surfaces
- delivery discrepancy presentation
- closure eligibility projection
- delivery-specific policies, mappers, runtime, hooks, stores, and API boundary

The Delivery feature does not own:

- Packing quantity calculation
- Inventory movement generation rules
- Laundry Work lifecycle internals
- Issue domain internals
- workspace authentication or global permissions

## 5. Host and Dependency Boundary

Delivery is downstream of Packing and upstream of final Laundry Work closure.

```text
Packing Confirmation
  → Delivery
  → Inventory Return Movement
  → Laundry Work Closure
```

Required upstream inputs:

- confirmed packing ID or version
- confirmed packed quantities
- resort identity
- work identity
- readiness-for-delivery signal

Required downstream outputs:

- dispatch record
- receipt confirmation
- verified returned quantity result
- discrepancy result
- return movement command/result
- closure eligibility result

Direct imports into Packing, Inventory, Laundry Work, or Issue internals are forbidden. Integration must use public contracts.

## 6. Route Ownership

| Route | Screen | Layout | Page Owner |
|---|---|---|---|
| `/laundry/delivery` | Delivery Queue | `LaundryWorkspaceLayout` | `delivery` |
| `/laundry/delivery/:deliveryId` | Delivery Detail | `LaundryWorkspaceLayout` or focused delivery layout | `delivery` |
| `/laundry/works/:workId` | Delivery Summary Panel | `WorkDetailLayout` | page: `laundry-works`, surface: `delivery` |
| `/resort/deliveries` | Resort Delivery List | `ResortWorkspaceLayout` | `delivery` |
| `/resort/deliveries/:deliveryId` | Resort Receipt Detail | `ResortWorkspaceLayout` | `delivery` |

Baseline decision:

- Laundry staff use dedicated delivery queue/detail routes.
- Work Detail embeds a delivery summary only.
- Resort users receive separate resort-scoped receipt routes.

## 7. Screen Inventory

| Screen / Surface | Owner | Purpose |
|---|---|---|
| Delivery Queue | `delivery` | Show packed works ready for delivery and current delivery status. |
| Delivery Detail | `delivery` | Host dispatch, receipt, verification, discrepancy, and closure readiness. |
| Dispatch Form | `delivery` | Capture dispatch metadata. |
| Dispatch Confirmation | `delivery` | Confirm dispatch action. |
| Resort Receipt Detail | `delivery` | Allow resort-scoped receipt review and confirmation. |
| Returned Quantity Verification | `delivery` | Compare received/returned quantities against confirmed packing. |
| Delivery Discrepancy Panel | `delivery` | Show and record mismatch information through approved contracts. |
| Return Movement Status | `delivery` | Show authoritative movement result from Inventory integration. |
| Close Work Readiness | `delivery` | Explain whether Laundry Work can be closed and why. |
| Delivery Summary Panel | `delivery` | Present compact delivery status inside Work Detail. |
| Empty / Loading / Error / Read-only States | `delivery` | Render safe operational states. |

## 8. Layout Ownership

- `LaundryWorkspaceLayout` owns delivery queue/detail workspace framing.
- `ResortWorkspaceLayout` owns resort-scoped receipt screens.
- `WorkDetailLayout` owns embedded delivery summary placement.
- Delivery must not create a competing workspace shell.
- Desktop and mobile use the same feature components with adaptive composition.

## 9. Component Boundary

Suggested boundary:

```text
delivery/
  components/
    DeliveryQueue
    DeliveryQueueItem
    DeliveryDetailPanel
    DispatchForm
    DispatchSummary
    ReceiptConfirmationPanel
    ReturnedQuantityTable
    DeliveryDiscrepancyPanel
    ReturnMovementStatus
    CloseWorkReadiness
    DeliverySummaryCard
    DeliveryEmptyState
    DeliveryErrorState
```

Rules:

- Components do not calculate packing or inventory truth.
- Components do not call backend transport directly.
- Components consume projections and allowed-action metadata.
- Close-work decisions must not be calculated in JSX.
- Shared UI remains business-neutral.

## 10. Source-of-Truth Boundary

### Dispatch truth

```text
Persisted dispatch record
→ API contract
→ Delivery mapper
→ Delivery projection
→ UI
```

### Quantity truth

```text
Confirmed Packing quantities
+ Resort receipt/returned quantities
→ Delivery verification runtime
→ discrepancy projection
```

### Inventory truth

```text
Authoritative return movement result
→ Inventory public contract
→ Delivery movement status projection
```

### Closure truth

```text
Delivery completion result
+ movement completion
+ issue/discrepancy policy
+ Laundry Work terminal policy
→ closure eligibility projection
```

Frontend local state is not the durable source of truth.

## 11. Main Operational Flow

### Step 1 — Select Ready Work

Actor: Laundry Staff or Manager

Input:

- work ID
- confirmed packing
- readiness signal

Output:

- delivery preparation context loaded

### Step 2 — Prepare Dispatch

Actor: Laundry Staff

Possible metadata:

- dispatch date/time
- vehicle or courier note
- responsible person
- destination resort
- optional note

Output:

- dispatch draft ready for confirmation

### Step 3 — Confirm Dispatch

Actor: Authorized Laundry user

Output:

- dispatch record persisted
- delivery becomes dispatched
- resort-scoped receipt visibility becomes available according to integration policy

### Step 4 — Resort Receives

Actor: Authorized Resort user or Laundry user acting under approved process

Output:

- receipt confirmation persisted
- received date/time recorded
- returned quantity verification becomes available

### Step 5 — Verify Returned Quantities

Actor: Resort Staff, Laundry Staff, or Manager according to policy

Input:

- confirmed packed quantities
- received/returned quantities

Output:

- matched quantities or explicit discrepancy projection

### Step 6 — Resolve or Record Discrepancy

Actor: Laundry Manager or authorized user

Output:

- discrepancy is recorded or linked through an approved Issue public boundary
- continuation policy is supplied by FE-03

### Step 7 — Confirm Return

Actor: Authorized Laundry user

Output:

- delivery return is confirmed
- return movement request may proceed

### Step 8 — Record Return Movement

Owner: Inventory integration contract

Output:

- authoritative movement result returned
- delivery projection shows movement completion or error

### Step 9 — Close Laundry Work

Actor: Laundry Manager or Owner

Output:

- work closes only when closure eligibility is true
- closed work becomes read-only by default

## 12. Exception Flow

### Packing Not Confirmed

- Delivery cannot be dispatched.
- UI shows blocked reason from runtime projection.

### Duplicate Dispatch

- Repeated submit must not create unintended duplicate dispatch records.
- FE-03 and FE-06 define protection.

### Invalid Resort or Work

- No dispatch or receipt mutation may proceed without valid accessible work and resort context.

### Receipt Quantity Mismatch

- Actual received quantity is recorded.
- Difference is presented explicitly.
- Issue creation/linking uses a public boundary if required.

### Partial Receipt

- FE-03 must define whether partial receipt is allowed and whether the delivery remains open.

### Return Movement Failure

- Delivery must not display completed movement when inventory integration fails.
- Safe retry/reconciliation must be defined by FE-03 and FE-06.

### Terminal Work

- CLOSED or CANCELLED work cannot accept normal delivery mutations.
- UI consumes read-only and allowed-action projection.

### Workspace Isolation Failure

- Resort users may only access deliveries tied to their own resort.
- Route, state, and API integration must preserve the same scope.

### Permission Failure

- View, dispatch, confirm receipt, confirm return, and close actions may have different permissions.
- UI must not infer permission from visual role labels alone.

## 13. Cross-feature Public Contracts

### Input from Packing

- packing ID/version
- work ID
- resort ID
- confirmed quantities
- packing confirmation status

### Input/output with Inventory

- return movement request contract
- movement success/failure result
- movement identity for audit/drill-down

### Input/output with Laundry Work

- host work identity
- current terminal/read-only status
- close-work command boundary
- closure result

### Optional Issue boundary

- discrepancy context
- issue creation/link result
- unresolved issue summary

### Public Delivery outputs

- delivery summary projection
- dispatch status
- receipt status
- discrepancy summary
- return movement status
- closure eligibility

## 14. Cross-feature Import Rules

Forbidden:

- importing Packing internals
- importing Inventory movement internals
- mutating Laundry Work store directly
- importing Issue internals
- shared importing Delivery feature modules

Allowed:

- business-neutral shared utilities
- approved public feature boundaries
- explicit ADR for intentional long-lived dependency

## 15. FE-03 Runtime Handoff

FE-03 must define:

1. Delivery runtime state model
2. Dispatch lifecycle
3. Receipt lifecycle
4. Partial receipt policy
5. Quantity verification lifecycle
6. Discrepancy policy
7. Return confirmation lifecycle
8. Return movement request/reconciliation lifecycle
9. Duplicate-submit protection
10. permission and workspace rules
11. terminal-work mutation policy
12. closure eligibility state and guards
13. refresh persistence and recovery
14. allowed-action and next-step projections

Suggested frontend runtime categories:

```text
IDLE
LOADING
READY_FOR_DISPATCH
DISPATCHING
DISPATCHED
AWAITING_RECEIPT
RECEIPT_CONFIRMING
RECEIVED
VERIFYING_RETURN
DISCREPANCY
RETURN_CONFIRMING
MOVEMENT_PENDING
MOVEMENT_CONFIRMED
READY_TO_CLOSE
CLOSING
CLOSED
ERROR
READ_ONLY
```

These are frontend runtime categories, not backend enums.

## 16. FE-04 UI Composition Handoff

FE-04 must define:

- delivery queue composition
- delivery detail composition
- dispatch form and confirmation
- resort receipt composition
- returned quantity comparison
- discrepancy presentation
- movement status presentation
- closure readiness and blocked reasons
- Work Detail summary placement
- loading, empty, error, success, and read-only states
- mobile adaptation

FE-04 must not invent packing truth, discrepancy policy, movement policy, permission policy, or close-work rules.

## 17. FE-05 State Handoff

FE-05 should own:

- normalized delivery state
- dispatch draft state
- receipt confirmation state
- returned quantity input state
- discrepancy projection selectors
- movement reconciliation state
- closure eligibility selectors
- mutation request state

## 18. FE-06 Integration Handoff

FE-06 must confirm:

- ready-for-delivery query contract
- dispatch create/update contract
- resort receipt contract
- returned quantity verification contract
- discrepancy/Issue integration contract
- return movement integration contract
- Laundry Work closure contract
- workspace isolation
- permission enforcement
- refresh persistence
- duplicate-submit behavior

## 19. Architecture Blockers

Implementation remains blocked until:

- Packing confirmation contract is stable.
- Confirmed quantity versioning is defined.
- Inventory return movement contract is authoritative.
- Partial receipt policy is decided.
- Discrepancy-to-Issue policy is decided.
- Delivery closure guards are agreed with Laundry Work runtime.
- resort receipt actor and permission model are explicit.

## 20. Done State

The Delivery FE-02 architecture foundation is ready when:

- actor and user goals are defined
- host/dependency boundaries are defined
- route/screen/layout ownership is defined
- component boundary is defined
- source-of-truth chain is defined
- main and exception flows are defined
- public contracts are defined
- FE-03 and FE-04 handoffs are actionable

Implementation status remains owned by `tasks/delivery/STATUS.md`.
