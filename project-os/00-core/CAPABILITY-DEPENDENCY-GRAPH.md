# Capability Dependency Graph

Status: Active
Owner: Chief Architect
Project: laundryphutubberk/laundry

## Purpose

Record executable dependencies between domain, backend, frontend, contract, migration, and release capabilities.

A blocked task must identify the smallest upstream capability required to unblock it.

## Dependency Rule

```text
If implementation requires a missing model, contract, policy, API, migration, or runtime capability:

1. Stop the current task
2. Name the missing capability
3. Create or reference the smallest upstream package
4. Mark the current task as BLOCKED_BY
5. Resume only after the dependency is verified
```

## Dependency Types

| Type | Meaning |
|---|---|
| REQUIRES | Must exist before execution starts |
| BLOCKED_BY | Current task cannot continue |
| CONSUMES | Uses a stable contract or capability |
| PRODUCES | Creates a capability for downstream work |
| VERIFIED_BY | Evidence required for completion |
| SUPERSEDES | Replaces an older package or decision |

## Current Graph Examples

```text
BE-LW-002
  BLOCKED_BY -> DM-LW-003

DM-LW-003
  PRODUCES -> LaundryWorkImage domain model and migration readiness

BE-LW-002
  REQUIRES -> LaundryWorkImage migration
  PRODUCES -> Laundry Work issue, image, and history API completion

Frontend Laundry Work screens
  CONSUMES -> BE-LW-002 API contracts

BE-10 Production Readiness
  REQUIRES -> verified active BE capabilities
```

## Task Dependency Record Template

```yaml
task_id: BE-LW-002
status: blocked
requires:
  - DM-LW-003
blocked_by:
  - missing LaundryWorkImage model
produces:
  - laundry work image endpoints
verified_by:
  - schema validation
  - migration verification
  - API smoke verification
```

## Rules

- Do not use a phase number as the only dependency description.
- Name the exact missing capability.
- A planned document is not an implemented capability.
- A dependency is satisfied only by verified evidence.
- Update EXECUTION-STATE-LOCK.json when active blockers change.

## Maintenance Rule

Update this graph when a task is blocked, unblocked, superseded, or becomes a dependency for another responsibility.
