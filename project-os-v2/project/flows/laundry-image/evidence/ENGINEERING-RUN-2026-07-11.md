# Laundry Image Engineering Verification

Status: ACTIVE

## Working State

Uncommitted local working tree. Existing unrelated changes were present before this pilot in Prisma, an existing backend policy verification script, and the frontend lockfile. This evidence does not attribute those changes to the pilot.

## Contract Finding and Fix

The approved V1 Laundry Image contract grants image mutation to Laundry staff. Backend runtime allowed staff to register metadata but restricted caption, cover, and delete to management roles. The pilot changed those three service guards to the existing `assertLaundryStaffActor` policy, aligning runtime with the approved contract and the frontend policy without changing schema or REST routes.

## Backend Feature Verification

Command:

```text
npm run verify:laundry-image:all
```

Result: PASS

Observed coverage:

- Resort-scoped list service behavior;
- cross-resort HTTP read rejection;
- Resort mutation rejection;
- terminal Work mutation rejection;
- metadata registration and transaction-client propagation;
- caption/order update;
- cover replacement orchestration;
- soft delete;
- all five HTTP routes;
- invalid URL validation;
- business and request-completion events.

## Backend Regression Verification

Commands and results:

```text
npm run verify:policy          PASS
npm run verify:service-policy  PASS
npm run verify:http-policy     PASS
```

## Domain Static Verification

Command:

```text
npx prisma validate
```

Result: PASS — `prisma/schema.prisma` is valid.

Schema validation alone does not prove that migrations have been applied to a target database; the following migration check supplies that separate evidence.

Migration command:

```text
npx prisma migrate status
```

Result: PASS — three repository migrations were found and the configured PostgreSQL schema reported up to date. This proves migration alignment for the configured environment, but not the metadata mutation scenarios listed below.

Database mutation command:

```text
npm run verify:laundry-image-db
```

Result: PASS — real PostgreSQL create/list/update/cover/soft-delete behavior persisted within one transaction. The script forced rollback and confirmed its test Work did not remain afterward.

## Frontend Engineering Verification

Commands and results:

```text
npm run verify:architecture  PASS
npm run lint                 PASS
npm run build                PASS
```

Production build transformed 73 modules and produced the application bundle successfully.

## Remaining Evidence

- browser list/register/caption/cover/delete refresh persistence;
- browser duplicate-submit and terminal Work behavior;
- final V1 governance reconciliation.

## Evidence Date

2026-07-11 Asia/Bangkok
