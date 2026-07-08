# MIGRATION-STRATEGY.md

Status: Active  
Owner: Data Architect / Release Architect  
Project: `laundryphutubberk/laundry`

## Purpose

This document defines how Prisma migrations should be planned and reviewed before Backend execution.

## Migration Principles

```text
schema.prisma is source of truth
migration files are execution artifacts
migration must not silently change business meaning
migration must be reviewable
production data safety is mandatory
```

## Required Strategy Areas

| Area | Status | Notes |
|---|---|---|
| Baseline migration | ⏳ | |
| Development database reset strategy | ⏳ | |
| Production migration strategy | ⏳ | |
| Seed strategy | ⏳ | |
| Rollback / recovery note | ⏳ | |
| Destructive change review | ⏳ | |
| Prisma version/runtime standard | ⏳ | |

## Destructive Change Rule

Before any destructive migration, document:

```text
Affected models
Affected fields
Data loss risk
Backup requirement
Rollback option
Chief Architect approval
```

## Migration Handoff to BE

BE can proceed only when:

```text
schema.prisma is committed
migration baseline is committed or explicitly deferred
runtime Prisma version is documented
DATABASE_URL / env strategy is documented
known migration gaps are listed
```

## Maintenance Rule

Update this file whenever migration strategy or Prisma runtime standard changes.
