# FE-02 Architecture — Handoff

Status: DRAFT
Owner: FE-02 Architecture

## Summary

FE-02 Architecture defines the frontend baseline for workspace separation, route/page/package ownership, feature domain boundaries, and dependency direction.

## Completed Artifacts

- `tracks/01-layer-model.md`
- `tracks/02-domain-boundaries.md`
- `tracks/03-dependency-direction.md`
- `tracks/04-package-structure.md`
- `reviews/DOMAIN-REVIEW.md`

## Key Architecture Decisions

- Frontend uses a layered structure from App Shell to API Contract Boundary.
- Workspace isolation is a first-class architecture boundary.
- Laundry Workspace and Resort Workspace must remain separated.
- Resort Workspace data access must stay scoped by `resortId`.
- Shared UI must not import feature-specific stores or business modules.
- Work Detail remains the primary operational screen for laundry work.
- Inventory summary is treated as derived from movement/work history.

## Downstream Consumers

- FE-03 Runtime
- FE-04 UI Composition
- FE-05 State
- FE-06 Integration
- QA execution domain

## Handoff Notes

Later FE domains should use these artifacts as architecture constraints before implementation.

If implementation requires changing boundaries, ownership, contracts, or output artifacts, update `DECISIONS.md` first.

## Handoff State

Ready for review and downstream planning.
