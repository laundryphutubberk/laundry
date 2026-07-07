# BE-02 Repository Foundation Parallel Work Split

Status: Standard
Scope: Backend Repository Foundation
Owner: Backend Architecture

## Purpose

This document defines how BE-02 repository foundation work should be split across parallel tasks.

The goal is to remove direct data-client access from service/controller boundaries without creating file conflicts between tasks.

---

## Ownership Principle

One task should own one module repository boundary at a time.

Do not let two tasks modify the same module folder unless one task is explicitly assigned as owner and the other is review-only.

---

## Track A — Invite Repository Boundary

Allowed files:

```text
fieldops-be/src/modules/invites/**
```

Primary goal:

```text
Create invite repository boundary and remove direct data access from invite controller/service files.
```

---

## Track B — Member Repository Boundary

Allowed files:

```text
fieldops-be/src/modules/member/**
```

Primary goal:

```text
Create member repository boundary and move query shape out of service.
```

---

## Track C — Organization Repository Boundary

Allowed files:

```text
fieldops-be/src/modules/organization/**
```

Primary goal:

```text
Create organization repository boundary and preserve organization scope rules.
```

---

## Track D — Equipment Repository Boundary

Allowed files:

```text
fieldops-be/src/modules/equipment/**
fieldops-be/src/modules/equipment-category/**
```

Primary goal:

```text
Create equipment repository boundaries and prepare mapper review where needed.
```

---

## Track E — Auth Repository Boundary

Allowed files:

```text
fieldops-be/src/modules/auth/**
```

Primary goal:

```text
Move auth data access behind repository boundary without changing auth behavior.
```

---

## Track F — Field Session Repository Boundary

Allowed files:

```text
fieldops-be/src/modules/field-session/**
```

Primary goal:

```text
Prepare field session repository extraction carefully because this module is high complexity.
```

---

## Track G — Master Data Repository Boundary

Allowed files:

```text
fieldops-be/src/modules/team/**
fieldops-be/src/modules/location/**
fieldops-be/src/modules/service-item/**
fieldops-be/src/modules/service-item-category/**
fieldops-be/src/modules/consumable/**
fieldops-be/src/modules/vehicle/**
```

Primary goal:

```text
Extract simple CRUD-like repository boundaries with minimal behavior change.
```

---

## Forbidden Shared Files

Unless explicitly approved, BE-02 parallel tasks must not modify:

```text
fieldops-be/src/app.js
fieldops-be/src/routes/index.js
fieldops-be/src/core/**
fieldops-be/prisma/**
fieldops-fe/**
```

---

## Task Return Contract

Each task must return:

```text
Task Track:
Module:
Commit List:
Files Changed:
Repository Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-03:
```

---

## BE-02 Split Result

```text
Status: STANDARD
Result: REPOSITORY_PARALLEL_WORK_SPLIT_DEFINED
```
