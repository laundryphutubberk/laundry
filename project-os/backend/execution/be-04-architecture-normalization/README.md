# BE-04 Architecture Normalization

Status: APPROVED_FOR_DOCS_ONLY
Scope: Backend Execution Package
Owner: Backend Architecture
Reviewer: Backend Engineering
Approver: Backend Architecture
Estimated Complexity: L

## Approval State

Discovery: PASS
Implementation: HOLD
Current approved work: BE-04.00 Documentation Cleanup Only

BE-04 implementation must wait for BE-02 Repository Boundary and BE-03 Controller/API Boundary unless the Chief Architect explicitly approves overlap.

## Purpose

Normalize backend modules to the BE-OS clean backend layer standard so every module follows one responsibility-based structure before deeper business workflow work continues.

Canonical target flow:

Routes -> Controller -> Service -> Repository -> Prisma

Side-layer ownership:

- Controller: Validator and Response Mapper
- Service: Policy, Guard, Domain Error, Transaction decision
- Repository: Prisma query shape and Repository Mapper

## Source of Truth

BE-04 must follow:

1. project-os/02-business/Laundry-Blueprint.md
2. project-os/01-constitution/PROJECT-CONSTITUTION.md
3. project-os/06-domain-model/schema.prisma
4. project-os/03-engineering/Engineering Blueprint.md
5. project-os/08-standards/DEVELOPMENT-STANDARDS.md
6. project-os/backend/execution/README.md
7. this execution package

## Scope

BE-04 owns architecture normalization only. It does not add new product features.

Current approved documentation-only scope may:

- correct stale path references from previous project templates
- record discovered current backend architecture
- record technical debt and architecture gaps
- propose future BE-04 implementation order

Future implementation may:

- normalize module folder structure
- add mandatory module index.js
- separate controller, service, repository, mapper, validator, policy, guard, and errors files
- move Prisma access out of controller/service into repository
- move response shaping into response mapper
- move Prisma-to-domain shaping into repository mapper
- document exceptions where full normalization must wait for BE-05, BE-06, BE-07, or BE-08

## Initial Laundry Module Order

Discovered current laundry backend modules:

1. Laundry Works
2. Laundry Bags

Future module order must be re-evaluated after BE-02 and BE-03 freeze.

## Prerequisites

- BE-OS Execution System README is standard.
- FAST-BOOT-SUMMARY is available.
- BACKEND-MASTER-ROADMAP is available.
- BE-01 Runtime Foundation is stable enough for BE-04 discovery.
- BE-02 Repository Foundation should define repository boundary before BE-04 implementation.
- BE-03 REST API Layer should freeze route/controller/API contract boundary before BE-04 implementation.
- Current module behavior must be preserved unless a package explicitly authorizes a behavior change.

## Dependencies

Upstream:

- BE-01 Runtime Foundation
- BE-02 Repository Foundation
- BE-03 REST API Layer
- BE-OS clean backend standards

Downstream:

- BE-05 Business Layer
- BE-06 Validation
- BE-07 Policy and Domain Rules
- BE-08 Transaction and Consistency
- BE-09 Observability

## Allowed Files

Current BE-04.00 approved documentation files:

- project-os/backend/execution/be-04-architecture-normalization/README.md
- project-os/backend/execution/README.md
- project-os/backend/BACKEND-MASTER-ROADMAP.md
- project-os/11-boot/FAST-BOOT-SUMMARY.md

Only documentation updates are allowed under BE-04.00.

Future BE-04 implementation candidate paths are not approved yet. They must be re-confirmed after BE-02 and BE-03. Candidate laundry paths may include:

- backend/src/modules/**
- backend/src/routes/module.routes.js

If the project keeps the current backend/src/routes, backend/src/services, and backend/src/validators structure after BE-02/BE-03, this list must be adjusted before implementation.

## Forbidden Files

BE-04.00 must not modify runtime code:

- backend/src/**
- backend/index.js
- backend/prisma/schema.prisma
- backend/prisma/migrations/**
- frontend/**
- .env files
- package manager files

BE-04 implementation must not modify unrelated app/domain infrastructure unless explicitly approved.

BE-04 must not introduce new business workflows. If business logic gaps are discovered, document them for BE-05.

## Parallel Tasks

Parallel execution is allowed only when tasks do not share mutable ownership of the same module files or API contracts.

Implementation HOLD rule:

BE-04 implementation waits for BE-02 repository boundary and BE-03 controller/API boundary unless Chief Architect explicitly approves overlap.

## Milestones

Current approved milestone:

- BE-04.00 Documentation cleanup and discovery report

Future implementation milestones, not approved yet:

- BE-04.01 Normalize Laundry Works module architecture
- BE-04.02 Normalize Laundry Bags module architecture
- BE-04.03 Extract shared validation helper if approved by BE-06 boundary
- BE-04.04 Introduce repository boundary after BE-02 freeze
- BE-04.05 Introduce controller boundary after BE-03 freeze
- BE-04.06 Add response/repository mappers only where needed
- BE-04.07 Architecture normalization review and freeze

## Definition of Done

BE-04.00 is complete when:

- stale fieldops-be path references are removed
- stale fieldops-fe path references are removed
- stale docs/project-os execution path references are corrected to project-os
- Laundry-specific backend root is documented as backend/
- Architecture Discovery Report is recorded
- runtime implementation remains untouched
- schema and frontend remain untouched
- BE-04 implementation remains HOLD

Future BE-04 implementation is complete when:

- target modules follow Routes -> Controller -> Service -> Repository -> Prisma
- controllers contain HTTP-only logic
- services do not import Prisma directly
- repositories are the only module layer importing Prisma
- response mappers own API DTO shape where present
- repository mappers own Prisma-to-domain shape where present
- module index.js exists where required
- known exceptions are documented
- no new product features are introduced

## Review Checklist

BE-04.00 reviewers must confirm:

- documentation-only changes
- no runtime backend code changes
- no schema changes
- no frontend changes
- no controller/repository/module migration was performed
- discovery report reflects current repository state
- implementation remains HOLD

Future implementation reviewers must confirm:

- no controller imports Prisma
- no service imports Prisma directly
- repository methods accept explicit scope such as resortId where applicable
- route middleware remains in the route layer
- business behavior is preserved
- deferred validation/policy/transaction work is recorded for later phases
- changed files stay within approved allowed files

## BE-04 Architecture Discovery Report

Discovery status:

- BE-04 Architecture Normalization Discovery: PASS
- Implementation: HOLD
- Approved work now: BE-04.00 Documentation Cleanup Only

### Backend Root

Confirmed current backend root: backend/

Runtime entry: backend/index.js
Runtime app bootstrap: backend/src/app.js
Route root: backend/src/routes/index.js
Current API mount: /api

### Current Layer Structure

Current flow:

backend/index.js -> backend/src/app.js -> backend/src/routes/index.js -> backend/src/routes/*.routes.js -> backend/src/services/*.service.js -> backend/src/core/prisma.js

### Dependency Direction

Current dependency direction:

Route -> Service -> Prisma

Target future BE-04 direction:

Route -> Controller -> Service -> Repository -> Prisma

### Discovered Modules

laundryWorks:

- backend/src/routes/laundryWorks.routes.js
- backend/src/services/laundryWorks.service.js
- backend/src/validators/laundryWorks.validator.js

laundryBags:

- backend/src/routes/laundryBags.routes.js
- backend/src/services/laundryBags.service.js
- backend/src/validators/laundryBags.validator.js

### Shared Runtime and Utilities

- backend/src/config/env.js
- backend/src/core/prisma.js
- backend/src/core/runtimeShutdown.js
- backend/src/core/health.js
- backend/src/core/databaseHealth.js
- backend/src/core/httpResponse.js
- backend/src/core/requestContext.js

### Shared Middleware

- backend/src/middlewares/requestId.middleware.js
- backend/src/middlewares/requestContext.middleware.js
- backend/src/middlewares/notFound.middleware.js
- backend/src/middlewares/error.middleware.js

### Technical Debt List

1. Routes currently contain controller behavior.
2. Services currently contain data access behavior.
3. Services import Prisma directly.
4. Repository boundary does not exist yet.
5. Controller boundary does not exist yet.
6. Response mapper boundary does not exist yet.
7. Repository mapper boundary does not exist yet.
8. Module-level index.js boundary does not exist yet.
9. Workspace scope helper logic is duplicated across services.
10. parseRequest helper is duplicated across validators.
11. Domain errors are plain Error objects with ad hoc statusCode.
12. Transaction decisions currently live inside service files.
13. BE-04 implementation would overlap BE-02 and BE-03 if started too early.

### Architecture Gap List

1. BE-04 canonical target requires Controller and Repository layers, but current backend only has Routes and Services.
2. BE-04 future module paths must be re-confirmed because current backend is organized as routes, services, and validators.
3. BE-04 must wait for BE-02 to define repository ownership before moving Prisma access.
4. BE-04 must wait for BE-03 to freeze controller/API boundary before moving route handlers.
5. Existing routes and services are functional and should not be moved during documentation cleanup.

### Dependency Diagram

index.js -> app.js -> routes/index.js -> laundryWorks.routes.js -> laundryWorks.service.js -> core/prisma.js
index.js -> app.js -> routes/index.js -> laundryBags.routes.js -> laundryBags.service.js -> core/prisma.js

### Layer Diagram

Runtime Layer:

- backend/index.js
- backend/src/app.js

Route Layer:

- backend/src/routes/index.js
- backend/src/routes/laundryWorks.routes.js
- backend/src/routes/laundryBags.routes.js

Validation Layer:

- backend/src/validators/laundryWorks.validator.js
- backend/src/validators/laundryBags.validator.js

Service Layer:

- backend/src/services/laundryWorks.service.js
- backend/src/services/laundryBags.service.js

Core / Infrastructure Layer:

- backend/src/core/prisma.js
- backend/src/core/httpResponse.js
- backend/src/core/requestContext.js
- backend/src/core/health.js
- backend/src/core/databaseHealth.js
- backend/src/core/runtimeShutdown.js
- backend/src/config/env.js

### Module Ownership Map

laundryWorks owns laundry work route/service/validator behavior and is a future candidate owner of laundry work controller/repository/mapper after approval.

laundryBags owns laundry bag route/service/validator behavior and is a future candidate owner of laundry bag controller/repository/mapper after approval.

shared core owns runtime support, Prisma bootstrap, response envelope, health, request context, and shutdown.

shared middleware owns request id, request context binding, not found, and error handling.

### Circular Dependency Discovery

No circular dependency was confirmed during documentation discovery.

Current observed direction is mostly one-way:

runtime -> app -> routes -> services -> core/prisma

A deeper static import graph should be produced before implementation if more modules are added.

### Proposal for BE-04 Implementation

Recommended safe sequence:

1. Complete BE-02.01 / BE-02.02 repository boundary first.
2. Complete BE-03.01 / BE-03.02 API/controller contract freeze first.
3. Re-open BE-04 implementation approval.
4. Normalize one module at a time.
5. Start with laundryWorks, then laundryBags.
6. Preserve current API behavior and response contracts.
7. Record validation, policy, and transaction gaps for BE-06, BE-07, and BE-08 instead of solving them inside BE-04.

## Merge Contract

Every future implementation task must return:

- Commit List
- Files Changed
- Verification Result
- Review Result
- Known Exceptions
- Ready For Merge

BE-04.00 documentation cleanup return contract:

- Files Changed
- Documentation Verification Result
- Known Exceptions
- Implementation Hold Confirmation

## Freeze Criteria

BE-04 may be frozen when:

- BE-04.01 through BE-04.07 are complete or explicitly deferred
- BE-04.08 review is approved
- all known architecture deviations are recorded
- BE-05 can start without re-deciding module structure

BE-04.00 does not freeze BE-04 implementation.

## Next Phase

BE-04 implementation remains HOLD.

Recommended next backend execution order:

1. BE-02 Repository Foundation
2. BE-03 REST API Layer / Contract Freeze
3. BE-04 Architecture Normalization Implementation
4. BE-05 Business Layer
