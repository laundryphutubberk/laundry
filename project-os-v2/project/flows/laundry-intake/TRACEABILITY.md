# Laundry Intake Traceability

Status: ACTIVE

## Business

- `project-os/02-business/Laundry-Blueprint.md`
- `project-os/frontend/execution/fe-02-operational-workflow/FE-02-LAUNDRY-WORK-OPERATIONAL-WORKFLOW.md`

## Domain and Data

- `backend/prisma/schema.prisma`: Resort, LaundryWork, LaundryBag, WorkStatusLog
- `backend/src/domain/laundryWorks.business.js`

## Backend

- `backend/src/routes/laundryWorks.routes.js`
- `backend/src/controllers/laundryWorks.controller.js`
- `backend/src/services/laundryWorks.service.js`
- `backend/src/repositories/laundryWorks.repository.js`
- `backend/src/repositories/laundryWorksBusiness.repository.js`
- `backend/src/validators/laundryWorks.validator.js`

## Frontend

- `frontend/src/features/laundry-works/pages/LaundryWorkCreatePage.tsx`
- `frontend/src/features/laundry-works/pages/LaundryWorkListPage.tsx`
- `frontend/src/features/laundry-works/pages/LaundryWorkDetailPage.tsx`
- `frontend/src/features/laundry-works/api/laundryWorkApi.ts`
- `frontend/src/features/laundry-works/controllers/useLaundryWorkController.ts`

## V1 Status Claim

`project-os/frontend/tasks/laundry-work/STATUS.md` reports `COMPLETED_BASELINE`. V2 treats this as historical baseline evidence. Runtime normalization regressions found during the Laundry Image browser run prove that current flow readiness must be re-verified rather than inherited from the status claim.
