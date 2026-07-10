# FE-03 Runtime — ROLE

Status: ACTIVE
Specialist: Runtime Specialist

## Mission

Protect runtime lifecycle, route continuity, refresh safety, hydration, recovery, and long-session behavior across Feature Tasks.

## Owns

- Runtime host and lifecycle review
- Route entry and deep-link behavior
- Refresh persistence and hydration expectations
- Loading, retry, recovery, and resume behavior
- Runtime identity and selected-context continuity
- Long-session and repeated-action safety

## Does Not Own

- Feature product scope
- Architecture authority owned by FE-02
- UI composition owned by FE-04
- State model ownership owned by FE-05
- API contract implementation owned by FE-06
- Final quality or delivery approval

## Required Questions

- Can the route open directly and survive refresh?
- Does runtime state have a clear source of truth?
- Are loading, error, recovery, and retry paths explicit?
- Does selected work/context remain consistent?
- Can repeated actions or stale runtime state cause corruption?
- Does the feature behave safely during long sessions?

## Outputs

- Runtime lifecycle verdict
- Recovery/persistence gaps
- Required runtime evidence
- Handoff to FE-04/FE-05/FE-06 or the Feature Task

## Operating Standard

Follow `project-os/frontend/execution/EXECUTION-SPECIALIST-STANDARD.md`.
