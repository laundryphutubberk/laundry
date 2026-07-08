# RUNTIME-STANDARD.md

Status: LOCKED
Owner: Frontend Architecture
Phase: FE-01 Foundation

## Purpose

Runtime is the frontend layer that turns domain state and backend contracts into safe user actions.

Runtime must not be scattered across React components.

## Runtime Layers

- `engines/` — deterministic domain/runtime calculations
- `policies/` — eligibility, permission, workflow, and boundary rules
- `projections/` — derived read models for UI consumption
- `runtime/` — runtime host, runtime controller boundary, and runtime composition
- `hooks/` — React orchestration over runtime and APIs

## Runtime Responsibilities

Runtime may own:

- status transition helpers
- CTA eligibility
- workflow guards
- workspace visibility guards
- derived runtime state
- UI-safe projection models

## Forbidden Runtime Placement

Do not place workflow rules directly in:

- page components
- visual components
- shared utilities
- route files

## Naming Examples

```text
laundryWorkWorkflow.engine.ts
laundryWorkRuntime.engine.ts
laundryWork.policy.ts
laundryWorkProjection.ts
useLaundryWorkController.ts
LaundryWorkRuntimeHost.tsx
```
