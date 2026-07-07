# BE-03 — REST API Layer

Status: ACTIVE
Owner: Backend Architecture
Domain: Backend Execution

## Purpose

BE-03 establishes the REST API layer for the Laundry backend while preserving the Project OS rules:

- Business Blueprint remains the highest business source of truth.
- schema.prisma remains the data model source of truth.
- REST routes must use the shared response envelope.
- Business logic must stay outside UI and thin routes.
- Workspace isolation must be enforced for Resort Workspace access.

## Scope

Initial BE-03 scope is the Laundry Work REST API foundation.

Laundry Work is the operational aggregate root for the production flow.

## Prerequisites

- BE-01 Runtime Foundation is available.
- Express app mounts routes under `/api`.
- Shared response helpers exist in `backend/src/core/httpResponse.js`.
- Shared Prisma client exists in `backend/src/core/prisma.js`.
- Error and not-found middleware exist.

## Dependencies

- `project-os/02-business/Laundry-Blueprint.md`
- `project-os/06-domain-model/schema.prisma`
- `project-os/08-standards/DEVELOPMENT-STANDARDS.md`
- `project-os/10-adr/ADR-0001.md`
- `project-os/04-contracts/BE-03-Laundry-Works-API.md`

## Allowed Files

BE-03 may modify or add:

```text
backend/src/routes/**
backend/src/services/**
backend/src/validators/**
backend/src/middlewares/error.middleware.js
project-os/04-contracts/**
project-os/backend/execution/**
project-os/11-boot/BOOT-REPORT.md
```

## Forbidden Files Without Explicit Approval

```text
project-os/06-domain-model/schema.prisma
project-os/02-business/Laundry-Blueprint.md
project-os/01-constitution/PROJECT-CONSTITUTION.md
```

Schema, business-flow, permission, or workspace-boundary changes require ADR review.

## REST Endpoints

```text
GET    /api/laundry/works
GET    /api/laundry/works/:workId
POST   /api/laundry/works
PATCH  /api/laundry/works/:workId/status
```

## Implementation Rules

- Routes must stay thin.
- Route handlers must use `async` handlers and pass failures to `next(error)`.
- Responses must use `sendSuccess` / `sendFailure`.
- Request validation must happen before service execution.
- Service code may use Prisma.
- Resort Workspace requests must be scoped by `resortId`.
- API responses must use project domain language.

## Current Atomic Commits

```text
0985759 BE-03: add laundry work API service
aac4e59 BE-03: add laundry work routes
16aabc6 BE-03: mount laundry work routes
527a0c9 BE-03: add laundry work request validators
efce98e BE-03: validate laundry work route requests
a8652d8 BE-03: include validation details in error meta
```

## Definition of Done

BE-03 is done when:

- REST API contract exists.
- Routes are mounted under `/api`.
- Request validation exists.
- Response envelope is consistent.
- Workspace scope behavior is documented.
- Runtime verification is performed in a real backend environment.

## Current Gaps

- Runtime verification has not been executed through GitHub Connector.
- Auth-derived workspace scope is not implemented yet.
- Status transition policy is not enforced yet; this belongs to BE-07 Policy and Domain Rules unless explicitly moved earlier.
