# FOLDER-STANDARD.md

Status: LOCKED
Owner: Frontend Architecture
Phase: FE-01 Foundation

## Frontend Root

```text
frontend/src/
  app/
  routes/
  layouts/
  features/
  shared/
```

## Feature Folder

Every feature follows Scanner Architecture:

```text
features/<feature>/
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

## Folder Meanings

- `api/` backend API calls for the owning feature
- `components/` feature UI components
- `config/` feature configuration
- `engines/` deterministic business/runtime engines
- `hooks/` React orchestration hooks
- `mappers/` API/domain/UI mapping
- `models/` feature domain-facing types and models
- `pages/` route-level page components
- `policies/` eligibility, permission, and workflow policies
- `projections/` UI read models derived from domain/API data
- `runtime/` runtime host and runtime composition
- `stores/` feature-local client state

## Placeholder Rule

Every folder should contain a named placeholder file that communicates future ownership. Avoid empty folders and avoid ambiguous file names.
