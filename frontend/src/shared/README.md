# shared

Status: FE-01 Skeleton
Owner: Frontend Architecture

## Purpose

Shared contains reusable, business-neutral frontend foundations.

## Folders

- `api` — transport and response helpers
- `auth` — actor and workspace guard primitives
- `ui` — generic UI primitives
- `hooks` — generic hooks
- `utils` — generic utilities
- `constants` — shared constants with no feature ownership ambiguity
- `types` — shared contract types

## Forbidden

Do not place feature-specific business rules in shared.

Examples that must remain inside features:

- Laundry Work status transition logic
- Bag workflow rules
- Issue eligibility rules
- Resort workspace visibility policies
- Inventory movement projections
