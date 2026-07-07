# BE-02 Track G — Master Data Repository Boundary

Status: Ready
Scope: Master Data Repository Foundation
Owner: Parallel Task
Reviewer: Backend Architecture

## Purpose

Move master data module data access behind repository boundaries with minimal behavior change.

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

## Required Work

```text
1. Inspect each master data service/controller boundary.
2. Identify direct data-client access.
3. Create repository boundaries per module.
4. Move query shape into repository files.
5. Preserve existing CRUD behavior.
6. Record module-by-module completion status.
```

## Atomic Commit Guidance

```text
BE-02G.01 Add team repository boundary
BE-02G.02 Add location repository boundary
BE-02G.03 Add service-item repository boundary
BE-02G.04 Add service-item-category repository boundary
BE-02G.05 Add consumable repository boundary
BE-02G.06 Add vehicle repository boundary
BE-02G.07 Add master data repository review notes
```

## Verification Checklist

```text
□ each module repository owns query shape
□ services no longer import data client directly where normalized
□ CRUD behavior is preserved
□ module exceptions are recorded
□ no unrelated modules are touched
```

## Return Contract

```text
Task Track: BE-02 Track G
Module: Master Data
Commit List:
Files Changed:
Repository Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-03:
```
