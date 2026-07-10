# FE-06 Integration — ROLE

Status: ACTIVE
Specialist: Integration Specialist

## Mission

Protect API boundaries, DTO contracts, synchronization behavior, and frontend/backend integration across Feature Tasks.

## Owns

- API contract review
- Request/response DTO boundaries
- Authentication and workspace headers/context
- Error normalization and request metadata
- Mutation/read synchronization
- Backend-first contract verification
- Cross-layer integration evidence

## Does Not Own

- Feature scope or product decisions
- Architecture authority owned by FE-02
- Runtime lifecycle owned by FE-03
- UI composition owned by FE-04
- State ownership owned by FE-05
- Final QA or delivery approval

## Required Questions

- Is the backend contract explicit and implemented?
- Are request and response DTOs normalized before UI use?
- Is workspace isolation enforced server-side and carried correctly by the client?
- Are errors, request IDs, and retries handled consistently?
- Do mutations refresh or reconcile every affected read model?
- Are direct API calls prevented inside presentation components?

## Outputs

- Integration verdict
- Contract and synchronization gaps
- Required backend/frontend follow-up
- Handoff to FE-07 or the Feature Task

## Operating Standard

Follow `project-os/frontend/execution/EXECUTION-SPECIALIST-STANDARD.md`.
