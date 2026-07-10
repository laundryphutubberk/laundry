# Laundry Image — STATUS

Status: IN_PROGRESS

## Entry

Laundry Issue dependency gate is complete and final handoff exists.

## Mission

Deliver the Laundry Work image evidence flow end to end:

```text
Upload → View → Caption → Cover → Soft Delete → Refresh Persistence
```

## Current Phase

Frontend mutation integration and validation preparation.

## Completed Inspection

- Confirmed `LaundryWorkImage` domain model supports the required flow.
- Confirmed migration `20260709070000_add_laundry_work_image` exists with work/resort foreign keys and required indexes.
- Confirmed backend has no approved multipart or binary storage provider contract.
- Confirmed `ImagePanel` remains presentation-only and free of API/store access.
- Recorded findings in `artifacts/ARCHITECTURE-INSPECTION.md`.
- Locked the provider-neutral feature contract in `CONTRACT.md`.

## Implemented Backend Boundary

- Active image list by Laundry Work.
- Metadata registration after an upload adapter returns a URL.
- Caption and display-order update.
- Atomic single-cover selection per Work.
- Soft delete through `deletedAt`.
- Resort-scoped read isolation.
- Laundry-staff-only mutation policy.
- Closed/Cancelled Work mutation protection.
- Nested and direct REST routes exposed through the authenticated route graph.

Backend files:

```text
backend/src/repositories/laundryWorkImages.repository.js
backend/src/services/laundryWorkImages.service.js
backend/src/validators/laundryWorkImages.validator.js
backend/src/controllers/laundryWorkImages.controller.js
backend/src/routes/laundryWorkImages.routes.js
backend/src/routes/index.js
```

Repository implementation is not runtime PASS evidence yet.

## Implemented Frontend Boundary

- Dedicated Laundry Image DTO and API boundary.
- Active image list normalization.
- Provider-neutral metadata registration method.
- Caption/display-order update method.
- Cover selection method.
- Soft-delete method.
- Laundry Image Zustand state boundary.
- Laundry Image policy for workspace, role, loading, and terminal Work protection.
- Laundry Image controller with refresh-after-mutation behavior.
- Synchronous duplicate-submit lock at the controller boundary.
- Laundry Image display projection.
- Presentation-only per-image action models for caption, cover, and soft delete.
- Laundry Work Detail runtime integration.
- `workStatus` is passed from Work Detail into Laundry Image policy so `CLOSED` and `CANCELLED` works cannot expose mutation actions.

Frontend files:

```text
frontend/src/features/laundry-works/api/laundryImageApi.ts
frontend/src/features/laundry-works/stores/laundryImage.store.ts
frontend/src/features/laundry-works/policies/laundryImage.policy.ts
frontend/src/features/laundry-works/controllers/useLaundryImageController.ts
frontend/src/features/laundry-works/projections/laundryImageProjection.ts
frontend/src/features/laundry-works/components/ImagePanel.tsx
frontend/src/features/laundry-works/runtime/LaundryImageRuntimePanel.tsx
frontend/src/features/laundry-works/pages/LaundryWorkDetailPage.tsx
```

Repository implementation is not runtime PASS evidence yet.

## API Contract

```text
GET    /api/laundry/works/:workId/images
POST   /api/laundry/works/:workId/images
PATCH  /api/laundry/images/:imageId
PATCH  /api/laundry/images/:imageId/cover
DELETE /api/laundry/images/:imageId
```

`POST` accepts provider-neutral image metadata. It does not upload binary content itself.

## Remaining Contract Gap

A concrete binary upload adapter is not approved yet.

Supported handoff shape:

```text
Upload Adapter → { url, publicId?, provider, mimeType?, originalName?, sizeBytes? }
              → POST image metadata endpoint
```

LOCAL, Cloudinary, S3, or another provider must remain behind this adapter and must not change UI/component boundaries.

Current frontend registration uses a temporary URL-entry interaction to exercise the provider-neutral metadata boundary. It is not the final binary upload UX.

## Next Required Actions

- Approve or implement a concrete binary upload adapter behind the existing provider-neutral contract.
- Replace the temporary URL-entry interaction with the approved upload adapter UI without moving API logic into components.
- Add backend service verification for list/register/update/cover/soft-delete and policy protections.
- Add backend HTTP verification for routes, validation, workspace isolation, permission, and terminal Work protection.
- Run frontend lint and production build.
- Run browser validation for list, caption, cover uniqueness, soft delete, refresh persistence, duplicate-submit, and terminal Work UI protection.
- Record workspace/resort read-isolation evidence.
- Write final handoff and update `TASK-INDEX.md` only after all gates pass.

## Evidence

- `artifacts/ARCHITECTURE-INSPECTION.md`
- `CONTRACT.md`
- Architecture inspection commit: `8cf26243b58ed5faa7e8a8360df1f447567eb9f4`
- Provider-neutral contract commit: `ae9554e562fc9c48d99145b6e24bfa2dd4d7d583`
- Terminal Work status wiring commit: `ed002f749b027b1d244247e03baace23843bb793`

## Completion Gate

Do not mark `COMPLETED` until upload adapter integration, list, caption, cover, soft delete, refresh persistence, workspace isolation, build, lint, backend verification, frontend verification, and final handoff all pass.
