# FE-02 Architecture — DECISIONS

## Baseline Decision

This domain uses Execution Standard v2.

## Rule

Any change to ownership, boundary, contract, or output artifact must be recorded here.

---

## Decision 2026-07-08 — Baseline Architecture Documents

Status: Recorded

FE-02 created baseline documents for:

- Layer Model
- Domain Boundaries
- Dependency Direction
- Package Structure
- Domain Review Draft
- Handoff Draft

Architecture baseline:

- App Shell
- Workspace Shell
- Route Layer
- Page Layer
- Feature Module Layer
- Shared UI Layer
- State / Service Layer
- API Contract Boundary

Rules recorded:

- Laundry Workspace and Resort Workspace are separate.
- Resort Workspace keeps `resortId` scoping.
- Shared UI does not depend on feature modules or feature stores.
- Later FE domains use these documents before implementation.

Human review is required before FE-02 freeze.
