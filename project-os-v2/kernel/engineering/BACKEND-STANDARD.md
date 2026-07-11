# Backend Engineering Standard

Status: DRAFT

## Purpose

Provide a technology-adaptable backend quality baseline. A project profile may select frameworks, but may not remove these responsibility boundaries without an approved architecture decision.

## Design Path

```text
Business flow
  -> domain command/query
  -> contract
  -> transport/controller
  -> application service
  -> business and authorization policy
  -> repository
  -> persistence/external adapter
```

## Responsibility Boundaries

- Transport validates protocol shape, resolves authenticated context, calls one application boundary, and maps the response.
- Application services orchestrate workflows and own transaction boundaries.
- Business policy owns invariants and allowed state transitions.
- Authorization policy owns actor, tenant, workspace, and resource-access decisions.
- Repositories own persistence query shape, not workflow decisions.
- External providers remain behind explicit adapters.

## Required Reviews

- validation versus business versus authorization responsibility;
- trusted identity and tenant scope;
- transaction and rollback behavior for multi-write workflows;
- concurrency conflicts and stale state;
- idempotency for retry-sensitive commands;
- stable success and failure contracts;
- audit events and request correlation;
- sensitive-data exposure;
- migration and backward-compatibility risk.

## Data Access Rules

- Controllers must not access persistence directly.
- Client-supplied tenant or workspace identifiers must not override authenticated scope.
- Derived read models must name their authoritative source.
- Soft deletion, retention, and restoration behavior must be explicit.

## Verification Minimum

Use the checks applicable to the flow:

- static architecture/import check;
- validation and policy tests;
- service/domain tests;
- repository/database integration;
- HTTP/transport verification;
- authorization and isolation regression;
- runtime health and critical-flow smoke test.

Missing test infrastructure is a capability gap, not a PASS.
