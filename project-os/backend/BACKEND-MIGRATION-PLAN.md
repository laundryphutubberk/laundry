# BACKEND-MIGRATION-PLAN.md

Status: Active  
Owner: Backend Architect  
Project: `laundryphutubberk/laundry`

---

## Purpose

This document defines the migration plan for moving the current local legacy backend structure into the accepted backend module structure.

This plan must be used together with:

```text
project-os/backend/MODULE-SKELETON-STANDARD.md
project-os/backend/BACKEND-STRUCTURE-BLUEPRINT.md
```

---

## Important Clarification

`src.zip` is only a reference for understanding the previous broad backend architecture.

It must not be copied into the new project.

The real migration source is the current local backend structure shown by the user.

---

## Current Local Legacy Structure

The current backend local structure is approximately:

```text
src/
  app.js
  config/
    env.js
  core/
    databaseHealth.js
    health.js
    httpResponse.js
    prisma.js
    requestContext.js
    runtimeShutdown.js
  middlewares/
    error.middleware.js
    notFound.middleware.js
    requestContext.middleware.js
    requestId.middleware.js
  routes/
    index.js
    laundryBags.routes.js
    laundryWorks.routes.js
  services/
    laundryBags.service.js
    laundryWorks.service.js
  validators/
```

---

## Accepted Target Module Skeleton

Use this for every migrated module:

```text
src/modules/<module>/
  index.js
  <module>.routes.js
  <module>.controller.js
  <module>.service.js
  <module>.repository.js
  <module>.validation.js
```

Optional files are added only when needed.

---

## First Migration Targets

The first real runtime modules are:

```text
src/modules/laundry-work/
src/modules/laundry-bag/
```

### Laundry Work target

```text
src/modules/laundry-work/
  index.js
  laundry-work.routes.js
  laundry-work.controller.js
  laundry-work.service.js
  laundry-work.repository.js
  laundry-work.validation.js
```

Source candidates:

```text
src/routes/laundryWorks.routes.js
src/services/laundryWorks.service.js
src/validators/*work*
src/core/prisma.js
```

### Laundry Bag target

```text
src/modules/laundry-bag/
  index.js
  laundry-bag.routes.js
  laundry-bag.controller.js
  laundry-bag.service.js
  laundry-bag.repository.js
  laundry-bag.validation.js
```

Source candidates:

```text
src/routes/laundryBags.routes.js
src/services/laundryBags.service.js
src/validators/*bag*
src/core/prisma.js
```

---

## Core Area Rule

Existing local core files should remain under `src/core/` unless there is a clear reason to split them further.

Do not over-normalize core during module migration.

Current acceptable core files:

```text
src/core/databaseHealth.js
src/core/health.js
src/core/httpResponse.js
src/core/prisma.js
src/core/requestContext.js
src/core/runtimeShutdown.js
```

Current acceptable middleware files:

```text
src/middlewares/error.middleware.js
src/middlewares/notFound.middleware.js
src/middlewares/requestContext.middleware.js
src/middlewares/requestId.middleware.js
```

These can be moved to `src/core/middleware/` later only if a separate core cleanup gate approves it.

---

## Route Registry Rule

`src/routes/index.js` remains the central route registry during the first migration.

After each module is migrated, `src/routes/index.js` should import from module entrypoints instead of legacy route files.

Example target pattern:

```js
const laundryWorkRoutes = require('../modules/laundry-work');
const laundryBagRoutes = require('../modules/laundry-bag');
```

---

## Migration Gates

### Gate 0 — Inspect

Read the local file content and identify:

```text
current route responsibilities
current service responsibilities
current direct Prisma usage
current validation behavior
current response shape
```

### Gate 1 — Module Skeleton

Create the target module folder and six standard files.

Do not change behavior.

### Gate 2 — Move Responsibilities

Split the legacy logic into:

```text
routes -> endpoint declaration
controller -> HTTP boundary
service -> workflow
repository -> Prisma/data access
validation -> request shape/DTO
```

### Gate 3 — Route Registry Update

Update `src/routes/index.js` to use the module route export.

### Gate 4 — Verify

Run or manually inspect:

```text
npm test
npm run dev
route import check
require path check
basic API smoke request
```

### Gate 5 — Remove Legacy File

Only remove legacy route/service files after migrated module is verified.

---

## Forbidden During Migration

Do not change:

```text
schema.prisma
Prisma migrations
API URLs
response contract
error contract
business behavior
status transition rules
permission/policy behavior
package.json / lock file
frontend files
```

---

## Working Principle

Use:

```text
One module at a time.
Minimum required skeleton.
No blind copy from src.zip.
No behavior change during structure migration.
```
