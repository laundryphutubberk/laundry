# BE-03 Track D — Equipment API Boundary

Status: Ready
Scope: Equipment REST API Layer
Owner: Parallel Task
Reviewer: Backend Architecture

## Purpose

Normalize equipment and equipment-category routes/controllers to the BE-OS REST API boundary.

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

## Prerequisite

Equipment BE-02 repository boundary should return PASS, PASS_WITH_NOTES, or APPROVED_EXCEPTION.

## Required Work

```text
1. Inspect equipment routes/controllers.
2. Ensure routes only compose middleware and controller.
3. Ensure controller delegates business workflow to service.
4. Use shared response helper.
5. Add response mapper if API shape differs from domain output.
6. Ensure errors flow to global error handler.
```

## Atomic Commit Guidance

```text
BE-03D.01 Normalize equipment route boundary
BE-03D.02 Normalize equipment controller response boundary
BE-03D.03 Normalize equipment-category API boundary
BE-03D.04 Add equipment API review notes
```

## Verification Checklist

```text
□ routes are composition only
□ controllers delegate to service
□ shared response helper is used
□ response mapper is considered
□ equipment behavior is preserved
□ known exceptions are recorded
```

## Return Contract

```text
Task Track: BE-03 Track D
Module: Equipment
Commit List:
Files Changed:
API Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-04:
```
