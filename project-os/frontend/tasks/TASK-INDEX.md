# Frontend Feature Task Registry

Status: ACTIVE
Registry Role: Frontend Feature / Flow Source of Truth

## Purpose

This registry is the top-level index for frontend work owned by business feature or operational flow.

Use this file before opening, continuing, completing, or reopening a Feature Task.

The registry answers:

- Which Feature Tasks exist
- Which Task currently owns each flow
- Current Task status and phase
- Whether a Task may begin implementation
- Which Task is blocked by another Task
- Where completion evidence and handoff belong

## Layer Boundary

```text
project-os/frontend/execution/fe-02...fe-08
= Shared Engineering Standards

project-os/frontend/tasks/<feature>/
= Feature / Flow Ownership
```

Do not create a new FE number merely to represent a new product feature.

## Command Language

### OPEN TASK: `<task>`

Use when a Task is `NOT_STARTED`, `PROPOSED`, or `READY`.

Required action:

1. Read this registry.
2. Read the Task `README.md`, `TASK.md`, and `STATUS.md`.
3. Confirm dependencies and blockers.
4. Move the Task into the appropriate active lifecycle state.
5. Execute through applicable FE-02 to FE-08 standards.

### CONTINUE TASK: `<task>`

Use when a Task is already active.

Required action:

1. Read this registry.
2. Read the Task `STATUS.md`.
3. Resume from the next unverified gate.
4. Do not repeat verified work without a regression reason.

### COMPLETE TASK: `<task>`

Use only after implementation and required evidence exist.

Required action:

1. Verify applicable FE-02 to FE-08 gates.
2. Record build/runtime/functional evidence.
3. Record workspace and permission evidence where applicable.
4. Write handoff.
5. Change the Task status to `COMPLETED`.
6. Update this registry in the same completion patch.

### REOPEN TASK: `<task>`

Use only for a verified regression, changed requirement, or downstream contract need.

Required action:

1. Record the reopen reason.
2. Change the Task status to `REOPENED`.
3. Preserve previous completion evidence.
4. Run the affected gates again.

## Canonical Lifecycle

```text
NOT_STARTED
→ PROPOSED
→ READY
→ IN_PROGRESS
→ IMPLEMENTED_PENDING_RUN_EVIDENCE
→ VALIDATED
→ COMPLETED
```

Exceptional state:

```text
COMPLETED
→ REOPENED
→ IN_PROGRESS
```

## Registry

| Task | Path | Owner Scope | Status | Current Phase | Dependencies / Gate | Next Required Action |
|---|---|---|---|---|---|---|
| Laundry Work | `tasks/laundry-work/` | Laundry Work host flow | `COMPLETED_BASELINE` | Completed baseline | Reopen only for verified regression or downstream host-contract need | Preserve as host baseline |
| Laundry Issue | `tasks/laundry-issue/` | Issue create, link, update, cancel, resolve | `COMPLETED` | Completed | Validation and handoff complete | Preserve completion evidence |
| Laundry Image | `tasks/laundry-image/` | Laundry Work evidence images | `IN_PROGRESS` | Architecture and contract inspection | Laundry Issue completion gate passed | Inspect domain, backend, frontend, and evidence gaps |
| Inventory | `tasks/inventory/` | Resort linen movement and stock visibility | `NOT_STARTED` | Not started | Requires stable Count Line semantics and master-data decision | Define source-of-truth and movement contract before implementation |
| Packing | `tasks/packing/` | Packing preparation and quantity verification | `NOT_STARTED` | Not started | Depends on inventory/count truth | Keep closed until upstream contract is ready |
| Delivery | `tasks/delivery/` | Dispatch, return confirmation, work closure | `NOT_STARTED` | Not started | Depends on packing and movement truth | Keep closed until upstream flow is ready |
| Dashboard | `tasks/dashboard/` | Operational summaries and decision surfaces | `NOT_STARTED` | Not started | Depends on reliable operational source data | Do not implement from incomplete projections |
| Reports | `tasks/reports/` | Historical reporting and export | `NOT_STARTED` | Not started | Depends on stable domain history and reporting contracts | Keep closed until source flows are validated |

## Active Task Rule

Default operating rule:

- One primary Feature Task is active at a time.
- Finish or explicitly pause the active Task before opening another implementation Task.
- Parallel reading, architecture inspection, or standards review is allowed when it does not mutate competing runtime surfaces.
- An exception must be recorded in this registry and in both affected `STATUS.md` files.

Current primary Task:

```text
Laundry Image
```

Current gate:

```text
IN_PROGRESS — ARCHITECTURE_AND_CONTRACT_INSPECTION
```

Next planned Task after completion:

```text
Inventory
```

## FE Standards Mapping

Every Feature Task must consider the following standards:

| Standard | Responsibility |
|---|---|
| FE-02 Architecture | Boundaries, contracts, dependencies, ownership |
| FE-03 Runtime | Lifecycle, host/controller behavior, refresh safety |
| FE-04 UI Composition | Presentation and interaction composition |
| FE-05 State Domain | State, store, policy, projection boundaries |
| FE-06 Integration | API/backend/workspace integration |
| FE-07 Quality | Regression, permission, isolation, run validation |
| FE-08 Delivery | Performance, delivery evidence, handoff readiness |

Not every Task requires new implementation in every FE area, but every applicable gate must be reviewed and evidenced before completion.

## Source-of-Truth Rule

- This file is the cross-Task registry.
- Each Task's `STATUS.md` is the detailed source of truth for that Task.
- If this registry and a Task `STATUS.md` disagree, inspect the latest evidence and update both in the same correction patch.
- Do not infer completion from code or conversation messages alone.

## Registry Update Contract

Update this registry whenever:

- A Task is created
- A Task changes lifecycle status
- The primary active Task changes
- A dependency or blocker changes
- A Task is completed or reopened
- A planned next Task changes

A Task transition is incomplete until its `STATUS.md` and this registry agree.
