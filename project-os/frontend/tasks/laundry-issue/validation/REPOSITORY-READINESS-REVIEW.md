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
- synchronous duplicate-submit protection through `mutationInFlightRef`
- UI pending-state protection through controller/store `busy`
- terminal-work and workspace policy checks
- Work Detail refresh notification after successful Issue mutations

The active UI runtime panel originally did not expose the full contract. Its edit action changed only the description through `window.prompt`, so the following validation flows were not executable from the normal UI:

- Unlink Issue from Bag / Count Line
- Relink Issue to another Bag / Count Line
- Cancel Issue

The original form also lacked field-level validation feedback and did not expose backend `fieldErrors` at the related controls.

## Minimal Patches Applied

File:

- `frontend/src/features/laundry-works/runtime/LaundryIssueRuntimePanel.tsx`

Commits:

- `5061252c4721993fb3cf3bf9ff70281d3b99963d`
- `6cb47d004b0c9081dcbaa1be8f3208433da6e17c`

Changes:

- Shared Create/Edit form
- Populate existing Issue linkage during edit
- Link to Work / Bag / Count Line
- Clear Bag and Count Line linkage back to Work level
- Filter Count Lines by selected Bag
- Selecting a Count Line synchronizes its Bag
- Add Cancel Issue action using `status: CANCELLED`
- Hide mutation actions for `RESOLVED` and `CANCELLED`
- Validate quantity as an integer greater than or equal to zero
- Require Issue description before submit
- Validate selected Count Line against the selected Bag before submit
- Map backend `quantity`, `countLineId`, and `description` field errors to form controls
- Add `aria-invalid`, `aria-describedby`, alert semantics, and request reference output
- Disable all form controls and actions while a mutation is active
- Preserve the form when a mutation fails
- Keep controller, API, policy, store, and backend contracts unchanged

## Duplicate-submit Readiness

The controller uses both:

```text
mutationInFlightRef.current
+
store busy state
```

The ref is set synchronously before the first request begins, so a second Create, Update, Cancel, or Resolve call in the same render/event window is rejected before React state propagation completes.

This is repository evidence only. A rapid double-click or slow-network controlled run is still required.

## Architecture Guard Readiness

A dependency-free architecture verifier is available at:

```text
frontend/scripts/verify-architecture.mjs
```

The verifier scans Laundry Work presentation components and fails when a component imports directly from:

- `api/`
- `stores/`
- `repositories/`
- `controllers/`

Command:

```bash
cd frontend
npm run verify:architecture
```

This command is required evidence before completion. Repository availability does not count as a PASS until it is executed successfully.

## Repository Readiness Decision

| Gate | Repository readiness | Run evidence |
|---|---|---|
| Count Line linkage | READY | REQUIRED |
| Invalid Bag / Count Line protection | READY | REQUIRED |
| Unlink / Relink | READY AFTER PATCH | REQUIRED |
| Cancel Issue | READY AFTER PATCH | REQUIRED |
| Field validation / backend error mapping | READY AFTER PATCH | REQUIRED |
| Summary synchronization | READY | REQUIRED |
| Terminal Work protection | READY | REQUIRED |
| Workspace isolation | READY | REQUIRED |
| Permission validation | READY | REQUIRED |
| Duplicate-submit protection | READY WITH SYNCHRONOUS LOCK | REQUIRED |
| Architecture boundary verification | COMMAND AVAILABLE | REQUIRED |
| Frontend lint/build | COMMANDS AVAILABLE | REQUIRED |

## Required Controlled Run

The Task must remain `IMPLEMENTED_PENDING_RUN_EVIDENCE` until real environment evidence is recorded for V1–V10 in `FE-08-ISSUE-EXTENDED-VALIDATION.md`.

Minimum local command evidence:

```bash
cd frontend
npm run verify:architecture
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
