# BE-03 Track B — Member API Boundary

Status: Ready
Scope: Member REST API Layer
Owner: Parallel Task
Reviewer: Backend Architecture

## Purpose

Normalize member routes and controllers to the BE-OS REST API boundary.

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

## Prerequisite

Member BE-02 repository boundary should return PASS, PASS_WITH_NOTES, or APPROVED_EXCEPTION.

## Required Work

```text
1. Inspect member routes/controllers.
2. Ensure routes only compose middleware and controller.
3. Ensure controller delegates business workflow to service.
4. Use shared response helper.
5. Add response mapper if API shape differs from domain output.
6. Ensure errors flow to global error handler.
```

## Atomic Commit Guidance

```text
BE-03B.01 Normalize member route boundary
BE-03B.02 Normalize member controller response boundary
BE-03B.03 Add member API review notes
```

## Verification Checklist

```text
□ routes are composition only
□ controller delegates to service
□ shared response helper is used
□ response mapper is considered
□ errors flow to global error handler
□ known exceptions are recorded
```

## Return Contract

```text
Task Track: BE-03 Track B
Module: Member
Commit List:
Files Changed:
API Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-04:
```
