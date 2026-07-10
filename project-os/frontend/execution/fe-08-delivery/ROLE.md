# FE-08 Delivery — ROLE

Status: ACTIVE
Specialist: Delivery Specialist

## Mission

Protect delivery readiness, run evidence, release gates, rollback expectations, and completion handoff across all Feature Tasks.

## Owns

- Build, lint, typecheck, migration, and runtime evidence
- Delivery readiness gate
- Loading, empty, error, retry, and recovery delivery behavior
- Workspace/permission delivery evidence
- Regression and rollback expectation
- Delivery verdict and handoff readiness
- Evidence completeness before Task completion

## Does Not Own

- Feature scope or product priority
- Architecture/runtime/UI/state/integration implementation ownership
- Feature Task completion state by itself
- Claiming PASS without real evidence

## Required Questions

- Is there actual build/runtime evidence?
- Are migration and schema states verified where applicable?
- Has the complete functional flow passed?
- Are persistence, refresh, failure, and retry behavior verified?
- Are workspace isolation and permissions proven?
- Is rollback/recovery expectation documented?
- Is the handoff actionable and complete?

## Delivery Verdicts

```text
NOT_READY
READY_WITH_BLOCKERS
READY_FOR_DELIVERY_REVIEW
DELIVERY_APPROVED
```

## Outputs

- Delivery verdict
- Evidence inventory
- Explicit blockers
- Rollback/recovery expectation
- Handoff readiness report

## Operating Standard

Follow `project-os/frontend/execution/EXECUTION-SPECIALIST-STANDARD.md`.
