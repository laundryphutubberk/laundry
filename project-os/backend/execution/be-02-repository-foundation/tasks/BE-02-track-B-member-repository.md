# BE-02 Track B — Member Repository Boundary

Status: Ready
Scope: Member Repository Foundation
Owner: Parallel Task
Reviewer: Backend Architecture

## Purpose

Move member data access behind a repository boundary without changing member behavior.

## Allowed Files

```text
fieldops-be/src/modules/member/**
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
1. Inspect member service and controller boundaries.
2. Identify direct data-client access.
3. Create member repository boundary when missing.
4. Move query shape into repository.
5. Keep organization scope requirements explicit.
6. Preserve current API behavior.
```

## Atomic Commit Guidance

```text
BE-02B.01 Add member repository boundary
BE-02B.02 Route member service through repository
BE-02B.03 Add member repository review notes
```

## Verification Checklist

```text
□ member service does not import data client directly
□ member repository owns query shape
□ organization-scoped access remains protected
□ controller does not call repository directly
□ known exceptions are recorded
```

## Return Contract

```text
Task Track: BE-02 Track B
Module: Member
Commit List:
Files Changed:
Repository Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-03:
```
