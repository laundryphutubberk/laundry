# BE-06 — Module Architecture Normalization Gate

Status: PLANNED
Mode: ARCHITECTURE NORMALIZATION GATE

## Purpose

BE-06 will normalize the backend folder structure into module-first architecture after BE-05 Business Capability Gate is complete.

BE-06 must not redefine business rules. It only relocates and standardizes already-reviewed backend boundaries into self-contained modules.

## Why BE-06 Starts After BE-05

BE-05 owns business capability coverage across Prisma domains.

Moving files before BE-05 is complete would mix two different kinds of work:

1. business rule design, and
2. architecture migration.

BE-06 starts after BE-05 so that each module can be migrated with stable business rules, stable service behavior, and stable verification checks.

## Target Architecture

```txt
backend/src/
  core/
  shared/
  modules/
    laundry-work/
      laundryWork.controller.js
      laundryWork.service.js
      laundryWork.repository.js
      laundryWork.policy.js
      laundryWork.guard.js
      laundryWork.mapper.js
      laundryWork.response.mapper.js
      laundryWork.validation.js
      laundryWork.errors.js
      laundryWork.routes.js
      index.js

    laundry-bag/
      laundryBag.controller.js
      laundryBag.service.js
      laundryBag.repository.js
      laundryBag.policy.js
      laundryBag.guard.js
      laundryBag.mapper.js
      laundryBag.response.mapper.js
      laundryBag.validation.js
      laundryBag.errors.js
      laundryBag.routes.js
      index.js

    laundry-count-line/
      laundryCountLine.controller.js
      laundryCountLine.service.js
      laundryCountLine.repository.js
      laundryCountLine.policy.js
      laundryCountLine.guard.js
      laundryCountLine.mapper.js
      laundryCountLine.response.mapper.js
      laundryCountLine.validation.js
      laundryCountLine.errors.js
      laundryCountLine.routes.js
      index.js
```

## File Roles

| File Type | Responsibility |
|---|---|
| `*.routes.js` | Bind HTTP routes to controllers. |
| `*.controller.js` | Read request, call service, send response. |
| `*.service.js` | Orchestrate use cases and transactions. |
| `*.repository.js` | Database access only. |
| `*.policy.js` | Business rules and decisions. |
| `*.guard.js` | State transition or action eligibility guard. |
| `*.mapper.js` | Database/domain object mapping. |
| `*.response.mapper.js` | Response shape mapping. |
| `*.validation.js` | Request validation schemas. |
| `*.errors.js` | Module-specific error factories/constants. |
| `index.js` | Public module export. |

## Migration Principles

- Move one module at a time.
- Preserve API Contract.
- Preserve runtime behavior.
- Preserve Workspace Boundary.
- Preserve Business Blueprint.
- Preserve `schema.prisma`.
- Keep commits small and reversible.
- Run/update runtime verification after each module move.

## Initial Module Migration Order

1. `laundry-work`
2. `laundry-bag`
3. `laundry-count-line`
4. `linen-movement`
5. `issue-report`
6. `laundry-machine-load-rule`
7. `wash-load-plan`
8. `resort`

## BE-06 Definition of Done

BE-06 can be frozen only when:

- Every BE-05 completed Required Business Layer domain is moved into `src/modules/*`.
- Existing routes still resolve to the same API paths.
- Runtime verification passes after each migrated module.
- No schema, API Contract, Workspace Boundary, Business Blueprint, or ADR change is required.
- Legacy cross-folder imports are removed or intentionally documented as temporary compatibility shims.

## Stop Conditions

Stop and request approval if migration requires any of the following:

- Business Blueprint change
- `schema.prisma` change
- API Contract change
- Workspace Boundary change
- ADR creation
- Business rule redesign

## Current Status

BE-06 is planned but not active.

BE-05 remains active until Business Capability Coverage is complete.
