# FE-08 Laundry Issue — Extended Validation

Status: READY_FOR_CONTROLLED_RUN_VALIDATION
Feature Domain: Laundry Workspace
Mission: Laundry Issue Flow Hardening

## Purpose

Validate the Laundry Issue flow beyond the core create/update/resolve path.

This validation confirms summary consistency, Count Line linkage, unlink/relink behavior, cancellation, terminal-work protection, workspace isolation, duplicate-submit protection, build readiness, and refresh persistence.

## Runtime Contract

```text
Issue UI
↓
Issue Controller
↓
Issue Policy
↓
Issue Store
↓
Issue API
↓
Backend Controller / Service / Repository
↓
Database
```

After a successful issue mutation, the runtime must reload:

1. Laundry Issue list
2. Laundry Work detail and summary

## Repository Evidence Gate

Repository-level implementation evidence is present for:

- Issue database linkage through `bagId` and `countLineId` migration.
- Backend validation, repository, service, controller, and route layers.
- Frontend Issue API, Store, Policy, Controller, Runtime Panel, and Work Detail integration.
- Active issue summary counting for `OPEN` and `REVIEWING` only.
- Work-detail refresh after successful Issue mutations.
- Duplicate mutation protection through controller busy state.
- Removal of duplicate experimental Issue runtime paths.

Repository evidence confirms that FE-08 is implemented and ready for controlled runtime validation.

Repository evidence does not replace actual environment evidence.
FE-08 must not be locked as Completed until the Run Evidence Gate passes.

## Issue Count Definition

`LaundryWork.issueCount` means the number of active issues requiring attention.

Included statuses:

- `OPEN`
- `REVIEWING`

Excluded statuses:

- `RESOLVED`
- `CANCELLED`

Expected behavior:

```text
Create OPEN issue       → issueCount +1
Move OPEN to REVIEWING  → issueCount unchanged
Resolve issue           → issueCount -1
Cancel issue            → issueCount -1
```

---

## V1 — Summary Synchronization

### Steps

1. Open Laundry Work Detail.
2. Record current issue summary count.
3. Create an Issue.
4. Observe Issue list and summary card without manually refreshing.
5. Resolve the Issue.
6. Observe Issue list and summary card again.

### Expected

- Create reloads Issue list.
- Create reloads Laundry Work detail.
- Summary count increases for an `OPEN` Issue.
- Resolve reloads both surfaces.
- Summary count decreases after `RESOLVED`.

Repository Evidence: PRESENT
Run Evidence: REQUIRED
Status: PENDING_RUN

---

## V2 — Count Line Linkage

### Preconditions

- Laundry Work has at least one Bag.
- Laundry Work status permits Count Line creation.
- At least one Count Line exists.

### Steps

1. Create a Count Line linked to Bag A.
2. Open Issue form.
3. Select Bag A.
4. Select its Count Line.
5. Create the Issue.
6. Refresh the page.

### Expected

- Issue saves with `bagId` and `countLineId`.
- Backend validates that both belong to the same Work and Resort.
- Item type and color may be derived from the selected Count Line.
- Refresh preserves the linkage.

Repository Evidence: PRESENT
Run Evidence: REQUIRED
Status: PENDING_RUN

---

## V3 — Invalid Count Line / Bag Pair Protection

### Steps

1. Select Bag A.
2. Attempt to link a Count Line belonging to Bag B through an API request or manipulated client state.

### Expected

- Backend rejects the mutation with conflict response.
- No Issue is created or updated with inconsistent links.
- Workspace data remains unchanged.

Repository Evidence: PRESENT
Run Evidence: REQUIRED
Status: PENDING_RUN

---

## V4 — Unlink and Relink

### Steps

1. Create a Work-level Issue without Bag or Count Line.
2. Edit and link it to Bag A.
3. Edit and link it to a Count Line under Bag A.
4. Edit and move it to Bag B with a valid Count Line under Bag B.
5. Edit and clear `bagId` and `countLineId`.
6. Refresh after each meaningful transition.

### Expected

- Valid relinking succeeds.
- Clearing links returns the Issue to Work-level.
- Invalid cross-Bag linkage is blocked.
- Persistence survives refresh.

Repository Evidence: PRESENT
Run Evidence: REQUIRED
Status: PENDING_RUN

---

## V5 — Cancel Issue

### Steps

1. Create an `OPEN` Issue.
2. Edit the Issue.
3. Change status to `CANCELLED`.
4. Save.
5. Refresh.

### Expected

- Update endpoint returns success.
- Issue displays `CANCELLED`.
- Edit and Resolve actions are no longer shown.
- Active issue summary count decreases.
- Refresh preserves `CANCELLED`.

Repository Evidence: PRESENT
Run Evidence: REQUIRED
Status: PENDING_RUN

---

## V6 — Terminal Work Protection

### Work statuses

- `CLOSED`
- `CANCELLED`

### Steps

1. Open a terminal Laundry Work.
2. View existing Issues.
3. Attempt Create from UI.
4. Attempt Update and Resolve from direct API request.

### Expected

- Existing Issues remain readable within workspace scope.
- UI hides or disables mutation actions.
- Backend independently rejects Create, Update, and Resolve.
- No mutation succeeds by bypassing UI policy.

Repository Evidence: PRESENT
Run Evidence: REQUIRED
Status: PENDING_RUN

---

## V7 — Workspace and Permission Isolation

### Actors

- Laundry Owner
- Laundry Manager
- Laundry Staff
- Resort user

### Steps

1. Verify Laundry Owner/Manager/Staff behavior according to policy.
2. Attempt to access a Work outside actor scope.
3. Attempt mutation from Resort Workspace.
4. Attempt to use a Bag or Count Line from another Work or Resort.

### Expected

- Laundry roles operate only within authorized scope.
- Resort Workspace cannot perform Laundry Issue mutations.
- Cross-scope Work/Bag/Count Line access is rejected.
- No foreign data is exposed in response payloads.

Repository Evidence: PRESENT
Run Evidence: REQUIRED
Status: PENDING_RUN

---

## V8 — Duplicate Submit Protection

### Steps

1. Open Issue form.
2. Enter a valid payload.
3. Double-click Save rapidly or simulate a slow network.
4. Repeat for Update and Resolve.

### Expected

- Controller rejects a second mutation while `busy`.
- UI button remains disabled while request is active.
- Only one Issue or one status transition is persisted.

Repository Evidence: PRESENT
Run Evidence: REQUIRED
Status: PENDING_RUN

---

## V9 — Audit Evidence

### Expected Business Logs

- `laundry.issue.created`
- `laundry.issue.updated`
- `laundry.issue.resolved`

Each log should identify, where applicable:

- actor
- actor role
- workspace type
- issue ID
- work ID
- resort ID
- bag ID
- count line ID
- status or issue type

Current resolution detail remains recorded in the Issue description and `resolvedAt`.

A dedicated Issue Status Log / resolution fields may be introduced in a later audit-focused task if stronger immutable history is required.

Repository Evidence: PRESENT
Run Evidence: REQUIRED
Status: PARTIALLY_VERIFIED

---

## V10 — Build and Runtime Readiness

### Required Commands

Backend:

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run verify:runtime
npm run lint
npm run test
```

Use only scripts that exist in the repository. Missing optional scripts must be recorded as `NOT_AVAILABLE`, not treated as passed.

Frontend:

```bash
cd frontend
npm install
npm run build
npm run lint
```

### Expected

- Migration deploy completes successfully.
- Prisma client generation completes successfully.
- Backend runtime verification passes.
- Frontend production build passes.
- Available lint and test gates pass.
- No schema/runtime mismatch remains.

Status: PENDING_RUN

---

## Controlled Run Evidence Format

Each validation item must record:

- Date and environment
- Actor/workspace used
- Work ID and relevant Bag/Count Line IDs
- Action performed
- Expected result
- Actual result
- PASS or FAIL
- Screenshot, request/response, log, or command output reference
- Related commit SHA

Conversation confirmation alone is not completion evidence.

## Completion Contract

Extended validation passes when:

- [ ] Active issue summary synchronizes immediately.
- [ ] Count Line linkage persists.
- [ ] Invalid Bag/Count Line pairing is rejected.
- [ ] Unlink and relink work correctly.
- [ ] Cancel Issue works and updates active count.
- [ ] Terminal Work mutations are blocked in UI and Backend.
- [ ] Workspace and permission isolation are verified.
- [ ] Duplicate submissions do not create duplicate mutations.
- [ ] Business log evidence is captured.
- [ ] Database migration and Prisma generation pass.
- [ ] Backend runtime verification passes.
- [ ] Frontend build passes.
- [ ] Available lint/test gates pass.

## Current Implementation Changes

- Active `issueCount` counts only `OPEN` and `REVIEWING`.
- Successful Issue mutations notify Laundry Work runtime to reload detail and summary.
- Issue controller blocks mutation calls while another Issue mutation is busy.
- Bag and Count Line linkage is represented across database, backend, and frontend layers.
- Workspace and terminal-work protection exist at backend and frontend policy boundaries.

## Gate Decision

Current decision:

```text
FE_08_IMPLEMENTED_PENDING_RUN_EVIDENCE
```

Allowed next action:

```text
EXECUTE_CONTROLLED_RUN_VALIDATION
```

Blocked next action:

```text
OPEN_FE_09_IMPLEMENTATION
```

FE-09 implementation may begin only after FE-08 records all required run evidence and is explicitly locked as Completed.

## Final Status

Core FE-08 flow remains completed at implementation level.

Extended hardening is repository-verified and ready for controlled run validation.
FE-08 is not yet locked as Completed.