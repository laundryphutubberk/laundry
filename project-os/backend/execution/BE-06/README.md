# BE-06 Validation

Status: Draft
Scope: Backend Execution Package
Owner: Backend Architecture
Reviewer: Backend Engineering
Approver: Backend Architecture
Estimated Complexity: L

## Purpose

Standardize backend request validation, DTO construction, and validation error contracts so controllers receive trusted request data and services receive domain-safe input.

BE-06 makes Validator ownership explicit and removes ad-hoc request checks from controllers and services where possible.

## Scope

BE-06 owns validation and request contract standardization.

This phase may:

- add or normalize `*.validator.js` or `*.validation.js` files
- define request DTO builders
- define validation schemas for body, params, and query
- normalize validation middleware usage in routes/controllers
- normalize validation error codes and shapes
- document domain validation that must remain in service or policy

Validation ownership:

```text
Route / Controller
  -> request validation
  -> request DTO
  -> Service
```

Domain validation ownership:

```text
Service / Policy
  -> domain invariants
  -> lifecycle rule validation
```

## Early Development Refactor Policy

The project is currently in early development.

Within the BE-06 Validation ownership boundary, maintainers and backend validation stewards may modify, move, rename, or delete existing validation-related files when doing so improves architecture, removes duplication, or establishes a single validation standard.

Clean architecture and a single source of truth are preferred over backward compatibility inside BE-06.

This means BE-06 work may:

- delete old validators after all references are migrated
- remove compatibility layers that are no longer needed
- replace local validation helpers with the BE-06 standard validation foundation
- consolidate duplicate request validation, DTO construction, and error contracts
- update route and controller integration points needed for validation handoff
- normalize validation file names, exports, and imports

This permission applies only inside the active responsibility boundary of BE-06.

BE-06 must still avoid unrelated changes to:

```text
business logic outside validation handoff
Prisma schema and migrations
frontend code
CI/CD configuration
repository implementations
other execution packages
```

If a BE-06 task must touch a boundary-adjacent file, the reason must be documented in the task return contract.

## Prerequisites

- BE-04 target module architecture is normalized.
- BE-05 target business workflow is known or stable enough to define DTOs.
- Existing API contracts are known.
- Standard error response contract exists.
- Validation helper/middleware exists or is explicitly created by a validation foundation task.

## Dependencies

Upstream:

- BE-04 Architecture Normalization
- BE-05 Business Layer
- BE-OS response and error standards

Downstream:

- BE-07 Policy and Domain Rules
- BE-08 Transaction and Consistency
- BE-09 Observability
- BE-10 Production Readiness

## Allowed Files

BE-06 may modify validation-related files and minimal route/controller integration points:

```text
fieldops-be/src/modules/**/*.validator.js
fieldops-be/src/modules/**/*.validation.js
fieldops-be/src/modules/**/*.schema.js
fieldops-be/src/modules/**/*.dto.js
fieldops-be/src/modules/**/*.controller.js
fieldops-be/src/modules/**/*.routes.js
fieldops-be/src/modules/**/*.errors.js
fieldops-be/src/core/validation/**
docs/project-os/backend/execution/BE-06/**
```

Controller and route edits must be limited to validation integration and DTO handoff.

## Forbidden Files

BE-06 must not modify unrelated data or business layers except for documented validation handoff needs:

```text
fieldops-fe/**
fieldops-be/prisma/schema.prisma
fieldops-be/prisma/migrations/**
fieldops-be/src/modules/**/*.repository.js
fieldops-be/src/app.js
fieldops-be/src/server.js
.env*
package.json
lock files
```

Service files should not be modified unless moving request-shape checks out of service into validator is necessary and approved by the atomic task.

## Parallel Tasks

Parallel validation tasks are safe when module ownership does not overlap.

Suggested parallel groups:

- Issue validation and Invite validation may run separately.
- Member and Organization validation should coordinate shared identity/status rules.
- Equipment and Field Session validation should coordinate ID, QR, status, and lifecycle field naming.
- Auth validation must coordinate with security/auth ownership.

## Milestones

- BE-06.01 Define validation foundation and DTO standard
- BE-06.02 Normalize Issue validation
- BE-06.03 Normalize Invite validation
- BE-06.04 Normalize Member validation
- BE-06.05 Normalize Organization validation
- BE-06.06 Normalize Equipment validation
- BE-06.07 Normalize Auth validation
- BE-06.08 Normalize Field Session validation
- BE-06.09 Validation review and freeze

## Atomic Commits

Atomic commit themes:

- `BE-06.01 Define validation DTO standard`
- `BE-06.02 Normalize issue validation`
- `BE-06.03 Normalize invite validation`
- `BE-06.04 Normalize member validation`
- `BE-06.05 Normalize organization validation`
- `BE-06.06 Normalize equipment validation`
- `BE-06.07 Normalize auth validation`
- `BE-06.08 Normalize field session validation`
- `BE-06.09 Freeze validation layer`

Each commit should prefer one module or one shared validation foundation task at a time.

## Definition of Done

BE-06 is complete when:

- route/controller layer validates body, params, and query before calling service
- service receives a DTO or sanitized payload, not raw request objects
- validation errors use stable error codes
- request validation is separated from domain policy validation
- validators do not import Prisma
- validators do not contain persistence logic
- validation gaps are documented for deferred work
- changed files stay within Allowed Files

## Review Checklist

Reviewers must confirm:

- controllers do not contain ad-hoc request parsing beyond validation integration
- validators own request shape and DTO construction
- service methods receive sanitized data
- validation schemas do not perform database queries
- domain lifecycle rules are not misplaced into request validators
- error codes are stable and documented
- no business behavior is changed silently

## Merge Contract

Every task must return:

```text
Commit List
Files Changed
Verification Result
Review Result
Known Exceptions
Ready For Merge
```

## Freeze Criteria

BE-06 may be frozen when:

- all target modules have validation ownership documented or implemented
- validators are consistently named and placed
- DTO handoff from controller to service is consistent
- validation error contract is stable
- BE-07 can define policies without compensating for request-shape uncertainty

## Next Phase

BE-07 Policy and Domain Rules
