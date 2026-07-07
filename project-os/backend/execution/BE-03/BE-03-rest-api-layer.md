# BE-03 REST API Layer Execution Package

Status: Standard
Scope: Backend REST API Layer
Owner: Backend Architecture
Estimated Complexity: L

## Purpose

Normalize REST API boundaries so routes, controllers, validators, response mappers, and error contracts follow BE-OS.

## Scope

Routes, controllers, request validation entry points, response mapper usage, shared response helper usage, API contract review.

## Prerequisites

BE-01 Runtime Foundation and BE-02 Repository Foundation verified for target scope.

## Dependencies

Depends on BE-01 and BE-02. Enables BE-04 module normalization and BE-05 business layer work.

## Allowed Files

- `fieldops-be/src/modules/**/**.routes.js`
- `fieldops-be/src/modules/**/**.controller.js`
- `fieldops-be/src/modules/**/**.response.mapper.js`
- API documentation files

## Forbidden Files

- repository query rewrites outside approved module scope
- database schema changes
- frontend files unless contract notes are explicitly requested

## Parallel Tasks

Can run per module when each task owns separate module route/controller files.

## Milestones

- BE-03.01 Route Standardization
- BE-03.02 Controller Template Alignment
- BE-03.03 Response Mapper Alignment
- BE-03.04 Error Contract Alignment
- BE-03.05 API Review

## Atomic Commits

One commit per module API boundary or one contract responsibility.

## Definition of Done

```text
□ routes only compose path, middleware, and controller
□ controller has no database access
□ controller uses shared response helper
□ controller delegates business work to service
□ response mapper protects API output shape
□ errors flow to global handler
```

## Merge Contract

Return commit list, files changed, API contract notes, verification result, review result, known exceptions, and ready-for-merge status.

## Freeze Criteria

Freeze when API checklist passes for target module or package.

## Next Phase

BE-04 Architecture Normalization.
