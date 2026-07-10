# Frontend Execution Specialist Index

Status: ACTIVE

## Purpose

This index is the entry point for FE-02 through FE-08 specialist review.

Feature work starts from `project-os/frontend/tasks/`. Engineering review starts here.

## Specialists

| Domain | Role | Path |
|---|---|---|
| FE-02 | Architecture Specialist | `fe-02-architecture/ROLE.md` |
| FE-03 | Runtime Specialist | `fe-03-runtime/ROLE.md` |
| FE-04 | UI Composition Specialist | `fe-04-ui-composition/ROLE.md` |
| FE-05 | State & Domain Specialist | `fe-05-state-domain/ROLE.md` |
| FE-06 | Integration Specialist | `fe-06-integration/ROLE.md` |
| FE-07 | Quality Specialist | `fe-07-quality/ROLE.md` |
| FE-08 | Delivery Specialist | `fe-08-delivery/ROLE.md` |

## Shared Standard

All specialists follow:

- `EXECUTION-SPECIALIST-STANDARD.md`
- Project boot and constitution
- Feature Task boot and registry
- Their own domain `ROLE.md`, `TASK.md`, `STATUS.md`, decisions, checklists, and handoffs

## Invocation Pattern

A Feature Task may request a specialist review using:

```text
REQUEST FE-02 REVIEW: <task>
REQUEST FE-03 REVIEW: <task>
REQUEST FE-04 REVIEW: <task>
REQUEST FE-05 REVIEW: <task>
REQUEST FE-06 REVIEW: <task>
REQUEST FE-07 REVIEW: <task>
REQUEST FE-08 REVIEW: <task>
```

The specialist must read the Feature Task status first and must not take ownership of the business flow.

## Recommended Feature Passage

```text
Feature Task
→ FE-02 Architecture
→ FE-03 Runtime
→ FE-04 UI Composition
→ FE-05 State / Domain
→ FE-06 Integration
→ FE-07 Quality
→ FE-08 Delivery
```

The sequence may overlap when useful, but FE-08 cannot approve delivery without the required upstream evidence.

## Current Delivery Focus

- Current FE-08 review: Laundry Issue
- Current verdict: READY_WITH_BLOCKERS
- Next Feature Task after approval: Laundry Image
