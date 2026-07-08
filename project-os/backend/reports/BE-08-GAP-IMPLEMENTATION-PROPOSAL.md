# BE-08 Gap / Implementation Proposal — Movement and Inventory Projection

Status: Proposed
Mode: Implementation Gate / Stop Condition Evidence
Owner: Backend Architect
Date: 2026-07-08

## Context

BE-08 Transaction and Consistency implementation has hardened the transaction behavior of the runtime workflows that already exist in the backend source.

Completed implementation hardening includes:

- Laundry Work status transition optimistic guard.
- Create Laundry Bag work update optimistic guard.
- Laundry Bag status transition optimistic guard.
- Create Laundry Count Line work status transition optimistic guard.
- Create Issue Report work issue counter optimistic guard.
- Issue Report status transition optimistic guard.

During the next BE-08 gate, Movement and Inventory Summary were reviewed.

## Current Finding

No active runtime module was found for:

- LinenMovement
- LinenInventorySummary

The active route registry currently exposes only the existing Laundry Work and Laundry Bag routes.

Because Movement and Inventory Summary are not yet present as runtime modules, implementing Movement -> Inventory Summary projection now would require one or more of the following:

- adding new repository/service modules;
- adding new runtime workflow behavior;
- potentially adding new API exposure;
- expanding transaction boundaries beyond existing exposed workflows.

This triggers a stop condition for the current gate.

## Stop Condition

Do not implement Movement or Inventory Summary runtime behavior in this gate if it requires:

- API Contract change;
- schema.prisma change;
- Business Blueprint change;
- Aggregate Boundary change;
- Workspace Boundary change;
- Permission model change;
- runtime behavior change outside the current approved implementation scope.

## Gap List

| Gap | Current State | Required Decision |
|---|---|---|
| LinenMovement runtime module | Not found | Decide module owner and workflow entry points |
| LinenInventorySummary runtime module | Not found | Decide projection owner and update rules |
| Movement creation during Count Line | Not implemented | Decide whether Count Line creates Movement in same transaction |
| Movement creation during Issue Report | Not implemented | Decide which Issue types affect inventory |
| Movement creation during Return Workflow | Not implemented | Define Return Workflow boundary |
| Inventory Summary projection | Not implemented | Confirm synchronous projection from ADR-0002 |
| Idempotency for movement-producing commands | Not implemented | Define natural key or idempotency key |
| Verification tests | Not implemented | Add transaction consistency tests |

## Proposed Implementation Roadmap

### Gate A — Internal Repository Layer

Add internal repositories only. Do not expose public CRUD.

Proposed files:

```text
backend/src/repositories/linenMovements.repository.js
backend/src/repositories/linenInventorySummaries.repository.js
```

Rules:

- Must support `client` transaction parameter.
- Must not be mounted as public CRUD.
- Must be called only from approved workflow services.
- Must preserve `LinenMovement` as source of truth.
- Must treat `LinenInventorySummary` as derived read model.

### Gate B — Count Line Projection

Extend existing `createLaundryCountLine` workflow only if approved.

Proposed transaction boundary:

```text
create LaundryCountLine
create LinenMovement
upsert/update LinenInventorySummary
optionally update LaundryWork status
create WorkStatusLog when status changes
```

Rollback rule:

- If any step fails, all steps rollback.

### Gate C — Issue Projection

Extend existing `createIssueReport` workflow only after issue inventory rules are confirmed.

Required decision:

```text
Which IssueType values affect inventory quantity?
```

Potential transaction boundary:

```text
create IssueReport
increment LaundryWork.issueCount
create LinenMovement when inventory-affecting
upsert/update LinenInventorySummary when inventory-affecting
```

### Gate D — Return Workflow

Return Workflow is not currently implemented as a complete runtime transaction boundary.

Required decision:

```text
Define Return Workflow endpoint/service boundary.
```

Potential transaction boundary:

```text
create return LinenMovement
update LinenInventorySummary
update LaundryWork.currentStatus/returnedAt
create WorkStatusLog
```

This may require API contract review before implementation.

### Gate E — Idempotency

For movement-producing workflows, add idempotency protection.

Recommended approach:

- Count Linen: idempotency key or natural command reference.
- Issue Report: idempotency key for retry-sensitive creates.
- Return Workflow: expected status + idempotency key.
- Movement: unique movement reference per source command.

If schema support is required, stop and open schema/ADR review.

## Recommendation

Do not implement Movement or Inventory Summary in the current BE-08 patch stream until a specific implementation gate is approved.

Recommended next gate:

```text
BE-08.02 Movement and Inventory Projection Gate
```

Scope should be explicitly approved before coding:

1. Internal repository files allowed.
2. Workflow services allowed to call movement/projection logic.
3. No public CRUD for Movement or Summary.
4. No schema changes unless separately approved.
5. No API contract change unless separately approved.
6. Synchronous projection follows ADR-0002.

## Status

```text
Movement Runtime Module             GAP
Inventory Summary Runtime Module    GAP
Projection Implementation           BLOCKED_BY_GATE
ADR-0002 Alignment                  CONFIRMED
Recommended Next State              READY_FOR_BE-08.02_GATE_REVIEW
```
