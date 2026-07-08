# FE-ARCHITECTURE.md

Status: LOCKED
Owner: Frontend Architecture
Phase: FE-01 Foundation

## Decision

Frontend uses Scanner Architecture as the reference architecture for all feature packages.

The standard is:

- Feature-first
- Runtime-first
- Responsibility-first
- Workspace-aware
- Contract-driven

## Source of Truth Order

1. Business Blueprint
2. Prisma schema / domain model
3. Backend API contracts
4. Frontend Architecture documents
5. Execution packages
6. Implementation

## Core Principles

- Business before technology
- One codebase
- One business logic model
- Adaptive workspace
- Task-oriented UI
- Workspace isolation
- Business logic does not live inside UI components

## Feature Rule

Every feature must follow the Scanner-based feature structure unless a new ADR explicitly approves an exception.

## Runtime Rule

Runtime, workflow, policies, projections, and mappers are first-class frontend architecture layers.

## Shared Rule

Shared folders are for business-neutral utilities only. Domain-specific logic belongs inside the owning feature.
