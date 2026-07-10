# Laundry Issue Automated Verification — 2026-07-10

Status: PASS
Environment: Local Windows checkout (`D:\laundry`)
Command: `npm run verify:laundry-issue:all`

## Service Contract Verification

Result: PASS

Observed completion marker:

```text
Laundry Issue service contract verification passed.
```

Verified behaviors include:

- Laundry Issue creation with Bag and Count Line linkage.
- Item type and color derivation from the linked Count Line.
- Work issue summary synchronization call.
- Relink and unlink service behavior.
- Cancelled Issue edit protection.
- Cancelled Issue resolve protection.
- Business audit events for create and update.

## HTTP Contract Verification

Result: PASS

Observed completion marker:

```text
Laundry Issue HTTP contract verification passed.
```

Verified HTTP outcomes:

- Resort Workspace mutation denied with `403 AUTHORIZATION_POLICY_VIOLATION`.
- Mutation on terminal Laundry Work denied with `409`.
- Invalid Bag / Count Line pair denied with `409`.
- Cancelled Issue update denied with `409`.
- Cancelled Issue resolve denied with `409`.

Representative request IDs from the successful run:

- Permission denial: `20a7a936-73f6-4ec5-935b-0b00ee851d0d`
- Terminal Work protection: `2b8ee1d7-3fde-455a-bdda-2c28db02194b`
- Invalid Bag / Count Line pair: `0047506a-5da5-4cd4-af75-5148edcc9417`
- Cancelled Issue update protection: `83c07d77-0a09-4b3c-b167-b12022482a9f`
- Cancelled Issue resolve protection: `66327c75-3be3-47b6-b293-abc7b395b316`

## Evidence Boundary

This evidence promotes the automated verification gate to PASS.

It does not replace the remaining browser/manual controlled-run evidence for:

- UI Count Line linkage and refresh persistence.
- UI unlink / relink.
- UI cancel behavior and summary refresh.
- Duplicate-submit behavior under an in-flight request.
- End-to-end role and workspace scenarios against real persisted data.
- Frontend lint.
- Prisma format / validate / generate / migrate deploy after schema alignment.
