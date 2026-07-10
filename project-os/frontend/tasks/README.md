# Frontend Feature Tasks

Status: ACTIVE

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

## Task Lifecycle

```text
PROPOSED
→ READY
→ IN_PROGRESS
→ IMPLEMENTED_PENDING_RUN_EVIDENCE
→ VALIDATED
→ COMPLETED
```

A feature is not completed only because code exists.

Completion requires:

- Required FE standards satisfied
- Runtime evidence
- Build/lint/typecheck evidence when available
- Functional flow validation
- Workspace and permission validation where applicable
- Handoff recorded

## Current Tasks

- `laundry-work/`
- `laundry-issue/`

Future examples:

- `laundry-work-image/`
- `linen-master/`
- `resort-inventory/`
- `packing/`
- `delivery/`
- `dashboard/`
- `reports/`

## Ownership Rule

Do not create FE-09, FE-10, FE-11, and so on merely to represent new features.

Create a new Feature Task and map it to the existing FE engineering standards instead.
