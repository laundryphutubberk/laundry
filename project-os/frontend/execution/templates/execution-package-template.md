# FE-XX — <Package Name>

Status: Draft
Scope: <Frontend Execution Package Scope>
Owner: <Frontend Responsibility Owner>

## Purpose

Describe why this execution package exists and what FE-OS responsibility it operationalizes.

## Scope

This package covers:

- <scope item>
- <scope item>
- <scope item>

This package does not cover:

- <out-of-scope item>
- <out-of-scope item>

## Prerequisites

- <required FE-OS standard>
- <required package or milestone>

## Dependencies

- <upstream dependency>
- <contract dependency>
- <review dependency>

## Allowed Files

This package may modify:

```text
<allowed path>
<allowed path>
```

## Forbidden Files

This package must not modify:

```text
<forbidden path>
<forbidden path>
```

## Parallel Tasks

Parallel work is allowed when tasks do not share mutable ownership over the same files, routes, contracts, or standards.

## Milestones

```text
M1 — <Milestone Name>
M2 — <Milestone Name>
MF — Package Freeze
```

## Atomic Commits

Each milestone must be broken into Atomic Commits.

Each Atomic Commit must own one responsibility.

## Definition of Done

- scope completed
- prerequisites respected
- dependencies respected
- allowed files only
- forbidden files untouched
- verification completed
- review completed
- merge contract satisfied
- freeze criteria met

## Review Checklist

- FE-OS alignment checked
- responsibility boundary checked
- ownership checked
- dependency direction checked
- parallel execution safety checked
- implementation leakage checked

## Merge Contract

This package may merge only when:

- all required reviews pass
- no forbidden ownership changes exist
- no unresolved mutable ownership conflict exists
- downstream packages are not broken

## Freeze Criteria

This package may freeze only when:

- milestones are complete
- review result is passed
- merge contract is satisfied
- package status is stable
