# DOMAIN-FIRST-BOOT.md

Status: Active  
Owner: Chief Architect  
Project: `laundryphutubberk/laundry`

## Purpose

This document defines the preferred boot sequence for future projects and for major architecture redesigns.

The goal is to make backend/frontend execution start from full domain understanding, not from implementation phases alone.

## Core Principle

Implementation must not start before domain coverage is understood.

```text
Business Blueprint
  -> schema.prisma
  -> Domain Classification
  -> Structure Blueprint
  -> Capability Matrix
  -> Execution Packages
  -> Implementation
```

## Required Domain-First Boot Order

Before BE-01 implementation in future projects, read and produce these artifacts:

```text
1. Project Constitution
2. Project Boot
3. Business Blueprint
4. schema.prisma
5. Project Glossary
6. Engineering Blueprint
7. Domain Classification
8. Backend Structure Blueprint
9. Backend Capability Matrix
10. Backend Master Roadmap
11. BE Execution Package
```

## Required Outputs Before Backend Execution

Before starting backend implementation, these files should exist:

```text
project-os/backend/BACKEND-STRUCTURE-BLUEPRINT.md
project-os/backend/BACKEND-CAPABILITY-MATRIX.md
project-os/backend/BACKEND-MASTER-ROADMAP.md
project-os/backend/AI-TASK-CONTRACTS.md
```

Optional but recommended:

```text
project-os/backend/PRISMA-GOVERNANCE.md
project-os/backend/ARCHITECTURE-DECISION-MATRIX.md
project-os/backend/DOMAIN-OWNERSHIP-MAP.md
project-os/backend/RUNTIME-CAPABILITY-MAP.md
```

## Domain Classification Requirement

Every Prisma model must be classified before code generation or implementation.

Allowed classifications:

```text
Aggregate Root
Entity
Internal Log
Derived Summary
Lookup / Master Data
Policy Object
Infrastructure
```

Classification decides whether the model needs:

```text
public API
repository
service
business layer
validation
policy
transaction boundary
observability
```

## Anti-CRUD Rule

Do not create public CRUD simply because a Prisma model exists.

A model may expose API only when:

```text
Business supports the behavior
Workspace boundary is known
Validation is known
Policy is known
Transaction impact is known
API contract is documented
```

## Laundry Learning

In Laundry, BE-01 to BE-05 produced a strong foundation, but full Prisma/domain coverage was clarified later.

Future projects should move that clarification before BE-01.

## Execution Rule

Once Domain-First Boot is complete, BE phases may use Gate-based Execution:

```text
Discovery Gate
Implementation Gate
Verification Gate
Freeze Gate
```

Milestones inside an approved gate do not require repeated approval unless a Stop Condition is triggered.

## Stop Conditions

Pause and ask Chief Architect if implementation requires:

```text
Business Blueprint change
schema.prisma change
API Contract change
Workspace Boundary change
Permission model change
Technology baseline change
ADR trigger
Runtime behavior change outside approved gate
```

## Maintenance Rule

Update this document when the project boot process changes or when a new pre-implementation artifact becomes mandatory.
