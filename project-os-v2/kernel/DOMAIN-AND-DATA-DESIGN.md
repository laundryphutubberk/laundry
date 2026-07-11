# Domain and Data Design Standard

Status: DRAFT

## Design Sequence

```text
Approved business flow
  -> domain concepts
  -> ownership and aggregate boundaries
  -> lifecycle and invariants
  -> commands and events
  -> persistence model
  -> constraints and indexes
  -> migration strategy
```

## Domain Design Review

For each concept, identify:

- business meaning;
- owner and aggregate root;
- identity and lifecycle;
- mutable and immutable facts;
- invariants;
- transaction boundary;
- authorization/isolation key;
- history or audit need;
- derived versus authoritative data.

## Data Design Review

Before approving Prisma or another schema, review:

- field meaning and nullability;
- relations and ownership;
- unique constraints;
- indexes supporting real queries;
- referential actions;
- soft-delete and retention policy;
- concurrency and idempotency needs;
- migration/backfill/rollback risk;
- sensitive data classification.

Every material schema element should trace to an approved domain or operational requirement.

## Change Gate

Schema changes require a proposal and impact review before implementation. Destructive or ambiguous migrations require explicit human approval.
