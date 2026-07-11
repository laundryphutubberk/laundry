# Laundry Intake Discovery

Status: ACTIVE

## Structure Trace

```text
Create/List/Detail screen
  -> Laundry Work controller or page orchestration
  -> Laundry Work API
  -> authenticated REST route
  -> controller
  -> service/business/policy
  -> repositories
  -> Prisma
```

## Observed Implementation

### Backend

- Create Work runs in a transaction and verifies active Resort and Work-number uniqueness.
- Generated Work number uses Bangkok date plus latest sequence.
- Status update uses optimistic expected-status update and writes a status log in the same transaction.
- Delete Draft or cancel active Work requires Laundry management.
- List/detail are actor-scoped.

### Frontend

- Create screen can select or create a Resort.
- Work is created as `DRAFT` with `bagCount: 0`.
- Requested initial bags are then created one-by-one through separate HTTP calls.
- Navigation occurs after the sequential bag loop completes.
- List and detail normalization were repaired during the Laundry Image pilot.

## Findings

### LIW-DISC-001 — Partial intake risk

If bag 3 of 5 fails, the Work and bags 1–2 remain persisted while the UI reports failure. Retrying can encounter duplicates or create ambiguous intake. This conflicts with the desired trustworthy initial intake outcome.

### LIW-DISC-002 — Permission conflict

The Blueprint assigns factory operations to Laundry actors and describes Resort users as viewing their own status/history. Current backend status service has no role assertion, and policy regression tests explicitly allow a Resort Staff actor to transition `BAG_RECEIVED -> FACTORY_RECEIVED`.

This is a permission-model decision and must not be silently changed.

### LIW-DISC-003 — Audit identity trust

Status request accepts `changedById` and `changedByName` from the client. The service writes these into WorkStatusLog rather than deriving identity from the authenticated actor. This permits inaccurate audit attribution.

### LIW-DISC-004 — State invariant gap

Backend permits initial status `BAG_RECEIVED` without showing a guard that at least one Laundry Bag exists. The operational meaning of `BAG_RECEIVED` implies persisted intake evidence.

### LIW-DISC-005 — Work-number concurrency

The service reads the latest daily sequence and then creates a unique Work number. Concurrent requests may select the same next sequence; the database unique constraint protects duplication, but retry/conflict behavior is not yet verified.

### LIW-DISC-006 — Inline Resort creation

The Work creation screen can create a new Resort as a side operation. Ownership, permissions, duplicate detection, and whether this belongs inside intake require review.

## No-change Boundary

No schema, API, permission, or workflow change is approved by this discovery record.
