# BE-02 Track A — Invite Repository Boundary

Status: Ready
Scope: Invite Repository Foundation
Owner: Parallel Task
Reviewer: Backend Architecture

## Purpose

Move invite data access behind a repository boundary without changing invite business behavior.

## Allowed Files

```text
fieldops-be/src/modules/invites/**
```

## Forbidden Files

```text
fieldops-be/src/app.js
fieldops-be/src/routes/index.js
fieldops-be/src/core/**
fieldops-be/prisma/**
fieldops-fe/**
```

## Required Work

```text
1. Inspect invite controller/service files.
2. Identify direct data-client access.
3. Create invite repository boundary when missing.
4. Move query shape into repository.
5. Keep service as orchestration owner.
6. Preserve current API behavior.
```

## Atomic Commit Guidance

```text
BE-02A.01 Add invite repository boundary
BE-02A.02 Route invite service/controller through repository
BE-02A.03 Add invite repository review notes
```

## Verification Checklist

```text
□ invite controller does not import data client directly
□ invite service does not own query shape
□ invite repository owns data access
□ behavior is preserved
□ known exceptions are recorded
```

## Return Contract

```text
Task Track: BE-02 Track A
Module: Invite
Commit List:
Files Changed:
Repository Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-03:
```
