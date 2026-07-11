# Flow Execution Standard

Status: DRAFT

## Principle

Architecture is considered across the system; delivery is completed one end-to-end business flow at a time.

## Flow Lifecycle

```text
Discovery
  -> Blueprint Gate
  -> Domain/Data Gate
  -> Architecture/Contract Gate
  -> Implementation
  -> Static Verification
  -> Runtime/Integration Verification
  -> User-flow Verification
  -> Evidence Review
  -> Completed Flow
```

## Flow Package Minimum

Each flow records:

- outcome;
- actors;
- main and exception paths;
- dependencies;
- affected domain concepts;
- backend responsibilities;
- frontend responsibilities;
- contracts preserved or introduced;
- security/isolation rules;
- verification scenarios;
- decisions and blockers;
- current state and evidence.

## Technical Review Within a Flow

Review as applicable:

- validation versus business versus authorization responsibility;
- transaction and rollback behavior;
- concurrency and idempotency;
- API request, response, and failure contracts;
- frontend controller/state/projection/presentation separation;
- accessibility and adaptive behavior;
- observability and sensitive-data handling;
- migration and release safety.

## Completion Rule

Implementation is not completion. A flow becomes `COMPLETED` only after required verification is observed and recorded, or an explicit approved exception exists.
