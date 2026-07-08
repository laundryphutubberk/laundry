# BACKEND-STRUCTURE-BLUEPRINT.md

Status: Active  
Owner: Backend Architect  
Project: `laundryphutubberk/laundry`  
Last structural source: uploaded `src.zip` snapshot reviewed during BE-06 / Backend Structure Migration discovery

---

## Purpose

This document defines the backend structure that all backend execution phases must use.

It exists so Human and AI can understand the intended backend architecture without reopening the old `src/` tree every time.

The goal is not to create CRUD for every Prisma model. The goal is to map every domain model, runtime module, legacy folder, and migration decision to the correct backend structure before implementation.

This file is the source of reference for:

- backend layer ownership
- module skeleton
- legacy-to-canonical migration
- module inventory
- BE phase gates
- allowed migration strategy
- files that must not be moved blindly

---

## Core Principle

Backend design must start from the full domain model.

```text
schema.prisma
  -> Domain Classification
  -> Backend Structure Matrix
  -> Module Skeleton
  -> Execution Phases
  -> Implementation
```

Do not assume that every Prisma model needs a public API.

Some models are aggregate roots. Some are child entities. Some are logs. Some are derived summaries. Some are internal implementation details.

A public API is allowed only when the business behavior, workspace boundary, validation responsibility, policy responsibility, transaction impact, and response contract are understood.

---

## Required Design Sequence

Before backend implementation or migration work, complete this sequence:

```text
1. Read Business Blueprint
2. Read schema.prisma
3. Read this Backend Structure Blueprint
4. Classify every relevant Prisma model
5. Decide runtime module ownership
6. Decide repository ownership
7. Decide service/business ownership
8. Decide API exposure
9. Decide validation and policy responsibility
10. Decide transaction boundary
11. Create or update the Backend Structure Matrix
12. Create or migrate module skeleton only where justified
13. Start BE execution phase work
```

---

## Canonical Backend Root

The canonical implementation root is:

```text
backend/src/
```

When working from an uploaded or extracted source package, the source root may appear as:

```text
src/
```

In that case, treat it as equivalent to:

```text
backend/src/
```

The target production repository structure remains:

```text
backend/src/
```

---

## Current Real Structure Snapshot

The latest reviewed `src.zip` snapshot contains this top-level shape:

```text
src/
  app.js
  server.js
  test-db.js
  config/
  core/
  lib/
  middlewares/
  modules/
  routes/
  shared/
  utils/
```

Observed counts from the reviewed snapshot:

| Area | Approx. files | Status |
|---|---:|---|
| `src/modules/` | 617 | Main runtime module area, mixed old/new patterns |
| `src/core/` | 53 | Preferred shared runtime foundation |
| `src/shared/` | 30 | Legacy/shared compatibility area |
| `src/routes/` | 4 | Central route registry / bootstrap |
| `src/middlewares/` | 4 | Legacy middleware area |
| `src/utils/` | 3 | Legacy utility area |
| `src/config/` | 1 | Runtime config |
| `src/lib/` | 1 | Legacy library area |
| root files | 3 | Runtime entry/test files |

Important: these counts describe the reviewed source snapshot, not a permanent contract. Update this section when the source structure changes materially.

---

## Canonical Backend Layer

Backend modules must follow this dependency direction:

```text
Route
  -> Controller
  -> Service
  -> Business / Policy
  -> Repository
  -> Prisma
```

Rules:

- Route declares endpoint and middleware composition only.
- Controller owns HTTP request/response boundary.
- Controller must not own business decisions.
- Controller must not import Prisma.
- Service owns application workflow.
- Business layer owns domain rules.
- Policy layer owns permission and workspace decisions.
- Repository owns data access and Prisma query shape.
- Only repository should import Prisma for domain data access.
- Mappers translate persistence or response shape but must not own workflow decisions.
- Validation owns request shape, type, required fields, params/query/body, and DTO construction.
- Business and Policy rules must not be hidden inside validators.

---

## Canonical Module Skeleton

For a full runtime module:

```text
backend/src/modules/<domain>/
  index.js
  <domain>.routes.js
  <domain>.controller.js
  <domain>.service.js
  <domain>.business.js
  <domain>.policy.js
  <domain>.repository.js
  <domain>.validation.js
  <domain>.errors.js
  <domain>.response.mapper.js
  <domain>.repository.mapper.js
  <domain>.service.test.js
  <domain>.repository.spec.js
```

Not every module needs every file. Required files depend on the module category and Backend Structure Matrix.

Preferred naming:

| Concern | Preferred file |
|---|---|
| Route | `<domain>.routes.js` |
| Controller | `<domain>.controller.js` |
| Service | `<domain>.service.js` |
| Business rules | `<domain>.business.js` |
| Policy rules | `<domain>.policy.js` |
| Repository | `<domain>.repository.js` |
| Request validation / DTO | `<domain>.validation.js` |
| Module errors | `<domain>.errors.js` |
| Response mapper | `<domain>.response.mapper.js` |
| Repository mapper | `<domain>.repository.mapper.js` |

Legacy names such as `.route.js`, `.validator.js`, `.validators.js`, and ad-hoc filter files may exist during migration, but the canonical target should be documented before moving or renaming.

---

## Model Classification Types

| Type | Meaning | Runtime Expectation |
|---|---|---|
| Aggregate Root | Main operational owner of a workflow | Usually full module |
| Entity | Child object owned by aggregate or domain | Module or submodule |
| Internal Log | Historical/audit record | Repository/internal only |
| Derived Summary | Computed or projected state | Read-only/query module or internal |
| Lookup / Master Data | Stable reference data | Limited module or admin-only |
| Policy Object | Permission/workspace control object | Policy module or service integration |
| Infrastructure | Technical/runtime support | Core/shared, not business module |

---

## Laundry Domain Structure Matrix

| Prisma Model | Classification | Runtime Module | Repository | Service | Business | API | Policy | Transaction | Notes |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| User | Identity / Actor | Yes | Yes | Yes | Limited | Yes | Yes | Optional | Auth/user capability required before production |
| Resort | Aggregate / Workspace Owner | Yes | Yes | Yes | Yes | Yes | Yes | Optional | Owns resort workspace boundary |
| LaundryItemType | Lookup / Master Data | Limited | Yes | Limited | No | Limited | Optional | No | Reference data for counting/classification |
| LaundryWork | Aggregate Root | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Operational center of the system |
| LaundryBag | Entity under LaundryWork | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Intake unit |
| LaundryCountLine | Entity under Work/Bag | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Real counted linen quantity |
| LinenMovement | Internal Domain Event / Ledger | Internal | Yes | Yes | Yes | Limited | Yes | Yes | Should be produced by workflows, not generic CRUD |
| LinenInventorySummary | Derived Summary | Read Model | Yes | Yes | Limited | Read-only | Yes | Yes | Calculated from movement history |
| IssueReport | Domain Entity | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Damaged/lost/mismatch tracking |
| WorkStatusLog | Internal Log | Internal | Yes | No | No | No | No | Via owner | Created by Work/Bag workflows |
| LaundryMachine | Master / Operational Resource | Yes | Yes | Yes | Yes | Yes | Optional | Optional | Used for machine planning |
| LaundryMachineLoadRule | Rule / Master Data | Limited | Yes | Yes | Yes | Limited | Optional | Optional | Supports load planning standards |
| WashLoadPlan | Planning Aggregate | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Machine load planning capability |

---

## Module Coverage Categories

### Full Module

Requires route, controller, service, business, policy, repository, validation, and tests when exposed as a runtime capability.

Recommended for:

```text
LaundryWork
LaundryBag
LaundryCountLine
IssueReport
WashLoadPlan
Resort
User/Auth
```

### Internal Module

No public route by default. Accessed through another workflow.

Recommended for:

```text
LinenMovement
WorkStatusLog
```

### Read Model Module

Read-only or derived. No generic writes.

Recommended for:

```text
LinenInventorySummary
```

### Limited Module

May support admin/master-data use cases only.

Recommended for:

```text
LaundryItemType
LaundryMachineLoadRule
```

### Infrastructure/Core Module

Supports runtime behavior but is not a business capability.

Examples:

```text
audit
auth core
errors
http
context
validation foundation
monitoring
notification outbox
```

---

## API Exposure Rule

A Prisma model may expose an API only when all are true:

```text
1. Business Blueprint supports user-facing behavior
2. Workspace boundary is understood
3. Validation rules are known
4. Policy boundary is known
5. Transaction impact is understood
6. Response contract is documented
```

If not, keep the model internal until the missing items are resolved.

Never expose generic CRUD simply because a Prisma model exists.

---

## Validation vs Business vs Policy Boundary

This distinction is mandatory for BE-06 and BE-07.

### Validation owns

```text
request shape
field type
required / optional fields
body / params / query parsing
DTO construction
format checks
enum shape checks
pagination query shape
```

### Business owns

```text
status transition
workflow restriction
domain lifecycle rule
uniqueness beyond database constraints
issue/mismatch decision
inventory movement rule
planning decision
activation/deactivation business rule
```

### Policy owns

```text
authenticated user
role
workspace type
resortId isolation
organization boundary
ownership
permission
cross-workspace access
```

If a rule looks like validation but depends on workflow, status, permission, ownership, or existing database state, record it as a Boundary Risk and send it to BE-05 or BE-07. Do not silently move it into BE-06 validators.

---

## Repository Rule

Repository is required when a model is queried or mutated by runtime code.

Repository rules:

- Repository owns Prisma query shape.
- Repository supports transaction-compatible client where needed.
- Service must not import Prisma directly.
- Repository must not own business flow.
- Repository must not silently enforce business policy unless explicitly named as query scope.
- Repository may expose scoped query methods when the scope is explicit in the method name.
- Repository must not return response-shaped data unless a repository mapper is explicitly responsible for it.

---

## Business Layer Rule

Business layer is required when a domain has rules such as:

- status transition
- uniqueness beyond database constraints
- workflow restriction
- issue/mismatch decision
- inventory movement rule
- ownership/workspace implication
- planning decision
- activation/deactivation behavior

Business layer must not query Prisma directly.

---

## Policy Rule

Policy layer is required when behavior depends on:

- authenticated user
- role
- workspace type
- resortId isolation
- organization boundary
- ownership
- permission

Policy must not be replaced by client-provided query params in production.

---

## Transaction Rule

Transaction boundary is required when one operation changes more than one model or writes history/summary together with the main entity.

Examples:

```text
Create Bag
  -> create LaundryBag
  -> update LaundryWork bagCount/status
  -> create WorkStatusLog

Count Linen
  -> create LaundryCountLine
  -> create LinenMovement
  -> update LinenInventorySummary

Report Issue
  -> create IssueReport
  -> create LinenMovement if inventory-affecting
  -> update work/bag state if needed
```

---

## Canonical Core and Legacy Areas

### Preferred core area

```text
backend/src/core/
  audit/
  auth/
  context/
  errors/
  http/
  middleware/
  prisma/
  response/
  validation/
```

Core is for reusable runtime infrastructure. It must not contain domain-specific workflow rules.

### Legacy areas observed in the real source snapshot

```text
backend/src/shared/
backend/src/middlewares/
backend/src/utils/
backend/src/lib/
backend/src/routes/
```

These areas may remain during migration, but they should be treated as compatibility or registry layers until explicitly normalized.

### Legacy-to-canonical target map

| Legacy/current area | Canonical target | Migration note |
|---|---|---|
| `src/lib/prisma.js` | `src/core/prisma/` | Keep only one Prisma export path after migration |
| `src/middlewares/*` | `src/core/middleware/` | Move only infrastructure middleware |
| `src/utils/apiResponse.js` | `src/core/response/` or `src/core/http/` | Must preserve response contract |
| `src/utils/appError.js` | `src/core/errors/` | Must preserve error contract |
| `src/utils/asyncHandler.js` | `src/core/http/` or `src/core/middleware/` | Framework helper, not domain logic |
| `src/shared/errors/*` | `src/core/errors/` | Merge only after duplicate error contract review |
| `src/shared/responses/*` | `src/core/response/` | Merge only after response contract review |
| `src/shared/validation/*` | `src/core/validation/` | BE-06 owner; no business rules |
| `src/routes/*` | route registry / app bootstrap | Do not move blindly; app entry depends on this |
| `src/modules/*/*.route.js` | `src/modules/*/*.routes.js` | Rename only with import updates and tests |
| `src/modules/*/*.validator.js` | `src/modules/*/*.validation.js` | Rename only after BE-06 validation contract decision |
| `src/modules/*/*.validators.js` | `src/modules/*/*.validation.js` | Consolidate duplicate validation ownership |
| `src/modules/*/*Filters.js` | module validation/query DTO or repository query builder | Classify before moving; may be validation or repository concern |

---

## Current Module Inventory From Real Source Snapshot

This inventory was built from the uploaded `src.zip` source snapshot. It is used as the current migration map so agents do not need to reopen the old tree for every task.

| Module | Files | Observed concerns |
|---|---:|---|
| `app-feature` | 10 | route, controller, service, repository, validator, test |
| `attachment` | 10 | route, controller, service, repository, validator, test, spec |
| `attachments` | 7 | route, routes, controller, service, validator, validators, test |
| `audit` | 7 | route, routes, controller, service, validator, validators, test |
| `auth` | 10 | route, routes, controller, service, repository, policy, validation, errors, response.mapper, repository.mapper |
| `consumable` | 10 | route, controller, service, repository, validator, test, spec |
| `equipment` | 19 | routes, controller, service, repository, policy, validator, validation, errors, response.mapper, repository.mapper, test, spec, filters |
| `equipment-category` | 10 | route, controller, service, repository, validator, test, spec |
| `equipment-movement` | 10 | route, controller, service, repository, validator, test, spec |
| `field-session` | 26 | route, routes, controller, service, repository, policy, validator, validation, errors, response.mapper, repository.mapper, test, spec, filters |
| `field-session-billing` | 10 | route, controller, service, repository, validator, test, filters |
| `field-session-consumable-usage` | 3 |  |
| `field-session-expense` | 10 | route, controller, service, repository, test, filters |
| `field-session-item` | 10 | route, controller, service, repository, validator, test, spec |
| `field-session-participant` | 10 | route, controller, service, repository, validator, test, spec |
| `field-session-payout` | 10 | route, controller, service, repository, validator, test, spec |
| `field-session-required-consumable` | 10 | route, controller, service, repository, validator, test, spec |
| `field-session-required-tool` | 10 | route, controller, service, repository, validator, test, spec |
| `field-session-runtime` | 7 | route, routes, controller, service, validator, validators, test |
| `field-session-service-item-usage` | 3 |  |
| `field-team-member` | 10 | route, controller, service, repository, validator, test, spec |
| `finance` | 7 | route, routes, controller, service, validator, validators, test |
| `invites` | 14 | route, routes, controller, service, repository, policy, validators, validation, errors, response.mapper, repository.mapper, test |
| `issue` | 17 | route, routes, controller, service, repository, policy, validator, validation, errors, response.mapper, repository.mapper, test |
| `locations` | 7 | route, routes, controller, service, validator, validators, test |
| `member` | 12 | route, routes, controller, service, repository, policy, validation, errors, response.mapper, repository.mapper, test |
| `monitoring` | 7 | route, routes, controller, service, validator, validators, test |
| `notification-outbox` | 10 | route, controller, service, repository, validator, test, spec |
| `notifications` | 7 | route, routes, controller, service, validator, validators, test |
| `operational-issue` | 10 | route, controller, service, repository, validator, test, spec |
| `org-retention` | 10 | route, controller, service, repository, validator, test, spec |
| `org-user` | 13 | route, routes, controller, service, repository, validator, schema, test, spec |
| `organization` | 13 | route, routes, controller, service, repository, policy, validators, validation, errors, response.mapper, repository.mapper, test |
| `organization-alert` | 10 | route, controller, service, repository, validator, test, spec |
| `organization-data-request` | 10 | route, controller, service, repository, validator, test, spec |
| `organization-feature-access` | 10 | route, controller, service, repository, validator, test, spec, filters |
| `organization-invite` | 10 | route, controller, service, repository, validator, test, spec |
| `organization-location` | 10 | route, controller, service, repository, validator, test, spec |
| `organization-monitor` | 10 | route, controller, service, repository, validator, test, spec |
| `organization-subscription` | 10 | route, controller, service, repository, validator, test, spec |
| `organization-usage` | 10 | route, controller, service, repository, validator, test, spec |
| `platform` | 7 | route, routes, controller, service, validator, validators, test |
| `platform-audit` | 10 | route, controller, service, repository, validator, test, spec |
| `platform-expense` | 10 | route, controller, service, repository, validator, test, spec |
| `platform-finance` | 10 | route, controller, service, repository, validator, test, spec |
| `platform-invoice` | 10 | route, controller, service, repository, validator, test, spec |
| `platform-metric` | 10 | route, controller, service, repository, validator, test, spec |
| `platform-payment` | 10 | route, controller, service, repository, validator, test, spec |
| `platform-user` | 11 | route, controller, service, repository, schema, test, spec |
| `retention` | 7 | route, routes, controller, service, validator, validators, test |
| `return-verification` | 7 | route, routes, controller, service, validator, validators, test |
| `service-item` | 10 | route, controller, service, repository, validator, test, spec |
| `service-item-category` | 10 | route, controller, service, repository, validator, test, spec |
| `session-service-usage` | 7 | route, routes, controller, service, validator, validators, test |
| `subscription` | 7 | route, routes, controller, service, validator, validators, test |
| `subscription-plan` | 10 | route, controller, service, repository, validator, test, spec |
| `subscription-plan-entitlement` | 10 | route, controller, service, repository, validator, test, spec |
| `support-ticket` | 7 | route, routes, controller, service, validator, validators, test |
| `team` | 3 |  |
| `teams` | 7 | route, routes, controller, service, validator, validators, test |
| `usage` | 7 | route, routes, controller, service, validator, validators, test |
| `vehicle` | 3 |  |
| `vehicles` | 7 | route, routes, controller, service, validator, validators, test |
| `verification` | 7 | route, routes, controller, service, validator, validators, test |
| `work-profile` | 1 |  |
| `work-rate-profile` | 10 | route, controller, service, repository, validator, test, spec |

---

## Duplicate / Naming Collision Watchlist

These module pairs or naming patterns require explicit migration decisions before moving or merging:

```text
attachment / attachments
team / teams
vehicle / vehicles
.route.js / .routes.js
.validator.js / .validators.js / .validation.js
filters / query DTO / repository query shape
```

Rules:

- Do not merge singular/plural modules without owner approval.
- Do not delete compatibility modules until all imports are traced.
- Do not rename route/validation files without updating route registry and module exports.
- If a module pair represents different runtime capabilities, document both before moving.
- If a module pair is duplicate legacy residue, create a migration plan before deletion.

---

## Backend Structure Migration Strategy

Backend migration must be gate-based.

### Gate 0 — Inventory

Output:

```text
Old Path
New Path
Module Owner
Layer Type
Imports Affected
Boundary Risk
Move Safe: Yes/No
```

No files are moved in this gate.

### Gate 1 — Plan

Output:

```text
Migration batch
Files to move
Imports to update
Tests to run
Rollback note
Known exceptions
```

No files are moved without a reviewed plan.

### Gate 2 — Move

Allowed only after Gate 1 approval.

Rules:

- Move one module or one core area at a time.
- Preserve behavior.
- Update only imports/exports required by the move.
- Do not change business logic.
- Do not change schema.
- Do not change API contract unless an explicit API contract gate approves it.
- Do not change error/response contract unless an explicit contract gate approves it.

### Gate 3 — Verify

Verification must include at minimum:

```text
module import graph check
route registry check
service/controller require check
test run or documented reason test cannot run
manual smoke path if test suite is missing
```

### Gate 4 — Freeze

A migrated area can be frozen when:

```text
canonical path is stable
legacy imports are removed or intentionally retained
tests pass or exceptions are documented
no duplicate owner remains
Project OS docs are updated
```

---

## Migration Batch Recommendation

Preferred migration order:

```text
1. Core foundation mapping
   src/core, src/shared, src/utils, src/lib, src/middlewares

2. Route registry stabilization
   src/routes and app/server bootstrap references

3. Canonical-ready modules
   modules already close to route/controller/service/repository/validation shape

4. Full runtime modules
   auth, organization, member, issue, equipment, field-session, etc.

5. Duplicate/collision modules
   attachment/attachments, team/teams, vehicle/vehicles

6. Low-coverage modules
   work-profile and modules with very few files

7. Final cleanup
   legacy compatibility exports, duplicate validators, stale filters
```

---

## BE Phase Gates

Before a BE phase is considered complete, update or validate this matrix:

| Gate | Required Check |
|---|---|
| BE-01 | Runtime can host planned structure |
| BE-02 | Repository coverage exists for active runtime modules |
| BE-03 | API contracts exist only for approved runtime exposure |
| BE-04 | Layer direction matches canonical backend layer |
| BE-05 | Business coverage exists for required domains |
| BE-06 | Validation coverage exists for exposed APIs |
| BE-07 | Policy coverage exists for workspace and permission boundaries |
| BE-08 | Transaction coverage exists for multi-write workflows |
| BE-09 | Observability covers critical flows |
| BE-10 | Production readiness covers all active capabilities |

---

## Do Not Generate Generic CRUD

Never generate a public CRUD endpoint simply because a Prisma model exists.

A model must pass API Exposure Rule first.

Forbidden by default:

```text
Generic CRUD Controller
BaseRepository
Universal Query Builder
Generic Prisma Wrapper
Public writes to internal ledger/log models
Public writes to derived summary models
```

---

## Forbidden During Structure Migration Without Explicit Gate

The following are forbidden during file migration unless explicitly approved:

```text
schema.prisma changes
Prisma migration changes
API contract changes
error response contract changes
business rule changes
permission/workspace policy changes
authentication behavior changes
transaction behavior changes
package / lock file changes
frontend changes
```

---

## Current Laundry Status

Current known backend foundation:

```text
BE-01 Runtime Foundation         Frozen
BE-02 Repository Foundation      Frozen
BE-03 REST API Layer             Frozen
BE-04 Architecture Normalization Frozen
BE-05 Business Layer             Ready For Freeze Review
BE-06 Validation                 Discovery
Backend Structure Migration      Discovery
```

Important notes:

- BE-05 has completed required business coverage according to the latest BE-05 gate update.
- BE-06 must treat request validation separately from business and policy rules.
- Backend Structure Migration must not be used as a shortcut to change behavior.
- The real source snapshot shows a mixed old/new module structure; migration should proceed by inventory and gates, not bulk movement.

---

## Future Project Bootstrap Rule

For future projects, create this file before BE-01 implementation starts:

```text
project-os/backend/BACKEND-STRUCTURE-BLUEPRINT.md
```

Then create:

```text
project-os/backend/BACKEND-MASTER-ROADMAP.md
project-os/backend/PRISMA-GOVERNANCE.md
```

This ensures the backend is designed around the complete Prisma/domain model from the beginning.

---

## Maintenance Rule

Update this document when:

- schema.prisma changes
- source structure changes materially
- a model classification changes
- a module becomes public API
- a domain moves from internal to runtime
- a policy boundary changes
- a transaction boundary changes
- a BE phase is frozen or reopened
- duplicate module ownership is resolved
- legacy compatibility paths are removed
