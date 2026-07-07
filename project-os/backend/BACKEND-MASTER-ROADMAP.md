# BACKEND-MASTER-ROADMAP.md

Status: Active  
Owner: Backend Architect  
Project: `laundryphutubberk/laundry`

## Purpose

This document is the master roadmap for Backend execution. It gives Human and AI tasks one place to see Backend phase status, dependencies, gate criteria, and current focus.

This file is an overview only. Detailed execution packages live under:

```text
project-os/backend/execution/
```

## Source of Truth

Backend work must follow this order:

```text
Business Blueprint
↓
Project Constitution
↓
schema.prisma
↓
Contracts / API Decisions
↓
Engineering Blueprint
↓
Backend Execution OS
↓
Implementation
```

Main references:

| Area | File |
|---|---|
| Fast Boot | `project-os/11-boot/FAST-BOOT-SUMMARY.md` |
| Business | `project-os/02-business/Laundry-Blueprint.md` |
| Domain Model | `project-os/06-domain-model/schema.prisma` |
| Standards | `project-os/08-standards/DEVELOPMENT-STANDARDS.md` |
| Change Policy | `project-os/09-pks/CHANGE-POLICY.md` |
| ADR | `project-os/10-adr/ADR-0001.md` |
| BE Execution Root | `project-os/backend/execution/README.md` |

## Backend Mission

Backend must support the Laundry Operations and Linen Asset Management Platform.

Core responsibilities:

- expose stable REST APIs
- protect workspace boundaries
- persist and query Laundry domain data
- enforce business rules outside UI
- keep `schema.prisma` as data model source of truth
- support lean production flow
- support derived inventory from movement history
- support safe transaction boundaries
- provide observable production-ready runtime behavior

## Domain Principles

```text
LaundryWork = operational center / aggregate root
LaundryBag = intake unit
LaundryCountLine = real count captured at laundry
LinenMovement = source of inventory movement truth
LinenInventorySummary = calculated summary
IssueReport = explicit issue record
resortId = Resort Workspace isolation key
```

Backend implementation must not redefine business flow.

## BE Phase Index

| Phase | Name | Status | Primary Outcome |
|---|---|---|---|
| BE-01 | Runtime Foundation | In Progress | Backend runtime baseline is known, stable, and verifiable |
| BE-02 | Repository Foundation | Pending | Data access patterns are normalized |
| BE-03 | REST API Layer | Pending | API route/controller structure and contracts are stable |
| BE-04 | Architecture Normalization | Pending | Backend layer boundaries are consistent |
| BE-05 | Business Layer | Pending | Business workflows live outside UI and route handlers |
| BE-06 | Validation | Pending | Request/response validation is consistent |
| BE-07 | Policy and Domain Rules | Pending | Workspace, permission, and domain policies are enforced |
| BE-08 | Transaction and Consistency | Pending | Critical flows are transaction-safe and consistency-safe |
| BE-09 | Observability | Pending | Logging, metrics, tracing, and audit visibility are usable |
| BE-10 | Production Readiness | Pending | Backend is ready for release, deployment, and smoke checks |

## Current Focus: BE-01 Runtime Foundation

Goal:

```text
Discover, verify, and normalize the Backend runtime foundation before business API work.
```

Scope:

- backend root discovery
- package scripts
- server entry
- app/bootstrap structure
- env/config loader
- Prisma client bootstrap
- middleware order
- route mount order
- notFound/errorHandler
- health/smoke endpoint
- backend folder structure
- runtime verification

Current status:

```text
APPROVED_FOR_DISCOVERY_ONLY
```

Important correction:

```text
Project is laundry.
Do not use paths from other projects.
Backend root must be discovered from repository state.
```

## BE-01 Milestones

| Milestone | Name | Status | Output |
|---|---|---|---|
| BE-01.01 | Runtime Discovery | Approved | Confirm backend root and runtime files |
| BE-01.02 | Server / Config Baseline | Pending | Confirm or normalize server bootstrap and env config |
| BE-01.03 | Prisma Bootstrap | Pending | Confirm or normalize Prisma singleton/client bootstrap |
| BE-01.04 | Middleware Foundation | Pending | Confirm middleware order and request context behavior |
| BE-01.05 | Route / Error Foundation | Pending | Confirm route mount, notFound, error handler behavior |
| BE-01.06 | Health / Smoke Verification | Pending | Confirm health endpoint and runtime smoke process |
| BE-01.07 | Freeze / Handoff | Pending | Freeze BE-01 and hand off to BE-02 |

## BE-01 Discovery Rules

Allowed actions:

- search repository
- read backend files
- identify backend root
- identify runtime entry points
- produce code-level assessment
- produce gap list
- propose next milestone

Not allowed during discovery:

- edit code
- commit code
- change `schema.prisma`
- change frontend files
- change business logic
- change business documents
- create new API behavior
- rename unrelated files

If source code is unclear, report uncertainty instead of guessing.

## BE-01 Code-Level Assessment Template

Every BE-01.01 report should include:

```text
1. backend root confirmed
2. package.json scripts
3. server entry
4. app/bootstrap structure
5. env/config loader
6. Prisma client bootstrap
7. middleware order
8. route mount order
9. notFound/errorHandler
10. health/smoke endpoint
11. backend folder structure
12. gap list
13. proposal for BE-01.02
14. risks / questions
15. approval status needed before modification
```

## Gate Rules

Before any Backend implementation:

```text
1. Identify BE phase
2. Identify milestone
3. Identify allowed files
4. Identify restricted files
5. Check Business impact
6. Check schema impact
7. Check API contract impact
8. Check Workspace Boundary impact
9. Check ADR requirement
10. Request approval if any protected area is touched
```

## ADR Trigger for Backend

Backend work requires ADR review when it changes:

- schema
- API Contract
- permission model
- workspace boundary
- technology baseline
- transaction model
- major business workflow
- authentication/session strategy
- production deployment architecture

If uncertain, pause and ask Chief Architect.

## Parallel Work Rule

Parallel Backend work is allowed only when packages do not share mutable ownership over the same files or contracts.

If two tasks need the same file, one task becomes owner, the other waits, or scope is split.

## Current Backend Roadmap Snapshot

```text
BE-01 Runtime Foundation              In Progress
  └─ BE-01.01 Runtime Discovery        Approved for discovery only

BE-02 Repository Foundation            Pending
BE-03 REST API Layer                   Pending
BE-04 Architecture Normalization       Pending
BE-05 Business Layer                   Pending
BE-06 Validation                       Pending
BE-07 Policy and Domain Rules          Pending
BE-08 Transaction and Consistency      Pending
BE-09 Observability                    Pending
BE-10 Production Readiness             Pending
```

## Next Recommended Action

```text
BE-01.01 Runtime Discovery for laundry backend
```

Instruction:

```text
Search the repository to confirm the real backend root and runtime files.
Do not edit code.
Report code-level runtime assessment and BE-01.02 proposal.
```

## Maintenance Rule

Update this roadmap when:

- a BE phase changes status
- a milestone is approved, completed, frozen, or blocked
- backend root is confirmed
- execution package names change
- BE phase index changes
- an ADR changes backend architecture
- BE-01 is frozen and BE-02 starts

This file is a roadmap, not a replacement for source-of-truth documents.
