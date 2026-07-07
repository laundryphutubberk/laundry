# BE-03 Track F — Field Session API Boundary

Status: Ready
Scope: Field Session REST API Layer
Owner: Parallel Task
Reviewer: Backend Architecture
Estimated Complexity: XL

## Purpose

Normalize field session routes and controllers to the BE-OS REST API boundary while preserving field session workflow behavior.

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

## Prerequisite

Field Session BE-02 repository boundary should return PASS, PASS_WITH_NOTES, or APPROVED_EXCEPTION.

## Required Work

```text
1. Inspect field session routes/controllers.
2. Ensure routes only compose middleware and controller.
3. Ensure controllers delegate workflow to services.
4. Use shared response helper where safe.
5. Add response mapper if API shape differs from domain output.
6. Record approved exceptions for high-risk workflows.
```

## Atomic Commit Guidance

```text
BE-03F.01 Inventory field session API boundary
BE-03F.02 Normalize one controller response boundary
BE-03F.03 Add field session API review notes
```

## Verification Checklist

```text
□ route/controller normalization is incremental
□ workflows are preserved
□ shared response helper is used where safe
□ response mapper is considered
□ high-risk exceptions are recorded
□ known exceptions are recorded
```

## Return Contract

```text
Task Track: BE-03 Track F
Module: Field Session
Commit List:
Files Changed:
API Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-04:
```
