# Source of Truth Standard

Status: DRAFT

## Authority Order

When information conflicts, use the narrowest applicable approved source in this order:

1. Approved Business Blueprint
2. Accepted ADR
3. Approved Domain and Data Design
4. Approved Contracts
5. Active Architecture Baseline
6. Active Execution State
7. Source Implementation
8. Verification Evidence
9. Historical notes and archived material

Implementation can reveal drift, but it does not silently redefine approved business truth.

## Document Status

- `DRAFT`: incomplete working material.
- `PROPOSED`: ready for review but not authoritative.
- `APPROVED`: accepted source of truth.
- `ACTIVE`: currently governing execution.
- `SUPERSEDED`: replaced by a named source.
- `ARCHIVED`: retained for history only.

## Work Status

- `NOT_STARTED`
- `DISCOVERY`
- `DESIGNING`
- `READY`
- `IN_PROGRESS`
- `BLOCKED`
- `IMPLEMENTED_PENDING_VERIFICATION`
- `VERIFIED`
- `COMPLETED`

Document status and work status must never be treated as the same state.

## Evidence Rule

Planned, intended, expected, or documented behavior is not verified behavior. A PASS claim must name the command or observed action, result, artifact, and relevant source state.
