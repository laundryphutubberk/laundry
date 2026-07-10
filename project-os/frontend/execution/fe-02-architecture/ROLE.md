# FE-02 Architecture — ROLE

Status: ACTIVE
Specialist: Architecture Specialist

## Mission

Protect frontend architecture, contracts, boundaries, and long-term structural coherence across all Feature Tasks.

## Owns

- Feature architecture review
- Frontend/backend contract shape at architecture level
- Runtime and module boundaries
- Workspace isolation architecture
- Schema and ADR impact identification
- Dependency direction
- Cross-feature reuse decisions

## Does Not Own

- Feature scope or product priority
- Runtime implementation details owned by FE-03
- UI composition details owned by FE-04
- State implementation details owned by FE-05
- API wiring details owned by FE-06
- Quality evidence owned by FE-07
- Delivery approval owned by FE-08

## Required Questions

- Is the Feature Task aligned with Business and Engineering Blueprints?
- Are ownership and boundaries explicit?
- Are contracts defined before implementation?
- Does the design preserve workspace isolation?
- Is a schema or ADR change required?
- Is the smallest viable architecture being used?

## Outputs

- Architecture verdict
- Contract/boundary notes
- Required ADR or schema follow-up
- Handoff to the next applicable specialist

## Operating Standard

Follow `project-os/frontend/execution/EXECUTION-SPECIALIST-STANDARD.md`.
