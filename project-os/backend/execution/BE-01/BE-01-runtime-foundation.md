# BE-01 Runtime Foundation Execution Package

Status: Standard
Scope: Backend Runtime Foundation
Owner: Backend Architecture
Estimated Complexity: M

## Purpose

Verify and normalize the backend runtime foundation before module-level engineering continues.

## Scope

Runtime bootstrap, middleware order, request context, response contract, error contract, health/smoke behavior.

## Prerequisites

BE-OS Foundation sealed. Runtime standards approved.

## Dependencies

Depends on BE-OS standards. Enables BE-02, BE-03, and BE-04.

## Allowed Files

- `fieldops-be/src/core/**`
- `fieldops-be/src/middlewares/**`
- `fieldops-be/src/routes/index.js`
- runtime documentation under `docs/project-os/backend/**`

## Forbidden Files

- feature module business logic unless required for smoke verification
- frontend files
- database schema changes

## Parallel Tasks

- Runtime lifecycle verification
- Middleware verification
- Request context verification
- Response contract verification
- Error contract verification

## Milestones

- BE-01.01 Runtime Lifecycle
- BE-01.02 Middleware
- BE-01.03 Request Context
- BE-01.04 Response Contract
- BE-01.05 Error Contract
- BE-01.06 Runtime Smoke

## Atomic Commits

One commit per runtime responsibility. Do not mix middleware, response, and error changes.

## Definition of Done

```text
□ runtime has no feature business logic
□ middleware order is explicit
□ request id/context works consistently
□ response envelope is shared
□ error handler owns final error response
□ smoke path is verified
```

## Merge Contract

Return commit list, files changed, verification result, review result, known exceptions, and ready-for-merge status.

## Freeze Criteria

Runtime Foundation can freeze when all BE-01 checklist items pass.

## Next Phase

BE-02 Repository Foundation.
