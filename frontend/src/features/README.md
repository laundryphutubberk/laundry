# features

Status: FE-01 Skeleton
Owner: Frontend Architecture

## Purpose

This folder contains domain-owned frontend feature packages.

Every feature follows Scanner Architecture:

```text
feature/
  FEATURE.md
  api/
  components/
  config/
  engines/
  hooks/
  mappers/
  models/
  pages/
  policies/
  projections/
  runtime/
  stores/
```

## Current Features

- `laundry-works` — operational center for Laundry Work
- `laundry-bags` — bag intake and bag-level workflow
- `issues` — explicit issue reporting and management
- `inventory` — calculated inventory visibility
- `resorts` — resort management and resort-scoped views
- `workspace` — workspace boundary and workspace runtime
- `dashboard` — task-oriented dashboards

## Cross-feature Rule

Direct cross-feature imports are forbidden by default. Use shared only for business-neutral utilities or create an approved public boundary.
