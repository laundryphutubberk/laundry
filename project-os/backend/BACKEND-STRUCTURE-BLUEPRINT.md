# BACKEND-STRUCTURE-BLUEPRINT.md

Status: Active  
Owner: Backend Architect  
Project: `laundryphutubberk/laundry`

## Purpose

This document defines how Backend structure should be designed from the beginning of a project.

It prevents a backend from growing one phase at a time without full awareness of the Prisma domain model.

The goal is not to create CRUD for every Prisma model. The goal is to map every model to its correct runtime role before implementation.

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

---

## Required Design Sequence

Before BE-01 implementation in future projects, complete this sequence:

```text
1. Read Business Blueprint
2. Read schema.prisma
3. Classify every Prisma model
4. Decide runtime module ownership
5. Decide repository ownership
6. Decide service/business ownership
7. Decide API exposure
8. Decide validation and policy responsibility
9. Decide transaction boundary
10. Create Backend Structure Matrix
11. Create module skeleton only where justified
12. Start BE execution phases
```

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

## Canonical Backend Layer

Backend modules should follow this dependency direction:

```text
Route
  -> Controller
  -> Service
  -> Business / Policy
  -> Repository
  -> Prisma
```

Rules:

- Route declares endpoint only.
- Controller owns HTTP request/response boundary.
- Service owns application workflow.
- Business layer owns domain rules.
- Policy layer owns permission and workspace decisions.
- Repository owns data access.
- Only repository should import Prisma for domain data access.

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
```

Not every module needs every file. The matrix below decides what is required.

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

Requires route, controller, service, business, policy, repository, validation, and tests.

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

---

## Repository Rule

Repository is required when a model is queried or mutated by runtime code.

Repository rules:

- Repository owns Prisma query shape.
- Repository supports transaction-compatible client where needed.
- Service must not import Prisma directly.
- Repository must not own business flow.
- Repository must not silently enforce business policy unless explicitly named as query scope.

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

Business layer must not query Prisma directly.

---

## Policy Rule

Policy layer is required when behavior depends on:

- authenticated user
- role
- workspace type
- resortId isolation
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

## Backend Structure Matrix Gate

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

## Current Laundry Status

Current known backend foundation:

```text
BE-01 Runtime Foundation         Frozen
BE-02 Repository Foundation      Frozen
BE-03 REST API Layer             Frozen
BE-04 Architecture Normalization Frozen
BE-05 Business Layer             In Progress / Needs full domain coverage review
BE-06 Validation                 Discovery
```

Important note:

Laundry Bag business rules are implemented, but BE-05 should not be considered fully schema-complete until all domain models are classified and the Business Coverage Matrix is reviewed.

---

## Maintenance Rule

Update this document when:

- schema.prisma changes
- a model classification changes
- a module becomes public API
- a domain moves from internal to runtime
- a policy boundary changes
- a transaction boundary changes
- a BE phase is frozen or reopened
