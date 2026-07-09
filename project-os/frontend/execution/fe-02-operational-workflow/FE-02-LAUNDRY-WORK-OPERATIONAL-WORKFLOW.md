# FE-02 Laundry Work Operational Workflow

Status: BASELINE_DRAFT
Owner: FE-02 Operational Workflow Foundation
Feature Cell: `laundry-works`
Downstream Owner: FE-03 Runtime

## 1. Purpose

This document defines the operational workflow for Laundry Work as the source input for FE-03 runtime state and transition design.

It describes what users are trying to do, who performs each step, the main operational path, exception paths, done state, and artifacts FE-03 must consume.

This document does not create UI, runtime code, business logic code, schema changes, or API implementation.

## 2. Actors

| Actor | Workspace | Responsibility |
|---|---|---|
| Laundry Owner | Laundry Workspace | Oversees all work, monitors progress, reviews issues, and confirms business readiness. |
| Laundry Manager | Laundry Workspace | Manages daily workflow, assigns or supervises tasks, checks exceptions, and coordinates return. |
| Laundry Staff | Laundry Workspace | Performs operational steps: receive bags, open bags, count items, sort, record data, and prepare return. |
| Resort Owner | Resort Workspace | Views own work status, inventory visibility, issue visibility, and returned work history. |
| Resort Staff | Resort Workspace | Supports resort-side visibility and may review work history or issue information if allowed. |

## 3. User Goals

### Laundry Workspace Goals

- Create a Laundry Work record when laundry receives or expects laundry from a resort.
- Track work from bag receipt through return.
- Count real items at the laundry after bags are opened.
- Sort counted items by item type and color when needed.
- Record confirmed operational data as the basis for inventory and movement history.
- Report issues explicitly when items are damaged, missing, or count does not match expectations.
- Return completed work to the resort and close the workflow safely.

### Resort Workspace Goals

- See the status of the resort's own laundry work.
- See what items are at the laundry, returned, or problematic.
- Review issues and work history without seeing other resorts' data.

## 4. Operational Source of Truth

Laundry Work is the operational center.

Operational facts should flow from work activity:

```text
Laundry Work
  -> Laundry Bags
  -> Count Lines
  -> Issues
  -> Linen Movements
  -> Inventory Summary
```

Count Lines are created from real counting after bags are opened at the laundry.

Inventory Summary is derived from work and movement history, not manually entered as primary data.

## 5. Main Flow

### Flow Overview

```text
Create Laundry Work
  -> Receive Bags
  -> Factory Receive Confirmation
  -> Open Bag
  -> Count Items
  -> Sort Type
  -> Sort Color
  -> Record Data
  -> Return Work
  -> Close Work
```

### Step 1 — Create Laundry Work

Actor: Laundry Owner, Laundry Manager, or authorized Laundry Staff

User Goal:

Create the operational work container for one resort's laundry job.

Required Inputs:

- Resort
- Work date or received date when known
- Initial bag count when known
- Notes when needed

Expected Output:

- Laundry Work exists.
- Work has a work number.
- Work is associated with one resort.
- Work starts in a draft or received-ready operational state depending on FE-03 runtime rules.

Runtime Handoff:

FE-03 must define the initial state and allowed transition into bag receipt.

### Step 2 — Receive Bags

Actor: Laundry Staff

User Goal:

Record bags received from the resort as intake units.

Required Inputs:

- Work ID
- Bag numbers or bag count
- Received timestamp when available
- Optional notes

Expected Output:

- Laundry Bag records exist for the work.
- Bag status becomes received.
- Laundry Work can move to bag received state.

Runtime Handoff:

FE-03 must define whether a work can advance when zero bags exist and how duplicate bag numbers are handled.

### Step 3 — Factory Receive Confirmation

Actor: Laundry Staff or Laundry Manager

User Goal:

Confirm that the laundry factory has accepted the received bags into the production workflow.

Required Inputs:

- Work ID
- Receipt confirmation action
- Optional note

Expected Output:

- Laundry Work is marked as factory received.
- Work is ready for bag opening.

Runtime Handoff:

FE-03 must define the transition from bag received to factory received and any guard condition based on bag presence.

### Step 4 — Open Bag

Actor: Laundry Staff

User Goal:

Open a received bag and prepare it for counting.

Required Inputs:

- Work ID
- Bag ID
- Open action
- Optional note

Expected Output:

- Bag status becomes opened.
- Bag opened timestamp is recorded.
- Work can progress toward item counting.

Runtime Handoff:

FE-03 must define whether all bags or at least one bag must be opened before counting can start.

### Step 5 — Count Items

Actor: Laundry Staff

User Goal:

Record the real item quantities found after opening bags.

Required Inputs:

- Work ID
- Optional Bag ID
- Item type
- Quantity
- Optional issue quantity
- Optional color group if known at this stage
- Optional note

Expected Output:

- Count Lines exist.
- Real counted quantity is captured at laundry.
- Work can move to item counted state.

Runtime Handoff:

FE-03 must define validation rules for zero quantity, issue quantity, missing bag ID, and count line completeness.

### Step 6 — Sort Type

Actor: Laundry Staff

User Goal:

Confirm items have been grouped by type for operational visibility and next processing.

Required Inputs:

- Work ID
- Count line or grouped item data
- Type confirmation action

Expected Output:

- Work is marked type sorted.
- Item type information is sufficient for downstream projection.

Runtime Handoff:

FE-03 must define whether this step is automatic when item types are already present or manual when staff confirms sorting.

### Step 7 — Sort Color

Actor: Laundry Staff

User Goal:

Confirm counted items have usable color grouping where needed.

Required Inputs:

- Work ID
- Count line or grouped item data
- Color group data when applicable
- Color confirmation action

Expected Output:

- Work is marked color sorted.
- Count lines can support inventory grouping by item type and color group.

Runtime Handoff:

FE-03 must define whether color is required, optional, or defaulted for each item type or workflow mode.

### Step 8 — Record Data

Actor: Laundry Staff or Laundry Manager

User Goal:

Confirm counted and sorted data as official operational data for work history and inventory movement.

Required Inputs:

- Work ID
- Confirmed count lines
- Issue lines when needed
- Confirmation action

Expected Output:

- Work is marked data recorded.
- Movement records can be generated by runtime/backend rules.
- Inventory summary becomes derivable from work and movement history.

Runtime Handoff:

FE-03 must define which validations are required before data can be recorded and what projection state should be shown after recording.

### Step 9 — Return Work

Actor: Laundry Staff or Laundry Manager

User Goal:

Mark work as returned to the resort after operational processing is complete.

Required Inputs:

- Work ID
- Return action
- Returned timestamp when available
- Optional note

Expected Output:

- Work is marked returned.
- Return movement can be represented in movement history.
- Resort can see returned status for its own work.

Runtime Handoff:

FE-03 must define whether unresolved issues block return or allow return with warning state.

### Step 10 — Close Work

Actor: Laundry Owner or Laundry Manager

User Goal:

Close the work after it is returned and no further operational updates are expected.

Required Inputs:

- Work ID
- Close action
- Optional close note

Expected Output:

- Work is closed.
- Work becomes read-only unless an explicit reopen/adjustment policy exists.

Runtime Handoff:

FE-03 must define closed-state permissions and whether reopen is supported in the MVP.

## 6. Exception Flow

### Exception 1 — Issue Reported

Trigger:

Damaged, missing, count mismatch, return mismatch, or other issue is detected.

Actors:

Laundry Staff, Laundry Manager, or Laundry Owner

Flow:

```text
Detect issue
  -> Create issue report
  -> Link issue to work and optionally item type/color
  -> Continue workflow or pause based on runtime policy
  -> Resolve or carry issue forward
```

Runtime Handoff:

FE-03 must define issue states, issue impact on work progression, and whether open issues block data recording, return, or close.

### Exception 2 — Count Discrepancy

Trigger:

Counted quantity differs from expected quantity or resort-side claim.

Flow:

```text
Identify mismatch
  -> Record count line with actual counted quantity
  -> Create issue report if needed
  -> Mark discrepancy for review
```

Runtime Handoff:

FE-03 must treat actual laundry count as the operational count source while preserving discrepancy visibility.

### Exception 3 — Missing or Unknown Item Type

Trigger:

Staff cannot classify an item during count or sorting.

Flow:

```text
Record item as unknown or hold line
  -> Add note
  -> Manager reviews
  -> Convert to known item type or keep exception state
```

Runtime Handoff:

FE-03 must define whether unknown item types are allowed in runtime or must block data recording.

### Exception 4 — Missing Color Group

Trigger:

Color is not known, not relevant, or not captured.

Flow:

```text
Leave color blank or default according to policy
  -> Continue if color is optional
  -> Block or warn if color is required
```

Runtime Handoff:

FE-03 must define color requirement policy and projection display for missing color.

### Exception 5 — Bag Cannot Be Opened or Counted

Trigger:

Bag is damaged, mislabeled, missing, or not ready for counting.

Flow:

```text
Mark bag exception
  -> Add note
  -> Create issue if needed
  -> Continue other bags when allowed
```

Runtime Handoff:

FE-03 must define partial-bag progression rules.

### Exception 6 — Cancel Work

Trigger:

Work was created by mistake or should not continue.

Flow:

```text
Request cancel
  -> Validate cancel permission
  -> Record cancel note
  -> Move work to cancelled terminal state
```

Runtime Handoff:

FE-03 must define allowed cancellation states and permissions.

## 7. Done State

Laundry Work is operationally done when:

- Work has a valid resort.
- Bags were received or intentionally not required by runtime policy.
- Counted item data was recorded when the workflow requires it.
- Issues were explicitly recorded when present.
- Return was confirmed when work is completed.
- Work is closed or ready to close according to role permission.

### Terminal States for Runtime Design

FE-03 should treat these as terminal or near-terminal categories:

| Runtime Category | Meaning |
|---|---|
| `RETURNED` | Work has been returned but may still allow review or close. |
| `CLOSED` | Work is complete and should be read-only by default. |
| `CANCELLED` | Work is stopped and should not proceed through normal flow. |

## 8. FE-03 Required Artifacts

FE-03 must use this workflow to produce:

1. `WorkStatus` runtime state map
2. Allowed transition table
3. Transition guard rules
4. Runtime policy map
5. Runtime event/action names
6. Work timeline projection rules
7. Work summary projection rules
8. Safe next-step projection rules
9. Exception state handling
10. Runtime handoff contract for FE-04 UI composition

## 9. Suggested Runtime State Inputs

FE-03 should map the operational flow into runtime states equivalent to:

```text
DRAFT
BAG_RECEIVED
FACTORY_RECEIVED
BAG_OPENED
ITEM_COUNTED
TYPE_SORTED
COLOR_SORTED
DATA_RECORDED
RETURNED
CLOSED
CANCELLED
```

Exception states or flags should cover:

```text
ISSUE_REPORTED
DAMAGED_REPORTED
MISSING_REPORTED
COUNT_DISCREPANCY
RETURN_DISCREPANCY
UNKNOWN_ITEM_TYPE
BAG_EXCEPTION
```

## 10. FE-04 Awareness

FE-04 should not invent workflow logic.

FE-04 UI composition should consume FE-03 projections for:

- timeline steps
- current step
- safe next step
- summary cards
- issue alerts
- empty/unknown states
- allowed actions

## 11. Non-goals

This document does not define:

- UI layout
- visual components
- API implementation
- database migration
- backend service behavior
- runtime code

## 12. Acceptance Criteria

This workflow is ready for FE-03 when:

- actors are identified
- user goals are identified
- main flow is defined
- exception flow is defined
- done state is defined
- FE-03 required artifacts are listed
- runtime states can be derived without inventing a new workflow
