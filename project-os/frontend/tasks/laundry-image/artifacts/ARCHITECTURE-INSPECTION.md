# Laundry Image — Architecture and Contract Inspection

Status: INSPECTION_COMPLETE
Date: 2026-07-10
Task: Laundry Image

## Mission Boundary

Owned flow:

```text
Upload → View → Caption → Cover → Soft Delete → Refresh Persistence
```

This Task owns Laundry Work evidence images only. It must not introduce unrelated gallery, document, or media-library behavior.

## Domain Model State

`LaundryWorkImage` exists in `backend/prisma/schema.prisma` with:

- `workId`
- `resortId`
- `url`
- `publicId`
- `provider`
- `mimeType`
- `originalName`
- `sizeBytes`
- `caption`
- `displayOrder`
- `isCover`
- `uploadedById`
- `uploadedAt`
- `deletedAt`
- timestamps

The model supports the required task flow at schema level.

## Migration State

Migration exists:

```text
backend/prisma/migrations/20260709070000_add_laundry_work_image/migration.sql
```

It creates the table, work/resort foreign keys, and indexes for:

- `workId`
- `resortId`
- `isCover`
- `deletedAt`
- `displayOrder`

Repository-level schema and migration inspection found no immediate model blocker.

## Frontend Current State

### API Capability

`frontend/src/features/laundry-works/api/laundryWorkApi.ts` currently declares:

```text
image.list = false
image.upload = false
```

No caption, cover, or delete capability is represented.

### Detail DTO

`LaundryWorkDetailDTO` currently contains:

- work
- bags
- countLines
- issues
- statusLogs

It does not contain Laundry Work images.

### Normalization and Projection

- `normalizeDetail()` does not normalize images.
- `laundryWorkProjection` currently emits `images: []`.
- Runtime detail cannot display persisted backend image evidence yet.

### UI Composition

`ImagePanel` currently supports:

- image list display
- thumbnail/url
- caption/name display
- upload action
- view-all action
- loading/error/empty states

It does not yet expose contract-safe actions for:

- edit caption
- set cover
- soft delete
- cover marker
- mutation busy/error state per image

## Required Boundaries

Recommended frontend ownership split:

```text
laundryImageApi
  → HTTP and multipart boundary

useLaundryImageController
  → load/upload/update caption/set cover/soft delete orchestration

laundryImage.policy
  → workspace, role, terminal-work, and capability decisions

laundryImage.store
  → server-result cache and mutation state for the active work only

laundryImageProjection
  → display-ready image cards and action models

LaundryImageRuntimePanel / ImagePanel
  → presentation and interaction composition only
```

Do not place backend enum interpretation, permission decisions, or work-status mutation rules inside JSX.

## Implementation Order

1. Inspect and confirm backend routes/controller/service/repository/validation/policy.
2. Define frontend image DTO and capability contract from actual backend response.
3. Implement dedicated API boundary, including multipart upload if backend requires it.
4. Implement policy and active-work state ownership.
5. Implement controller with synchronous duplicate-submit protection.
6. Project images and action models.
7. Extend ImagePanel or add a runtime wrapper without direct API/store access in presentational UI.
8. Wire Laundry Work Detail refresh synchronization.
9. Validate upload, list, caption, cover, soft delete, refresh persistence, isolation, permissions, build, and lint.

## Current Gate

```text
ARCHITECTURE_INSPECTION_COMPLETE
BACKEND_CONTRACT_INSPECTION_REQUIRED
IMPLEMENTATION_NOT_YET_COMPLETE
```

No Task completion may be claimed until real run evidence and final handoff exist.
