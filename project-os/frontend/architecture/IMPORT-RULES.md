# IMPORT-RULES.md

Status: LOCKED
Owner: Frontend Architecture
Phase: FE-01 Foundation

## Purpose

Import rules protect feature ownership and prevent architecture drift.

## Allowed Imports

Feature packages may import from:

- their own feature package
- `shared/api`
- `shared/auth`
- `shared/ui`
- `shared/hooks`
- `shared/utils`
- `shared/constants`
- `shared/types`

## Cross-feature Import Rule

Direct cross-feature imports are forbidden by default.

If a feature needs another feature's capability, use one of these options:

1. promote the shared part to `shared/` if it is business-neutral
2. define a public boundary in the owning feature
3. create an ADR if the dependency is intentional and long-lived

## Forbidden Imports

- feature A importing internal files from feature B
- shared importing from any feature
- pages importing backend transport directly
- components importing API clients directly
- UI components importing stores directly unless explicitly designed as container components

## Direction

```text
app/routes/layouts
  -> features
  -> shared
```

Shared must never depend on features.
