# Laundry Image — Architecture and Contract Inspection

Status: BACKEND_CONTRACT_INSPECTION_COMPLETE
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

## Backend Contract Inspection

### Router

`backend/src/routes/index.js` currently registers routes for:

- Laundry Works
- Laundry Bags
- Laundry Count Lines
- Laundry Issues

No Laundry Image router or image mutation endpoint is registered.

### Controller / Service / Repository

No dedicated Laundry Image controller, service, repository, validation, upload adapter, or authorization policy was found in the active backend route graph.

The active server uses `express.json()` and `backend/package.json` does not currently include a multipart middleware such as `multer`. Therefore a multipart upload contract must not be inferred or implemented only on the frontend.

### Laundry Work Detail Read Path

Before this task, `laundryWorks.repository.findLaundryWorkById()` did not include `images`.

The detail read path has now been extended to include active images only:

```text
deletedAt = null
order by isCover desc, displayOrder asc, uploadedAt asc
```

Related commit:

```text
1f884efe0243414e0a9d993141dc0a155d2bddc6
```

This enables a contract-safe read source for persisted image evidence once frontend normalization is wired.

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

Recommended ownership split:

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

## Confirmed Gap

The schema is ready, but the mutation contract is not.

Missing backend contracts:

- Upload image endpoint and transport format
- Caption update endpoint
- Set-cover endpoint and single-cover transaction rule
- Soft-delete endpoint
- Workspace isolation enforcement
- Role/permission enforcement
- Terminal-work mutation rule
- File storage/provider adapter
- Size/type/count validation
- Response envelope and business audit events

Frontend implementation of these mutations is blocked until these contracts exist or are explicitly assigned for implementation within this Task.

## Implementation Order

1. Complete frontend detail-image read normalization and projection from the confirmed read path.
2. Define and implement backend image mutation contracts within Laundry Image ownership if authorized.
3. Implement dedicated frontend API/state/controller/policy only from actual backend responses.
4. Extend `ImagePanel` or add a runtime wrapper without direct API/store access in the presentational component.
5. Wire refresh synchronization.
6. Validate upload, list, caption, cover, soft delete, refresh persistence, isolation, permissions, build, and lint.

## Current Gate

```text
BACKEND_CONTRACT_INSPECTION_COMPLETE
DETAIL_IMAGE_READ_PATH_IMPLEMENTED_PENDING_VALIDATION
MUTATION_CONTRACT_MISSING
TASK_IN_PROGRESS
```

No Task completion may be claimed until real run evidence and final handoff exist.
