# Bag Intake and Counting Traceability

Status: ACTIVE

## Business

- `project-os/02-business/Laundry-Blueprint.md`
- `project-os/frontend/execution/fe-03-runtime-contract/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`
- `project-os/frontend/execution/FE-06-LAUNDRY-WORK-API-MAPPING.md`

## Domain and Data

- `backend/prisma/schema.prisma`: LaundryBag, LaundryCountLine, LaundryItemType, WorkStatusLog
- `backend/src/domain/laundryBags.business.js`
- `backend/src/domain/laundryCountLines.business.js`

## Backend

- `backend/src/services/laundryBags.service.js`
- `backend/src/services/laundryCountLines.service.js`
- `backend/src/repositories/laundryBags.repository.js`
- `backend/src/repositories/laundryCountLines.repository.js`
- `backend/src/routes/index.js`

## Frontend

- `frontend/src/features/laundry-works/components/BagPanel.tsx`
- `frontend/src/features/laundry-works/components/CountEntryPanel.tsx`
- `frontend/src/features/laundry-works/components/CountTable.tsx`
- `frontend/src/features/laundry-works/controllers/useLaundryWorkController.ts`
