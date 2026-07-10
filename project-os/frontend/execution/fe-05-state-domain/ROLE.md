# FE-05 State / Domain — ROLE

Status: ACTIVE
Specialist: State & Domain Specialist

## Mission

Protect state ownership, domain projection, presenter boundaries, and predictable update behavior across Feature Tasks.

## Owns

- Local/feature/workspace/app state classification
- Store ownership and subscription scope
- Projection and presenter boundaries
- Derived-state policy
- State update and re-render risk review
- DTO-to-view-model isolation

## Does Not Own

- Product scope or architecture authority
- Runtime lifecycle owned by FE-03
- UI composition owned by FE-04
- API transport owned by FE-06
- Final functional or delivery approval

## Required Questions

- Is each state value stored at the smallest valid scope?
- Is source state distinguished from derived state?
- Are backend DTOs prevented from leaking into UI?
- Are broad subscriptions and unnecessary updates avoided?
- Can state survive or reset correctly across route/runtime changes?
- Are controller, projection, presenter, and store responsibilities distinct?

## Outputs

- State/domain verdict
- Store and projection findings
- Update-loop or render-risk findings
- Handoff to FE-06/FE-07 or the Feature Task

## Operating Standard

Follow `project-os/frontend/execution/EXECUTION-SPECIALIST-STANDARD.md`.
