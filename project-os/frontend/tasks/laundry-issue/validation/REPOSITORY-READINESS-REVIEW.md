# Laundry Issue — Repository Readiness Review

Status: IMPLEMENTED_PENDING_RUN_EVIDENCE
Date: 2026-07-10

## Scope

Repository inspection for the remaining Laundry Issue completion gates before controlled runtime validation.

## Finding

The runtime API and controller already supported:

- `bagId` and `countLineId` linkage
- clearing linkage with `null`
- Issue status update to `CANCELLED`
- duplicate-submit protection through controller `busy`
- terminal-work and workspace policy checks
- Work Detail refresh notification after successful Issue mutations

The active UI runtime panel did not expose the full contract. Its edit action changed only the description through `window.prompt`, so the following validation flows were not executable from the normal UI:

- Unlink Issue from Bag / Count Line
- Relink Issue to another Bag / Count Line
- Cancel Issue

## Minimal Patch Applied

File:

- `frontend/src/features/laundry-works/runtime/LaundryIssueRuntimePanel.tsx`

Commit:

- `5061252c4721993fb3cf3bf9ff70281d3b99963d`

Changes:

- Shared Create/Edit form
- Populate existing Issue linkage during edit
- Link to Work / Bag / Count Line
- Clear Bag and Count Line linkage back to Work level
- Filter Count Lines by selected Bag
- Selecting a Count Line synchronizes its Bag
- Add Cancel Issue action using `status: CANCELLED`
- Hide mutation actions for `RESOLVED` and `CANCELLED`
- Keep controller, API, policy, store, and backend contracts unchanged

## Repository Readiness Decision

| Gate | Repository readiness | Run evidence |
|---|---|---|
| Count Line linkage | READY | REQUIRED |
| Invalid Bag / Count Line protection | READY | REQUIRED |
| Unlink / Relink | READY AFTER PATCH | REQUIRED |
| Cancel Issue | READY AFTER PATCH | REQUIRED |
| Summary synchronization | READY | REQUIRED |
| Terminal Work protection | READY | REQUIRED |
| Workspace isolation | READY | REQUIRED |
| Permission validation | READY | REQUIRED |
| Duplicate-submit protection | READY | REQUIRED |
| Frontend lint/build | COMMANDS AVAILABLE | REQUIRED |

## Required Controlled Run

The Task must remain `IMPLEMENTED_PENDING_RUN_EVIDENCE` until real environment evidence is recorded for V1–V10 in `FE-08-ISSUE-EXTENDED-VALIDATION.md`.

Minimum local command evidence:

```bash
cd frontend
npm run lint
npm run build
```

Backend scripts available in the repository:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
npm run verify:runtime
npm run verify:policy
npm run verify:service-policy
npm run verify:http-policy
npm run verify:be07
```

Backend `lint` and `test` scripts are not available and must be recorded as `NOT_AVAILABLE`, not `PASS`.

## Completion Rule

Do not change Laundry Issue to `COMPLETED` until:

- Controlled runtime evidence exists
- Validation results are recorded under this folder
- Handoff is written
- `STATUS.md` and `TASK-INDEX.md` are updated in the same completion patch
