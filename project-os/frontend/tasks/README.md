# Frontend Feature Tasks

Status: ACTIVE

## Start Here

Read the top-level registry first:

- `TASK-INDEX.md` — cross-Task status, ownership, dependencies, active Task, and next gate

Then read the selected Task:

- `README.md`
- `TASK.md`
- `STATUS.md`

## Purpose

This directory owns frontend work by business feature or operational flow.

The `execution/fe-*` directories remain shared frontend engineering standards organized by type of work:

- FE-02 Architecture
- FE-03 Runtime
- FE-04 UI Composition
- FE-05 State / Domain
- FE-06 Integration
- FE-07 Quality
- FE-08 Delivery

Feature Tasks do not replace those standards. Each task must pass through the applicable FE standards before it can be completed.

## Structure

Each feature task should contain:

- `README.md` — mission, scope, ownership, dependencies, and FE mapping
- `TASK.md` — active execution contract
- `STATUS.md` — current state, evidence, blockers, and next gate
- `artifacts/` — feature-specific architecture or implementation artifacts
- `validation/` — run evidence and quality checks
- `handoff/` — completion and next-flow handoff

The top-level Task layer contains:

- `TASK-INDEX.md` — registry and cross-Task source of truth
- `templates/FEATURE-TASK-TEMPLATE.md` — template for new Tasks

## Task Lifecycle

```text
NOT_STARTED
→ PROPOSED
→ READY
→ IN_PROGRESS
→ IMPLEMENTED_PENDING_RUN_EVIDENCE
→ VALIDATED
→ COMPLETED
```

Exceptional transition:

```text
COMPLETED
→ REOPENED
→ IN_PROGRESS
```

A feature is not completed only because code exists.

Completion requires:

- Required FE standards satisfied
- Runtime evidence
- Build/lint/typecheck evidence when available
- Functional flow validation
- Workspace and permission validation where applicable
- Handoff recorded
- Task `STATUS.md` and `TASK-INDEX.md` synchronized

## Task Commands

```text
OPEN TASK: <task>
CONTINUE TASK: <task>
COMPLETE TASK: <task>
REOPEN TASK: <task>
```

Command behavior and transition requirements are defined in `TASK-INDEX.md`.

## Current Tasks

- `laundry-work/`
- `laundry-issue/`
- `laundry-image/`
- `inventory/`
- `packing/`
- `delivery/`
- `dashboard/`
- `reports/`

## Ownership Rule

Do not create FE-09, FE-10, FE-11, and so on merely to represent new features.

Create a new Feature Task and map it to the existing FE engineering standards instead.

## Active Task Rule

One primary Feature Task should be active at a time by default.

Parallel standards review or architecture reading is allowed when it does not mutate competing runtime surfaces. Any implementation exception must be recorded in `TASK-INDEX.md` and in the affected Task status files.
