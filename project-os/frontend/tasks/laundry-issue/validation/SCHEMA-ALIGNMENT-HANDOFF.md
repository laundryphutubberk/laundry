# Laundry Issue — Prisma Schema Alignment Handoff

Status: BLOCKING_BACKEND_ALIGNMENT
Owner Boundary: Backend Prisma / Schema
Frontend Task: `project-os/frontend/tasks/laundry-issue/`

## Problem

The active database migration and Laundry Issue runtime support:

```text
IssueReport.bagId
IssueReport.countLineId
```

But `backend/prisma/schema.prisma` does not declare these fields, relations, or indexes.

This creates schema–migration drift and blocks reliable Prisma validation/generation evidence.

## Required Minimal Schema Patch

### LaundryBag

Add the reverse relation:

```prisma
issueReports IssueReport[]
```

Recommended placement:

```prisma
countLines   LaundryCountLine[]
issueReports IssueReport[]
```

### LaundryCountLine

Add the reverse relation:

```prisma
issueReports IssueReport[]
```

Recommended placement after the item/count fields and before timestamps.

### IssueReport

Add nullable Bag linkage:

```prisma
bagId Int?
bag   LaundryBag? @relation(fields: [bagId], references: [id], onDelete: SetNull)
```

Add nullable Count Line linkage:

```prisma
countLineId Int?
countLine   LaundryCountLine? @relation(fields: [countLineId], references: [id], onDelete: SetNull)
```

Add indexes:

```prisma
@@index([bagId])
@@index([countLineId])
```

## Migration Authority

Existing migration:

```text
backend/prisma/migrations/20260710_add_issue_links/migration.sql
```

The schema patch must align with the existing migration. Do not create a duplicate migration unless Prisma reports an actual database difference after alignment.

## Required Commands

Run from `backend/`:

```bash
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate deploy
npm run verify:runtime
```

## Required Evidence

Record:

- command executed
- exit code
- relevant output
- environment/date
- related commit SHA
- PASS/FAIL

Store evidence under:

```text
project-os/frontend/tasks/laundry-issue/validation/
```

## Acceptance Criteria

- `schema.prisma` declares `bagId` and `countLineId`.
- Reverse relations exist on `LaundryBag` and `LaundryCountLine`.
- Schema indexes match migration indexes.
- Prisma format/validate/generate pass.
- Migrate deploy reports no unresolved drift.
- Laundry Issue runtime verification remains green.

## Frontend Gate

Laundry Issue remains:

```text
IMPLEMENTED_PENDING_RUN_EVIDENCE
```

until schema alignment and controlled runtime validation are both complete.
