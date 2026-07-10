# FE-08 Delivery — TASK

## Mission

Own the shared frontend delivery domain for all Feature Tasks.

FE-08 does not own business features. Feature ownership remains under:

- `project-os/frontend/tasks/<feature>/`

FE-08 owns the delivery gates that determine whether a Feature Task is ready for completion and handoff.

## Responsibilities

- Define delivery readiness criteria.
- Verify build, lint, typecheck, runtime, migration, and environment evidence when applicable.
- Verify loading, empty, error, and recovery behavior.
- Verify workspace, permission, persistence, and regression evidence where applicable.
- Verify rollback expectations and release risks.
- Produce delivery review and handoff evidence.
- Prevent a Feature Task from being marked `COMPLETED` without sufficient run evidence.

## Rules

- Work only inside the FE-08 Delivery domain unless a cross-layer fix is explicitly approved.
- Do not take ownership away from Feature Tasks.
- Preserve Business Blueprint, Engineering Blueprint, `schema.prisma`, and established contracts.
- Treat implementation completion and delivery completion as different states.
- Prefer actual run evidence over document-only review.
- Record ownership, boundary, and gate decisions in `DECISIONS.md`.
- Update `STATUS.md` whenever FE-08 readiness changes.
- Produce review and handoff before completion.

## Task Integration

For every Feature Task, FE-08 reads:

1. `project-os/frontend/tasks/BOOT.md`
2. `project-os/frontend/tasks/TASK-INDEX.md`
3. `project-os/frontend/tasks/<feature>/README.md`
4. `project-os/frontend/tasks/<feature>/TASK.md`
5. `project-os/frontend/tasks/<feature>/STATUS.md`
6. Feature validation and handoff evidence

FE-08 then records a delivery verdict:

- `NOT_READY`
- `READY_WITH_BLOCKERS`
- `READY_FOR_DELIVERY_REVIEW`
- `DELIVERY_APPROVED`
