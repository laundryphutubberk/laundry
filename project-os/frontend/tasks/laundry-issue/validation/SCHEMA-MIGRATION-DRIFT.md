# Laundry Issue — Schema / Migration Drift

Status: VERIFIED_BLOCKER
Date: 2026-07-10
Task: Laundry Issue

## Summary

Laundry Issue bag/count-line linkage is implemented in runtime code and database migration, but `backend/prisma/schema.prisma` does not declare the corresponding fields or relations.

## Verified Evidence

Migration present:

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

Runtime implementation present:

```text
backend/src/services/laundryIssues.service.js
backend/src/repositories/laundryIssues.repository.js
```

The runtime currently accesses these fields through raw SQL:

```text
SELECT "bagId", "countLineId" FROM "IssueReport"
UPDATE "IssueReport" SET "bagId" = ..., "countLineId" = ...
```

Current Prisma schema does not declare:

```text
IssueReport.bagId
IssueReport.countLineId
IssueReport.bag relation
IssueReport.countLine relation
LaundryBag.issueReports back relation
LaundryCountLine.issueReports back relation
```

## Risk

- Prisma schema and deployed database can diverge.
- `prisma generate` does not expose linkage fields.
- Future ORM queries may silently omit or reject the linkage fields.
- A future migration generated from the current schema may attempt destructive correction.
- Controlled-run evidence would not prove schema consistency.

## Required Recovery

Update `backend/prisma/schema.prisma` to match the applied migration:

```prisma
model LaundryBag {
  // existing fields
  issueReports IssueReport[]
}

model LaundryCountLine {
  // existing fields
  issueReports IssueReport[]
}

model IssueReport {
  // existing fields
  bagId       Int?
  bag         LaundryBag?       @relation(fields: [bagId], references: [id], onDelete: SetNull)
  countLineId Int?
  countLine   LaundryCountLine? @relation(fields: [countLineId], references: [id], onDelete: SetNull)

  @@index([bagId])
  @@index([countLineId])
}
```

Then run:

```bash
cd backend
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate deploy
npm run verify:runtime
```

## Gate Decision

```text
DO_NOT_COMPLETE_LAUNDRY_ISSUE
```

Controlled runtime validation may continue only after schema drift is resolved and the Prisma commands pass with recorded evidence.
