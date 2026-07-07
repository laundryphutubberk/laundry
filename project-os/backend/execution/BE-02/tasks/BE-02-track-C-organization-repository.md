# BE-02 Track C — Organization Repository Boundary

Status: Ready
Scope: Organization Repository Foundation
Owner: Parallel Task
Reviewer: Backend Architecture

## Purpose

Move organization data access behind a repository boundary while preserving organization ownership and scope rules.

## Allowed Files

```text
fieldops-be/src/modules/organization/**
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
1. Inspect organization controller/service files.
2. Identify direct data-client access.
3. Create organization repository boundary when missing.
4. Move query shape into repository.
5. Preserve organization scope and ownership behavior.
6. Preserve current API behavior.
```

## Atomic Commit Guidance

```text
BE-02C.01 Add organization repository boundary
BE-02C.02 Route organization service through repository
BE-02C.03 Add organization repository review notes
```

## Verification Checklist

```text
□ organization service does not import data client directly
□ organization repository owns query shape
□ organization scope is preserved
□ behavior is preserved
□ known exceptions are recorded
```

## Return Contract

```text
Task Track: BE-02 Track C
Module: Organization
Commit List:
Files Changed:
Repository Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-03:
```
