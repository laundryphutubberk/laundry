# BE-03 REST API Layer Parallel Work Split

Status: Standard
Scope: Backend REST API Layer
Owner: Backend Architecture

## Purpose

This document defines how BE-03 REST API layer work should be split across parallel tasks.

The goal is to normalize routes, controllers, response helpers, response mappers, and error forwarding without creating file conflicts.

---

## Ownership Principle

One task should own one module API boundary at a time.

A module API boundary includes routes, controller, response mapper, and validator wiring for that module.

---

## Track A — Invite API Boundary

Allowed files:

```text
fieldops-be/src/modules/invites/**
```

Primary goal:

```text
Normalize invite routes/controllers to shared response and global error contract.
```

---

## Track B — Member API Boundary

Allowed files:

```text
fieldops-be/src/modules/member/**
```

Primary goal:

```text
Normalize member controller and response mapping.
```

---

## Track C — Organization API Boundary

Allowed files:

```text
fieldops-be/src/modules/organization/**
```

Primary goal:

```text
Normalize organization controller and route boundary.
```

---

## Track D — Equipment API Boundary

Allowed files:

```text
fieldops-be/src/modules/equipment/**
fieldops-be/src/modules/equipment-category/**
```

Primary goal:

```text
Normalize equipment API response boundary and controller shape.
```

---

## Track E — Auth API Boundary

Allowed files:

```text
fieldops-be/src/modules/auth/**
```

Primary goal:

```text
Normalize auth API boundary without changing authentication behavior.
```

---

## Track F — Field Session API Boundary

Allowed files:

```text
fieldops-be/src/modules/field-session/**
```

Primary goal:

```text
Normalize field session controllers carefully because this module is high complexity.
```

---

## Track G — Master Data API Boundary

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
Normalize simple CRUD-like controllers to shared response helper and global error handling.
```

---

## Forbidden Shared Files

Unless explicitly approved, BE-03 parallel tasks must not modify:

```text
fieldops-be/src/app.js
fieldops-be/src/routes/index.js
fieldops-be/src/core/**
fieldops-be/prisma/**
fieldops-fe/**
```

---

## API Boundary Checklist

```text
□ route only composes middleware and controller
□ controller delegates business workflow to service
□ controller uses shared response helper
□ response mapper exists when needed
□ controller does not build unrelated response envelopes
□ errors flow to global error handler
```

---

## Task Return Contract

Each task must return:

```text
Task Track:
Module:
Commit List:
Files Changed:
API Boundary Result:
Verification Result:
Known Exceptions:
Ready For BE-04:
```

---

## BE-03 Split Result

```text
Status: STANDARD
Result: REST_API_PARALLEL_WORK_SPLIT_DEFINED
```
