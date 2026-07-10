# Frontend Execution Specialist Standard

Status: ACTIVE
Version: 1

## Purpose

This standard defines the shared operating contract for FE-02 through FE-08.

The FE execution domains are engineering specialists organized by type of work. They are not feature owners and they do not replace Feature Tasks.

## Ownership Model

```text
Feature Task
owns business flow, scope, and completion state

FE-02 ... FE-08
own shared engineering standards and specialist review
```

A specialist may inspect or recommend changes across a Feature Task, but the Feature Task remains the source of truth for feature scope and status.

## Specialist Domains

| Domain | Specialist Role | Primary Authority |
|---|---|---|
| FE-02 | Architecture Specialist | architecture, contracts, boundaries, ADR impact |
| FE-03 | Runtime Specialist | runtime lifecycle, hydration, refresh, recovery |
| FE-04 | UI Composition Specialist | component composition, interaction, responsive UI |
| FE-05 | State & Domain Specialist | state ownership, store, projection, presenter |
| FE-06 | Integration Specialist | API/DTO contracts, synchronization, backend integration |
| FE-07 | Quality Specialist | functional validation, regression, architecture verification |
| FE-08 | Delivery Specialist | run evidence, release gate, rollback expectation, handoff |

## Required Specialist Files

Every FE specialist domain should expose or preserve equivalents of:

- `README.md` — domain purpose and structure
- `ROLE.md` — specialist authority, responsibilities, and exclusions
- `TASK.md` — active execution contract
- `STATUS.md` — current domain status and review queue
- `DECISIONS.md` — durable ownership or standard decisions
- `EXECUTION-KERNEL.md` — operating sequence when present
- `CHECKLIST.md` or review artifacts — reusable specialist gate
- `handoff/` — completed review or delivery records

Existing files remain valid. Standardization must not delete historical evidence merely to make directory layouts identical.

## Shared Boot Sequence

When a specialist is asked to review a Feature Task:

1. Read `project-os/BOOT-INDEX.md`.
2. Read `project-os/frontend/tasks/BOOT.md`.
3. Read `project-os/frontend/tasks/TASK-INDEX.md`.
4. Read the target Feature Task `README.md`, `TASK.md`, and `STATUS.md`.
5. Read this standard.
6. Read the specialist domain `ROLE.md`, `TASK.md`, `STATUS.md`, and relevant checklists.
7. Inspect only the contracts, artifacts, code, and evidence required by the specialist role.
8. Record findings in the Feature Task or specialist review/handoff path without taking feature ownership.

## Specialist Review Contract

Each review must identify:

- Target Feature Task
- Specialist domain
- Evidence inspected
- Passed checks
- Blockers or risks
- Required follow-up
- Verdict

Allowed verdicts:

```text
NOT_REVIEWED
REVIEW_IN_PROGRESS
PASS_WITH_FOLLOW_UP
BLOCKED
PASS
```

FE-08 may additionally use its delivery verdicts defined in its own domain.

## Change Discipline

- Prefer the smallest patch that resolves an evidence-backed problem.
- Do not refactor unrelated feature code during specialist review.
- Do not create implementation merely to make a checklist pass unless the Feature Task authorizes execution.
- Do not mark a Feature Task completed; only the Task completion workflow may do so after all required gates pass.
- Record durable changes to specialist ownership or standards in `DECISIONS.md`.

## Handoff Discipline

A specialist handoff must be actionable. It must state either:

- the next specialist that can proceed,
- the Feature Task action required,
- the run evidence still required, or
- that the specialist gate has passed.

## Completion Rule

Execution specialist standardization is complete when all FE-02 through FE-08 domains expose a clear `ROLE.md` and use this shared operating contract without erasing their existing domain history.
