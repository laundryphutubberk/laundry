# BE-03 Track A — Invite API Boundary

Status: Ready
Scope: Invite REST API Layer
Owner: Parallel Task
Reviewer: Backend Architecture

## Purpose

Normalize invite routes and controllers to the BE-OS REST API boundary.

## Allowed Files

```text
fieldops-be/src/modules/invites/**
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

Invite BE-02 repository boundary should return PASS, PASS_WITH_NOTES, or APPROVED_EXCEPTION.

## Required Work

```text
1. Inspect invite routes/controllers.
2. Ensure routes only compose middleware and controller.
3. Ensure controller delegates business workflow to service.
4. Use shared response helper.
5. Add response mapper if API shape differs from domain output.
6. Ensure errors flow to global error handler.
```

## Atomic Commit Guidance

```text
BE-03A.01 Normalize invite route boundary
BE-03A.02 Normalize invite controller response boundary
BE-03A.03 Add invite API review notes
```

## Verification Checklist

```text
□ routes are composition only
□ controller does not access data client directly
□ controller delegates to service
□ shared response helper is used
□ errors flow to global error handler
□ known exceptions are recorded
```

## Return Contract

```text
Task Track: BE-03 Track A
Module: Invite
Commit List:
Files Changed:
API Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-04:
```
