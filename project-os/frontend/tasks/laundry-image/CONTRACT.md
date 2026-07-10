# Laundry Image — Contract

Status: READY_FOR_IMPLEMENTATION
Owner: Laundry Image Feature Task
Flow: Upload → View → Caption → Cover → Soft Delete → Refresh Persistence

## 1. Scope

This contract defines the Laundry Work image evidence flow without binding the feature to a specific storage provider.

The feature owns:

- Listing active Laundry Work images
- Registering uploaded image metadata
- Editing caption
- Selecting one cover image per Laundry Work
- Soft deleting an image
- Refresh-safe persistence
- Workspace and permission enforcement

The feature does not own:

- Binary storage implementation
- Image transformation pipeline
- CDN vendor selection
- Laundry Work workflow transitions

## 2. Source Model

`LaundryWorkImage` is the source model.

Required persisted fields:

- `id`
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
- `createdAt`
- `updatedAt`

Active list rule:

```text
deletedAt = null
```

## 3. Workspace and Permission Policy

Read:

- Laundry Workspace may read images for accessible Laundry Works.
- Resort Workspace may read only images belonging to its authenticated `resortId`.
- Route/query `resortId` must never override authenticated Resort scope.

Mutation:

- Upload/register, caption update, cover selection, and soft delete require Laundry staff permission.
- Resort users are read-only for this flow unless a later approved contract explicitly changes this rule.
- Mutation is blocked when Laundry Work status is `CLOSED` or `CANCELLED`.

## 4. API Boundary

### List images

```text
GET /api/laundry/works/:workId/images
```

Returns active images ordered by:

```text
isCover DESC, displayOrder ASC, uploadedAt ASC, id ASC
```

### Register image metadata

```text
POST /api/laundry/works/:workId/images
```

Request body:

```ts
type CreateLaundryWorkImageInput = {
  url: string
  publicId?: string
  provider?: string
  mimeType?: string
  originalName?: string
  sizeBytes?: number
  caption?: string
  displayOrder?: number
  isCover?: boolean
}
```

The endpoint records metadata after an external or local upload boundary returns a usable URL. It does not prescribe the binary upload provider.

### Update image

```text
PATCH /api/laundry/images/:imageId
```

Allowed fields:

```ts
type UpdateLaundryWorkImageInput = {
  caption?: string | null
  displayOrder?: number
}
```

### Set cover

```text
PATCH /api/laundry/images/:imageId/cover
```

Rules:

- Selected image must be active and belong to the accessible Work/Resort.
- Setting a cover clears `isCover` on every other active image in the same Work in one transaction.
- At most one active cover exists per Work.

### Soft delete

```text
DELETE /api/laundry/images/:imageId
```

Rules:

- Set `deletedAt` instead of deleting the row.
- A deleted image must not appear in active list/detail projections.
- If the deleted image was cover, the Work may temporarily have no cover. Automatic replacement is not implied.

## 5. Runtime Commands

```ts
type LaundryImageCommand =
  | 'LOAD_IMAGES'
  | 'REGISTER_IMAGE'
  | 'UPDATE_IMAGE_CAPTION'
  | 'UPDATE_IMAGE_ORDER'
  | 'SET_IMAGE_COVER'
  | 'SOFT_DELETE_IMAGE'
  | 'REFRESH_IMAGES'
```

All mutation commands flow:

```text
UI → Controller → Policy → API Boundary → Refresh → Projection
```

## 6. Runtime Events

```ts
type LaundryImageRuntimeEvent =
  | 'IMAGES_LOAD_REQUESTED'
  | 'IMAGES_LOADED'
  | 'IMAGES_LOAD_FAILED'
  | 'IMAGE_REGISTER_REQUESTED'
  | 'IMAGE_REGISTERED'
  | 'IMAGE_UPDATE_REQUESTED'
  | 'IMAGE_UPDATED'
  | 'IMAGE_COVER_CHANGED'
  | 'IMAGE_DELETE_REQUESTED'
  | 'IMAGE_SOFT_DELETED'
  | 'IMAGE_COMMAND_FAILED'
```

Events describe runtime activity; UI consumes projection rather than raw events.

## 7. Controller Responsibilities

The Laundry Image controller must:

- Resolve `workId` and authenticated workspace context.
- Load images through the image API boundary.
- Expose loading, empty, error, and requestId state.
- Run policy before mutation.
- Register metadata only after upload boundary returns a URL.
- Refresh list after register, caption update, cover update, and soft delete.
- Guard duplicate in-flight mutation commands.
- Keep UI presentation-only.

The controller must not:

- Store binary files itself.
- Call database/storage providers directly.
- Let components call API/store directly.
- Redefine permission or terminal Work rules.

## 8. Projection Contract

```ts
type LaundryImageProjection = {
  loading: boolean
  empty: boolean
  error?: string | null
  requestId?: string
  images: LaundryImageItemProjection[]
  coverImage?: LaundryImageItemProjection
  actions: LaundryImageActionProjection
}

type LaundryImageItemProjection = {
  id: string | number
  url: string
  thumbnailUrl?: string
  alt: string
  caption?: string
  originalName?: string
  uploadedAtLabel?: string
  uploadedByLabel?: string
  isCover: boolean
  canEdit: boolean
  canSetCover: boolean
  canDelete: boolean
}

type LaundryImageActionProjection = {
  canUpload: boolean
  uploadDisabledReason?: string
  busy: boolean
}
```

UI must not derive workspace access, terminal Work protection, or cover uniqueness itself.

## 9. Validation Gates

Required evidence:

- Register metadata and list refresh
- Caption persistence after reload
- Cover uniqueness after reload
- Soft-delete persistence after reload
- Deleted image excluded from active list
- Resort read isolation
- Resort mutation rejection
- Closed/Cancelled Work mutation rejection
- Duplicate-submit protection
- Frontend build/lint
- Backend service and HTTP verification

## 10. Storage Provider Gap

The current source model supports provider-neutral metadata, but no approved binary storage provider contract is present in this Task.

Implementation may proceed with a provider adapter interface:

```ts
type LaundryImageUploadResult = {
  url: string
  publicId?: string
  provider: string
  mimeType?: string
  originalName?: string
  sizeBytes?: number
}
```

A concrete LOCAL, Cloudinary, S3, or other adapter must remain outside presentation components and must not change the API/runtime contract above.
