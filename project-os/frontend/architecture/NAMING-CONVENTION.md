# NAMING-CONVENTION.md

Status: LOCKED
Owner: Frontend Architecture
Phase: FE-01 Foundation

## Principle

Names must reveal domain ownership and responsibility.

Avoid generic names that force readers to open files to understand intent.

## Feature Prefix

Use the feature domain as the file prefix.

Examples:

```text
laundryWorkApi.ts
laundryBagApi.ts
issueApi.ts
inventoryProjection.ts
resort.policy.ts
```

## File Suffixes

Use responsibility suffixes consistently:

```text
*.api.ts
*.config.ts
*.engine.ts
*.mapper.ts
*.model.ts
*.policy.ts
*Projection.ts
*.store.ts
use*.ts
*Page.tsx
*Section.tsx
*Panel.tsx
*Card.tsx
*RuntimeHost.tsx
```

## Forbidden Names

Avoid vague names:

```text
api.ts
service.ts
helper.ts
utils.ts
common.ts
logic.ts
manager.ts
```

These names may only be used in shared generic layers when the responsibility is still clear from the full path.
