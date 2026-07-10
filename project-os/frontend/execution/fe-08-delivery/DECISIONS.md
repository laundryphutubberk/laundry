# FE-08 Delivery — DECISIONS

## Baseline Decision

This domain uses Execution Standard v2.

## Rule

Any change to ownership, boundary, contract, or output artifact must be recorded here.

---

## Decision: Laundry Work Delivery Gate

Status: ACCEPTED

FE-08 Delivery defines a Laundry Work delivery readiness gate as a domain output artifact.

The gate covers:

- Performance budget
- Lazy loading rule
- Bundle impact
- Loading / empty / error behavior
- Dashboard performance rules
- List performance rules
- Detail performance rules

Boundary:

- Documentation only
- No implementation changes
- No runtime changes
- No UI changes
- No schema or contract changes

Output artifact:

- `project-os/frontend/execution/fe-08-delivery/LAUNDRY-WORK-DELIVERY-GATE.md`

---

## Decision: Shared Delivery Authority for Feature Tasks

Status: ACCEPTED

FE-08 Delivery is the shared delivery authority for all frontend Feature Tasks under:

- `project-os/frontend/tasks/<feature>/`

Feature Tasks remain owners of their business flows. FE-08 owns only the delivery gate, run-evidence review, environment readiness, rollback expectation, release risk, completion verdict, and handoff readiness.

A Feature Task must not move to `COMPLETED` only because implementation exists.

Completion requires applicable evidence for:

- Build
- Lint and typecheck when available
- Runtime startup
- Database migration and Prisma generation when applicable
- Functional flow
- Persistence
- Loading / empty / error / recovery behavior
- Workspace isolation and permission
- Regression
- Rollback or recovery expectation
- Handoff

Delivery verdicts are standardized as:

- `NOT_READY`
- `READY_WITH_BLOCKERS`
- `READY_FOR_DELIVERY_REVIEW`
- `DELIVERY_APPROVED`

Boundary:

- FE-08 does not own Feature implementation.
- FE-08 does not create new FE numbers for business features.
- Cross-layer fixes require explicit approval.
- Actual run evidence has priority over review-only claims.
