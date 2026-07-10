# FE-08 Laundry Issue — Contract and Implementation Status

Status: IMPLEMENTED_PENDING_RUN_VALIDATION
Feature Domain: Laundry Workspace
Mission: Laundry Issue Flow

## Objective

Support the complete Laundry Issue flow across database, backend, frontend runtime, and UI while preserving workspace isolation and runtime boundaries.

## Implemented Contract

```text
GET   /api/laundry/works/:workId/issues
POST  /api/laundry/works/:workId/issues
PATCH /api/laundry/issues/:issueId
PATCH /api/laundry/issues/:issueId/resolve
```

## Database

Implemented migration:

- `backend/prisma/migrations/20260710_add_issue_links/migration.sql`

The migration adds optional Issue links:

- `bagId`
- `countLineId`

Both links use `ON DELETE SET NULL` and have dedicated indexes.

## Backend

Implemented layers:

- `backend/src/validators/laundryIssues.validator.js`
- `backend/src/repositories/laundryIssues.repository.js`
- `backend/src/services/laundryIssues.service.js`
- `backend/src/controllers/laundryIssues.controller.js`
- `backend/src/routes/laundryIssues.routes.js`
- `backend/src/routes/index.js`

Backend behavior includes:

- List issues by Laundry Work
- Create issue linked to Work, Bag, or Count Line
- Update issue
- Resolve issue
- Validate Bag and Count Line ownership against the selected Laundry Work and resort
- Prevent mutation on CLOSED or CANCELLED work
- Maintain `LaundryWork.issueCount`
- Emit business logs for create, update, and resolve

## Frontend

Implemented layers:

- `frontend/src/features/laundry-works/api/laundryIssueApi.ts`
- `frontend/src/features/laundry-works/stores/laundryIssue.store.ts`
- `frontend/src/features/laundry-works/policies/laundryIssue.policy.ts`
- `frontend/src/features/laundry-works/controllers/useLaundryIssueController.ts`
- `frontend/src/features/laundry-works/runtime/LaundryIssueRuntimePanel.tsx`
- `frontend/src/features/laundry-works/pages/LaundryWorkDetailPage.tsx`

Frontend flow:

```text
LaundryWorkDetailPage
↓
LaundryIssueRuntimePanel
↓
useLaundryIssueController
↓
Laundry Issue Policy
↓
Laundry Issue Store
↓
laundryIssueApi
↓
Backend Issue Contract
```

## Runtime Capabilities

The user can:

- Open a Laundry Work
- Create an Issue
- Link the Issue to Work / Bag / Count Line
- View the Issue list
- Update an Issue
- Resolve an Issue
- Refresh and reload persisted Issue data

## Architecture Verification

- Presentation surfaces do not call backend APIs directly.
- Business mutations flow through the Issue controller.
- Runtime state is isolated in the Issue store.
- Action permission is derived from Issue policy.
- Backend validates workspace/resort scope.
- Backend validates Bag and Count Line ownership.
- Mutations preserve business logging.
- Duplicate experimental Issue runtime files were removed to keep one authoritative runtime path.

## Remaining Validation

Actual environment validation is still required:

```bash
cd backend
npm install
npx prisma migrate deploy
npm run lint        # if available
npm run test        # if available

cd ../frontend
npm install
npm run build
npm run lint
```

## Known Blocker

The current assistant execution environment cannot resolve `github.com`, so local checkout and build execution cannot be completed here.

Prisma schema synchronization should be verified after migration deployment so future Prisma schema generation does not drift from the applied `bagId` and `countLineId` columns.

## Completion Assessment

Cross-layer implementation is complete at repository level.

Final FE-08 completion remains pending:

- Migration deployment evidence
- Frontend build/lint evidence
- Backend runtime/API verification
- Refresh persistence and workspace isolation regression evidence
