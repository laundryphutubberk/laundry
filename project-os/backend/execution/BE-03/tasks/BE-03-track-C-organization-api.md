# BE-03 Track C — Organization API Boundary

Status: Ready
Scope: Organization REST API Layer
Owner: Parallel Task
Reviewer: Backend Architecture

## Purpose

Normalize organization routes and controllers to the BE-OS REST API boundary.

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

## Prerequisite

Organization BE-02 repository boundary should return PASS, PASS_WITH_NOTES, or APPROVED_EXCEPTION.

## Required Work

```text
1. Inspect organization routes/controllers.
2. Ensure routes only compose middleware and controller.
3. Ensure controller delegates business workflow to service.
4. Use shared response helper.
5. Add response mapper if API shape differs from domain output.
6. Ensure errors flow to global error handler.
```

## Atomic Commit Guidance

```text
BE-03C.01 Normalize organization route boundary
BE-03C.02 Normalize organization controller response boundary
BE-03C.03 Add organization API review notes
```

## Verification Checklist

```text
□ routes are composition only
□ controller delegates to service
□ shared response helper is used
□ response mapper is considered
□ organization API behavior is preserved
□ known exceptions are recorded
```

## Return Contract

```text
Task Track: BE-03 Track C
Module: Organization
Commit List:
Files Changed:
API Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-04:
```
