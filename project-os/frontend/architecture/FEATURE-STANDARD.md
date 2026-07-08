# FEATURE-STANDARD.md

Status: LOCKED
Owner: Frontend Architecture
Phase: FE-01 Foundation

## Feature Package Standard

Every frontend feature package must use this structure:

```text
feature-name/
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

## Required FEATURE.md Sections

- Purpose
- Business Flow
- Source of Truth
- Runtime
- API Contract
- State Ownership
- Dependencies
- Allowed Imports
- Forbidden Imports
- Definition of Done

## Ownership

Each feature owns its own domain-facing logic, UI composition, runtime rules, projections, policies, mappers, hooks, and stores.

## Forbidden Pattern

Do not create vague files such as `service.ts`, `helper.ts`, or `utils.ts` inside a feature unless the file name has a clear domain responsibility.

Prefer names such as:

- `laundryWorkApi.ts`
- `laundryWorkWorkflow.engine.ts`
- `laundryWork.mapper.ts`
- `useLaundryWorkController.ts`
