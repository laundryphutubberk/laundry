# Laundry Issue — Schema / Migration Drift

Status: REPOSITORY_ALIGNMENT_CONFIRMED_PENDING_RUN_EVIDENCE
Date: 2026-07-10
Task: Laundry Issue

## Summary

The previously recorded Prisma schema drift is no longer present in the current repository state.

`backend/prisma/schema.prisma` now declares the Laundry Issue linkage fields, relations, back-relations, and indexes that correspond to the existing migration.

This document does not claim runtime PASS. Prisma format, validate, generate, migrate deploy, and runtime verification still require controlled-run evidence.

## Repository Evidence

Migration:

```text
backend/prisma/migrations/20260710_add_issue_links/migration.sql
```

The migration adds:

```text
IssueReport.bagId
IssueReport.countLineId
foreign keys to LaundryBag and LaundryCountLine
indexes for bagId and countLineId
```

Current Prisma schema declares:

```prisma
model LaundryBag {
  issues IssueReport[]
}

model LaundryCountLine {
  issues IssueReport[]
}

model IssueReport {
  bagId       Int?
  bag         LaundryBag?       @relation(fields: [bagId], references: [id], onDelete: SetNull)
  countLineId Int?
  countLine   LaundryCountLine? @relation(fields: [countLineId], references: [id], onDelete: SetNull)

  @@index([bagId])
  @@index([countLineId])
}
```

The schema and migration therefore describe the same linkage boundary at repository level.

## Remaining Verification

Run and record:

```bash
cd backend
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate deploy
npm run verify:runtime
```

Required evidence:

- command output
- environment and database target
- commit SHA
- PASS / FAIL result
- recovery notes if any command fails

## Gate Decision

```text
SCHEMA_DRIFT_BLOCKER_RESOLVED_IN_REPOSITORY
RUNTIME_VERIFICATION_PENDING
DO_NOT_COMPLETE_LAUNDRY_ISSUE_YET
```

Controlled runtime validation may proceed after the Prisma command set passes with recorded evidence.
