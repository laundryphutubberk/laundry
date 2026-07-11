# Laundry Intake Decisions

Status: APPROVED

## Approved Outcome (2026-07-11)

- Resort actors are read-only for internal Laundry operational status. Future Resort acknowledgements require separately designed commands and cannot use the generic transition endpoint.
- The existing `POST /api/laundry/works` command creates the Work, requested initial Bags, summary count, and first status log in one database transaction.
- Authenticated server actor identity is authoritative for audit records. Client-supplied actor fields are compatibility-only input and are ignored.
- Zero Bags produces `DRAFT`; one or more persisted initial Bags produces `BAG_RECEIVED`.

## Decision Required — Resort transition authority

Question: May a Resort actor change any Laundry Work operational status?

### Option A — Resort is read-only for operational status (recommended from current Blueprint)

Laundry Owner/Manager/Staff perform operational transitions. Resort actors may view their own Work and later acknowledge explicitly designed resort-side events through separate commands.

Impact: existing backend policy tests and runtime behavior allowing Resort Staff to mark `FACTORY_RECEIVED` must change.

### Option B — Resort may confirm dispatch/handoff only

Introduce an explicitly named Resort-side command/event rather than granting access to the generic status transition endpoint.

Impact: requires contract and workflow design before implementation.

### Option C — Resort may use selected generic transitions

Define an exact transition/role matrix for Resort actors.

Impact: increases policy complexity and must be reflected in Blueprint, contracts, backend, and frontend.

## Decision Required — Initial Work and Bags atomicity

### Option A — One atomic intake command (recommended)

Create Work and requested initial Bags in one backend transaction. The response returns the completed intake result.

Impact: likely adds or extends an API contract and needs approval.

### Option B — Keep separate requests with recovery protocol

Retain the current API but add idempotency, resumable progress, and deterministic reconciliation.

Impact: avoids a combined contract but is more complex for users and clients.

## Proposed Audit Rule

Authenticated actor identity should be the authoritative source for status logs. Client input may supply a note, not actor identity.

## Proposed Initial-state Rule

- `DRAFT` may exist with zero Bags.
- `BAG_RECEIVED` requires at least one persisted received Bag.
