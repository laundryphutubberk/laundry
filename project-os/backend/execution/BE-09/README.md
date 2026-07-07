# BE-09 Observability

Status: Standard
Scope: Backend Observability
Owner: Backend Architecture
Package: `BE-09-observability.md`

## Purpose

This README is the entry point for the BE-09 Observability execution package.

BE-09 ensures backend behavior can be understood, diagnosed, and monitored through safe logging, metrics, tracing, request id propagation, and audit boundaries.

## Start Here

Read these files in order before executing BE-09 work:

1. `../README.md`
2. `BE-09-observability.md`
3. Any task-specific evidence, milestone, or handoff document created under this package.

## Package Source of Truth

The detailed execution package is:

```text
BE-09-observability.md
```

That file owns the BE-09 purpose, scope, allowed files, forbidden files, milestones, definition of done, merge contract, and freeze criteria.

## Milestones

BE-09 milestones are:

```text
BE-09.01 Logging Alignment
BE-09.02 Metrics Alignment
BE-09.03 Tracing Alignment
BE-09.04 Audit Alignment
BE-09.05 Observability Freeze
```

## Working Rules

BE-09 work must:

- include safe context in logs
- avoid logging sensitive data
- use safe low-cardinality metric labels
- keep trace metadata safe
- separate audit behavior from normal logging
- preserve request id support for investigation

## Development Authority

During the early development phase, the BE-09 owner is authorized to refactor inside the BE-09 responsibility boundary.

The BE-09 owner may:

- modify existing files
- delete obsolete files
- replace legacy implementations
- reorganize folder structures
- remove duplicated code
- redesign internal APIs
- introduce new foundations when required

This authority applies only when the change supports BE-09 responsibilities such as logging, metrics, tracing, audit boundaries, request id propagation, safe metadata, or observability documentation.

## Responsibility Boundary

BE-09 changes must stay inside the BE-09 ownership boundary unless a cross-package contract is explicitly documented.

When a change touches shared runtime or core files, the change must be limited to observability behavior and should preserve public contracts where practical.

The objective during early development is to establish the correct architecture first, then preserve backward compatibility after the foundation becomes stable.

## Boundaries

BE-09 may touch observability helpers, audit integration points, target module service files when audit intent is required, and observability documentation.

BE-09 must not change unrelated feature behavior, frontend files, or use normal logging where audit service behavior is required.

## Task Return Contract

Every BE-09 task response must return the following contract in this exact order:

```text
Task ID
Task Name
Status
Commit List
Files Changed
Observability Checklist
Verification Result
Review Result
Known Exceptions
Ready For Merge
Ready For Handoff
Next Suggested Step
```

### Task ID

Use the BE-09 milestone or task id, for example:

```text
BE-09.01
BE-09.02
BE-09.03
BE-09.04
BE-09.05
```

### Status

Use one of these values:

```text
PASS
PASS_WITH_NOTES
REVIEW
BLOCKED
BLOCKED_BY_GLOBAL_TEST_FAILURES
READY_FOR_HANDOFF
```

### Commit List

List every commit created or used for the task. If no commit was created, state:

```text
No new commit created.
```

### Files Changed

List all files created, updated, deleted, or inspected for the task. Separate changed files from inspected-only files when useful.

### Observability Checklist

The checklist must explicitly cover the BE-09 observability concerns relevant to the task:

```text
[ ] safe logging context
[ ] sensitive data not logged
[ ] low-cardinality metric labels
[ ] bounded trace metadata
[ ] audit separated from normal logging intent
[ ] request id supports investigation
```

Use `N/A` only when a checklist item is outside the task scope.

### Verification Result

State how verification was performed, for example:

```text
GitHub Connector source inspection
Local npm run test:run
CI workflow result
Not executed
```

If tests were not executed, the task must say so explicitly.

### Review Result

Summarize whether the task is acceptable for BE-09 scope and whether any follow-up is required.

### Known Exceptions

List remaining risks, blocked items, warnings, or unresolved issues. If none are known, state:

```text
None.
```

### Ready For Merge

Use `YES`, `NO`, or `PENDING_VERIFICATION`.

### Ready For Handoff

Use `YES`, `NO`, or `PENDING_VERIFICATION`.

### Next Suggested Step

State the next BE-09 task, next package, or blocker resolution step.

## Handoff

Every BE-09 handoff must reference the Task Return Contract above and include final verification evidence.

Final BE-09 handoff requires:

```text
Status: READY_FOR_HANDOFF
Runtime Tests: PASSED
Ready For Merge: YES
Ready For Handoff: YES
Next Suggested Step: BE-10 Production Readiness
```

## Next Phase

After BE-09 freeze, continue to BE-10 Production Readiness.
