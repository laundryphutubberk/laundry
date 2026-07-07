# BE-02 Track F — Field Session Repository Boundary

Status: Ready
Scope: Field Session Repository Foundation
Owner: Parallel Task
Reviewer: Backend Architecture
Estimated Complexity: XL

## Purpose

Prepare field session data access behind repository boundaries without changing field session behavior.

## Allowed Files

```text
fieldops-be/src/modules/field-session/**
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
1. Inspect field session services/controllers.
2. Identify direct data-client access.
3. Create repository boundaries carefully and incrementally.
4. Move query shape into repository files.
5. Preserve workflow, runtime, and lifecycle behavior.
6. Record any approved exceptions instead of forcing risky large refactors.
```

## Atomic Commit Guidance

```text
BE-02F.01 Inventory field session data access
BE-02F.02 Add field session repository boundary
BE-02F.03 Route one service workflow through repository
BE-02F.04 Add field session repository review notes
```

## Verification Checklist

```text
□ repository extraction is incremental
□ service behavior is preserved
□ query shape moves only when safe
□ transaction needs are recorded
□ high-risk workflows are documented
□ known exceptions are recorded
```

## Return Contract

```text
Task Track: BE-02 Track F
Module: Field Session
Commit List:
Files Changed:
Repository Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-03:
```
