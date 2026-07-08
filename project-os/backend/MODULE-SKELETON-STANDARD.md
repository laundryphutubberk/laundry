# MODULE-SKELETON-STANDARD.md

Status: Accepted  
Owner: Backend Architect  
Project: `laundryphutubberk/laundry`

---

## Purpose

This document defines the standard backend module file structure for the Laundry project.

It replaces the earlier tendency to create many files in every module by default.

The project will use a minimum required module skeleton first, then add optional files only when the module actually needs them.

---

## Canonical Module Skeleton

Every standard runtime module should start with this structure:

```text
src/modules/<module>/
  index.js
  <module>.routes.js
  <module>.controller.js
  <module>.service.js
  <module>.repository.js
  <module>.validation.js
```

Example:

```text
src/modules/member/
  index.js
  member.routes.js
  member.controller.js
  member.service.js
  member.repository.js
  member.validation.js
```

---

## Layer Responsibility

| File | Responsibility |
|---|---|
| `index.js` | Public module entry/export |
| `<module>.routes.js` | Endpoint declaration and middleware composition |
| `<module>.controller.js` | HTTP request/response boundary |
| `<module>.service.js` | Application workflow orchestration |
| `<module>.repository.js` | Database access and Prisma query shape |
| `<module>.validation.js` | Request validation, params/query/body shape, and DTO construction |

---

## Optional Files

The following files are not created by default.

Create them only when there is a real responsibility that cannot stay cleanly inside the minimum skeleton.

```text
<module>.business.js
<module>.policy.js
<module>.errors.js
<module>.response.mapper.js
<module>.repository.mapper.js
<module>.service.test.js
<module>.repository.spec.js
<module>-api-smoke.test.js
```

---

## When To Add Optional Files

| Optional file | Add when |
|---|---|
| `<module>.business.js` | The module owns domain rules such as lifecycle, status transition, uniqueness beyond DB constraints, planning, or inventory movement decisions |
| `<module>.policy.js` | Behavior depends on authenticated user, role, workspace, resortId isolation, ownership, or permission |
| `<module>.errors.js` | The module has stable domain-specific error codes or reusable module errors |
| `<module>.response.mapper.js` | API response shape is non-trivial or must hide/transform persistence shape |
| `<module>.repository.mapper.js` | Prisma shape must be transformed before persistence or return |
| Tests | Module is exposed as API, critical workflow, or has business/validation/policy risk |

---

## Validation Naming Standard

Use only:

```text
<module>.validation.js
```

Do not create new:

```text
<module>.validator.js
<module>.validators.js
```

Legacy validator files may remain during migration, but the target standard is `.validation.js`.

---

## Migration Rule

When migrating old backend structure into the new module structure:

1. Do not copy old reference code blindly.
2. Use old source only to understand current behavior and ownership.
3. Move or rewrite one module at a time.
4. Preserve behavior unless a separate implementation gate approves behavior change.
5. Do not change schema, API contract, error contract, policy, or business logic during structure migration.
6. Keep imports working after every migration batch.

---

## Principle

Use:

```text
Minimum Required + Expand When Needed
```

Do not create files just because the template allows them.

A smaller module with clear responsibility is preferred over a large skeleton full of empty or premature files.
