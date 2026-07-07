# BE-02 Track D — Equipment Repository Boundary

Status: Ready
Scope: Equipment Repository Foundation
Owner: Parallel Task
Reviewer: Backend Architecture

## Purpose

Move equipment and equipment category data access behind repository boundaries without changing equipment behavior.

## Allowed Files

```text
fieldops-be/src/modules/equipment/**
fieldops-be/src/modules/equipment-category/**
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
1. Inspect equipment and equipment-category service/controller boundaries.
2. Identify direct data-client access.
3. Create repository boundaries when missing.
4. Move query shape into repository files.
5. Preserve organization scope and equipment lifecycle behavior.
6. Preserve current API behavior.
```

## Atomic Commit Guidance

```text
BE-02D.01 Add equipment repository boundary
BE-02D.02 Route equipment service through repository
BE-02D.03 Add equipment-category repository boundary
BE-02D.04 Add equipment repository review notes
```

## Verification Checklist

```text
□ equipment service does not import data client directly
□ equipment-category service does not import data client directly
□ repositories own query shape
□ organization-scoped access remains protected
□ behavior is preserved
□ known exceptions are recorded
```

## Return Contract

```text
Task Track: BE-02 Track D
Module: Equipment
Commit List:
Files Changed:
Repository Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-03:
```
