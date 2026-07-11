# Sorting and Data Recording Traceability

Status: ACTIVE

## Business

- `project-os/02-business/Laundry-Blueprint.md`
- `project-os/frontend/execution/fe-03-runtime-contract/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## Data and Backend

- `backend/prisma/schema.prisma`: LaundryCountLine, LinenMovement, LinenInventorySummary, LaundryWork
- `backend/src/domain/laundryWorks.business.js`
- `backend/src/domain/linenMovements.business.js`
- `backend/src/services/linenMovements.service.js`
- `backend/src/repositories/linenMovements.repository.js`

## Frontend

- `frontend/src/features/laundry-works/controllers/useLaundryWorkController.ts`
- `frontend/src/features/laundry-works/policies/laundryWork.policy.ts`
- `frontend/src/features/laundry-works/components/CountTable.tsx`
- `frontend/src/features/laundry-works/components/MainTaskPanel.tsx`
