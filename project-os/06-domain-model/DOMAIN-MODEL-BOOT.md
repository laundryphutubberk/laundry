# DOMAIN-MODEL-BOOT.md

Status: Active  
Owner: Data Architect / Chief Architect  
Project: `laundryphutubberk/laundry`

## Purpose

This document defines the pre-BE domain model workflow.

Backend execution must not start from `schema.prisma` alone. Backend execution should start from a reviewed domain model package.

## Pre-BE Flow

```text
Business Blueprint
↓
Project Glossary
↓
Domain Discovery
↓
Prisma Schema Design
↓
Relation & Constraint Review
↓
Migration Strategy
↓
Domain Classification
↓
Backend Readiness Handoff
↓
BE-01 Runtime Foundation
```

## Domain Model Phases

| Phase | Name | Purpose |
|---|---|---|
| DM-01 | Domain Discovery | Extract business domains and workflows from Business Blueprint |
| DM-02 | Prisma Schema Design | Design models, enums, fields, and relations |
| DM-03 | Relation & Constraint Review | Review cardinality, uniqueness, indexes, cascade rules, and integrity |
| DM-04 | Migration Strategy | Decide migration baseline, seed strategy, and environment handling |
| DM-05 | Domain Classification | Classify every model for runtime ownership |
| DM-06 | Backend Readiness Handoff | Produce handoff package for BE execution |

## Required Outputs

Before BE starts, these files should exist:

```text
project-os/06-domain-model/schema.prisma
project-os/06-domain-model/DOMAIN-MODEL-REVIEW.md
project-os/06-domain-model/PRISMA-DESIGN-DECISIONS.md
project-os/06-domain-model/DOMAIN-CLASSIFICATION.md
project-os/06-domain-model/MIGRATION-STRATEGY.md
project-os/06-domain-model/BACKEND-HANDOFF.md
```

## Gate Rule

BE execution can start only when:

```text
schema.prisma exists
Domain model review is complete
Every model is classified
Migration strategy is documented
Backend handoff is ready
Open questions are documented
```

## Stop Conditions

Pause and ask Chief Architect if domain modeling requires:

```text
Business Flow change
Workspace Boundary change
Ownership change
Inventory truth change
Permission model change
Cross-domain ambiguity
Unreviewed destructive migration
```

## Maintenance Rule

Update this document when the pre-BE domain model process changes.
