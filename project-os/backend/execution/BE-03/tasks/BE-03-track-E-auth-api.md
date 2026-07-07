# BE-03 Track E — Auth API Boundary

Status: Ready
Scope: Auth REST API Layer
Owner: Parallel Task
Reviewer: Backend Architecture

## Purpose

Normalize auth routes and controllers to the BE-OS REST API boundary without changing authentication behavior.

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

## Prerequisite

Auth BE-02 repository boundary should return PASS, PASS_WITH_NOTES, or APPROVED_EXCEPTION.

## Required Work

```text
1. Inspect auth routes/controllers.
2. Ensure routes only compose middleware and controller.
3. Ensure controller delegates authentication workflow to service.
4. Use shared response helper.
5. Protect sensitive fields in response output.
6. Ensure errors flow to global error handler.
```

## Atomic Commit Guidance

```text
BE-03E.01 Normalize auth route boundary
BE-03E.02 Normalize auth controller response boundary
BE-03E.03 Add auth API review notes
```

## Verification Checklist

```text
□ routes are composition only
□ controller delegates to service
□ shared response helper is used
□ sensitive fields are not exposed
□ authentication behavior is preserved
□ known exceptions are recorded
```

## Return Contract

```text
Task Track: BE-03 Track E
Module: Auth
Commit List:
Files Changed:
API Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-04:
```
