# SHARED-LAYER.md

Status: LOCKED
Owner: Frontend Architecture
Phase: FE-01 Foundation

## Purpose

The shared layer contains reusable, business-neutral frontend foundations.

## Shared Folders

```text
shared/
  api/
  auth/
  ui/
  hooks/
  utils/
  constants/
  types/
```

## Allowed Shared Content

- transport client
- response unwrap helpers
- actor/auth context primitives
- generic UI primitives
- generic hooks
- generic utilities
- cross-feature constants with no business ownership ambiguity
- shared contract types

## Forbidden Shared Content

Do not place feature-specific business rules in shared.

Examples that must remain inside features:

- Laundry Work status transition logic
- Bag workflow rules
- Issue eligibility rules
- Resort workspace visibility policies
- Inventory movement projections

## Shared Dependency Rule

Shared must not import from features.
