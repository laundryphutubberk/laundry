# FE-08 Cross-Layer Execution Decision

Status: ACCEPTED
Date: 2026-07-10
Feature Domain: Laundry Issue Flow

## Decision

FE-08 is authorized to execute the Laundry Issue Flow across frontend and backend layers without stopping for separate FE/BE approval gates.

## Purpose

Keep delivery moving as one coherent feature flow and avoid unnecessary process handoffs that slow implementation.

## Authorized Scope

FE-08 may modify the minimum required files across:

- Domain model / Prisma schema
- Backend repository
- Backend service
- Backend controller
- Backend validation
- Backend routes
- Frontend API boundary
- Frontend controller
- Frontend projection
- Frontend policy
- Frontend store when required
- Frontend presentation components
- Runtime wiring
- Validation and handoff evidence

## Mandatory Boundaries

Cross-layer authority does not remove architecture rules.

The following remain mandatory:

- Business truth remains authoritative.
- Workspace isolation must be preserved.
- Components remain presentation-only.
- Components must not call APIs or stores directly.
- Business actions flow through controllers.
- Backend DTOs must not leak directly into UI.
- Action availability remains policy-driven.
- Mutations must preserve auditability where appropriate.
- Changes must use minimal patches and avoid unrelated refactors.
- Each layer must maintain its established responsibility.

## Execution Rule

When a required backend contract is missing, FE-08 may create or extend that contract and continue through frontend integration in the same mission.

A missing cross-layer dependency is no longer an automatic stop condition unless:

- Business truth is unclear.
- A destructive schema change is required without a safe migration path.
- Workspace isolation cannot be guaranteed.
- Existing contracts conflict materially.
- Build/runtime evidence reveals a blocking regression.

## Current Application

This decision applies immediately to Laundry Issue Flow:

```text
Open Laundry Work
↓
Create Issue
↓
Link Issue to Work / Bag / Count Line
↓
View Issue List
↓
Update Issue
↓
Resolve Issue
↓
Refresh
↓
Data Persists
↓
Runtime / Policy / Projection / Workspace Verified
```

## Outcome

The previous `BLOCKED_BY_BACKEND_CONTRACT` state is released.

Next execution state:

`IN_PROGRESS_CROSS_LAYER`
