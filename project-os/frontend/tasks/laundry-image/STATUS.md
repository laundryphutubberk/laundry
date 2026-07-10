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

Frontend API/runtime integration after backend metadata mutation boundary implementation.

## Completed Inspection

- Confirmed `LaundryWorkImage` domain model supports the required flow.
- Confirmed migration `20260709070000_add_laundry_work_image` exists with work/resort foreign keys and required indexes.
- Confirmed backend has no approved multipart or binary storage provider contract.
- Confirmed `ImagePanel` is presentation-only and must remain free of API/store access.
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

Related commits:

```text
02d988ae4519cb835f7e8b343188746fce126b6e
9e336b0ea1a1e2292b4d148ab7bd552193bd4b19
c847da90370aaba7504adbc7c69c4220e54658a2
1fd5193b9c02267a80618cca377ae91d0ff59dfe
f9495a22e5970e5adb9a4e85ccd524ee188bcbab
e3aa7a25326e7a41d1e8d715267092df1c4618f6
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

## Next Required Actions

- Add Laundry Image DTO and capability contract to frontend API boundary.
- Normalize images from Laundry Work Detail and dedicated list endpoint.
- Implement dedicated image API methods.
- Implement image policy, controller, projection, and duplicate-submit guard.
- Extend ImagePanel action models for caption, cover, and soft delete without direct API/store access.
- Refresh the active image list after every mutation.
- Add backend service/HTTP verification and frontend build/lint evidence.

## Remaining Contract Gap

A concrete binary upload adapter is not approved yet.

Supported handoff shape:

```text
Upload Adapter → { url, publicId?, provider, mimeType?, originalName?, sizeBytes? }
              → POST image metadata endpoint
```

LOCAL, Cloudinary, S3, or another provider must remain behind this adapter and must not change UI/component boundaries.

## Known Frontend Gaps

- Frontend image capabilities are still disabled.
- No dedicated image API methods.
- No image controller/policy/projection implementation.
- ImagePanel has no caption, cover, or soft-delete actions.
- No duplicate-submit orchestration.

## Evidence

- `artifacts/ARCHITECTURE-INSPECTION.md`
- `CONTRACT.md`
- Architecture inspection commit: `8cf26243b58ed5faa7e8a8360df1f447567eb9f4`
- Provider-neutral contract commit: `ae9554e562fc9c48d99145b6e24bfa2dd4d7d583`

## Completion Gate

Do not mark `COMPLETED` until upload adapter integration, list, caption, cover, soft delete, refresh persistence, workspace isolation, build, lint, backend verification, frontend verification, and final handoff all pass.
