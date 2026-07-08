# Execution Lifecycle Doctrine

Status: Active
Owner: Chief Architect
Project: `laundryphutubberk/laundry`

## Purpose

Defines the standard lifecycle for every execution package across Backend, Frontend, QA, and Release.

This doctrine is promoted from the proven BE-06 migration workflow.

## Lifecycle

```text
Discovery
  -> Inventory
  -> Blueprint Alignment
  -> Implementation
  -> Static Verification
  -> Runtime Verification
  -> Smoke Verification
  -> Freeze
```

## Phase Meaning

| Phase | Purpose |
|---|---|
| Discovery | Understand current state without changing code |
| Inventory | List files, modules, contracts, gaps, and ownership |
| Blueprint Alignment | Confirm target structure matches active blueprint |
| Implementation | Make approved changes inside the gate scope |
| Static Verification | Verify structure, imports, contracts, and code shape |
| Runtime Verification | Boot or run the system where applicable |
| Smoke Verification | Check critical endpoints/screens/workflows |
| Freeze | Record final state and handoff readiness |

## Gate-Based Execution

When an implementation gate is approved, all milestones inside the approved scope may proceed without repeated approval.

The task must stop only when a Stop Condition is triggered.

## Universal Stop Conditions

Pause and ask Chief Architect if the task requires:

```text
Business Blueprint change
schema.prisma change
API Contract change
Workspace Boundary change
Permission model change
Technology baseline change
ADR trigger
Runtime behavior change outside approved gate
Frontend/Backend cross-boundary change not included in scope
```

## Freeze Requirements

A phase may freeze only when:

```text
Discovery completed
Inventory completed
Blueprint alignment confirmed
Implementation completed or explicitly not required
Static verification passed or explicitly not applicable
Runtime verification passed or explicitly not applicable
Smoke verification passed or explicitly not applicable
Critical gaps are closed or documented
Handoff is clear
```

## Maintenance Rule

Update this doctrine when execution lifecycle, verification expectations, or gate behavior changes.
