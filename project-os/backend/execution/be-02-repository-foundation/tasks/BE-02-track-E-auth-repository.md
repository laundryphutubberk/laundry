# BE-02 Track E — Auth Repository Boundary

Status: Ready
Scope: Auth Repository Foundation
Owner: Parallel Task
Reviewer: Backend Architecture

## Purpose

Move auth data access behind a repository boundary without changing authentication behavior.

## Allowed Files

```text
fieldops-be/src/modules/auth/**
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
1. Inspect auth service/controller boundaries.
2. Identify direct data-client access.
3. Create auth repository boundary when missing.
4. Move user, credential, token-related query shape into repository.
5. Preserve authentication, authorization, and token behavior.
6. Preserve current API behavior.
```

## Atomic Commit Guidance

```text
BE-02E.01 Add auth repository boundary
BE-02E.02 Route auth service through repository
BE-02E.03 Add auth repository review notes
```

## Verification Checklist

```text
□ auth service does not import data client directly
□ auth repository owns query shape
□ credential behavior is preserved
□ token behavior is preserved
□ sensitive fields are not exposed
□ known exceptions are recorded
```

## Return Contract

```text
Task Track: BE-02 Track E
Module: Auth
Commit List:
Files Changed:
Repository Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-03:
```
