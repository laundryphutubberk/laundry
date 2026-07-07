# BE-03 Track G — Master Data API Boundary

Status: Ready
Scope: Master Data REST API Layer
Owner: Parallel Task
Reviewer: Backend Architecture

## Purpose

Normalize master data routes and controllers to the BE-OS REST API boundary with minimal behavior change.

## Allowed Files

```text
fieldops-be/src/modules/team/**
fieldops-be/src/modules/location/**
fieldops-be/src/modules/service-item/**
fieldops-be/src/modules/service-item-category/**
fieldops-be/src/modules/consumable/**
fieldops-be/src/modules/vehicle/**
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

Master Data BE-02 repository boundary should return PASS, PASS_WITH_NOTES, or APPROVED_EXCEPTION.

## Required Work

```text
1. Inspect master data routes/controllers.
2. Ensure routes only compose middleware and controller.
3. Ensure controllers delegate business workflow to services.
4. Use shared response helper.
5. Add response mapper if needed.
6. Record module-by-module completion status.
```

## Atomic Commit Guidance

```text
BE-03G.01 Normalize team API boundary
BE-03G.02 Normalize location API boundary
BE-03G.03 Normalize service-item API boundary
BE-03G.04 Normalize service-item-category API boundary
BE-03G.05 Normalize consumable API boundary
BE-03G.06 Normalize vehicle API boundary
BE-03G.07 Add master data API review notes
```

## Verification Checklist

```text
□ routes are composition only
□ controllers delegate to services
□ shared response helper is used where normalized
□ CRUD behavior is preserved
□ module exceptions are recorded
□ no unrelated modules are touched
```

## Return Contract

```text
Task Track: BE-03 Track G
Module: Master Data
Commit List:
Files Changed:
API Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-04:
```
