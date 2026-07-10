# FE-02 Laundry Image Architecture Foundation

Status: ARCHITECTURE_FOUNDATION
Owner Standard: FE-02 Architecture
Feature Task: Laundry Image
Implementation Status: NOT_STARTED

## Purpose

Define the Laundry Image flow boundary so FE-03 and FE-04 can continue without inventing workflow, ownership, or host behavior.

Primary flow:

```text
Open Laundry Work
→ Upload Image
→ View Image List
→ Update Caption
→ Set Cover
→ Soft Delete
→ Refresh
→ Persisted State Confirmed
```

This artifact defines architecture only. It does not create runtime code, UI implementation, API behavior, schema changes, or business logic.

## Actors

| Actor | Workspace | Goal |
|---|---|---|
| Laundry Staff | Laundry Workspace | Capture and attach evidence to a Laundry Work. |
| Laundry Manager | Laundry Workspace | Review, caption, select cover, and remove invalid evidence. |
| Laundry Owner | Laundry Workspace | Review image evidence and audit outcomes. |
| Resort User | Resort Workspace | View only evidence explicitly exposed for the resort's own work. |

## User Goals

- Attach image evidence to the correct Laundry Work.
- View persisted evidence inside the work context.
- Add or update captions.
- Select one active image as cover when allowed.
- Soft-delete invalid evidence without false local success.
- Refresh and retain the same persisted result.
- Preserve work ownership, permission, and workspace isolation.

## Feature Ownership

Suggested feature owner:

```text
frontend/src/features/laundry-images/
```

The feature owns:

- image evidence API boundary
- image models and mappers
- image runtime and policies
- image projections
- upload/list/caption/cover/delete state
- feature hooks and stores
- feature-owned presentation components

The feature does not own:

- Laundry Work lifecycle
- Work Detail page shell
- generic file primitives
- storage provider implementation
- Issue internals

## Host Boundary

Laundry Image is a child capability of Laundry Work.

```text
laundry-works host
  -> public Laundry Image surface
```

Host inputs:

- `workId`
- workspace context
- permission/read-only metadata
- terminal work metadata

Public outputs:

- active image list projection
- image count
- cover image projection
- mutation completion result

The feature must not import internal Laundry Work stores or mutate Laundry Work state directly.

## Route / Screen / Layout Ownership

Baseline decision: Laundry Image has no standalone primary route.

| Route | Screen Surface | Layout | Page Owner | Surface Owner |
|---|---|---|---|---|
| `/laundry/works/:workId` | Image Evidence Panel | `WorkDetailLayout` | `laundry-works` | `laundry-images` |

Optional future route requires a later architecture decision:

```text
/laundry/works/:workId/images
```

Screen inventory:

- Image Evidence Panel
- Upload Surface
- Image Gallery
- Image Preview
- Caption Editor
- Cover Selector
- Soft Delete Confirmation
- Loading State
- Empty State
- Error State
- Read-only State

## Component Boundary

```text
laundry-images/
  components/
    LaundryImagePanel
    LaundryImageUploader
    LaundryImageGallery
    LaundryImageCard
    LaundryImagePreview
    LaundryImageCaptionEditor
    LaundryImageCoverAction
    LaundryImageDeleteAction
    LaundryImageEmptyState
    LaundryImageErrorState
```

Rules:

- Components do not call backend transport directly.
- Components do not decide permission, cover, terminal, or deletion policy.
- Components consume projections and allowed-action metadata.
- Shared UI remains business-neutral.
- Local file preview is separate from confirmed persisted image state.

## Main Flow

### 1. Open Laundry Work

The host validates accessible work context and supplies `workId` plus workspace metadata.

### 2. Upload Image

Inputs:

- `workId`
- file or files
- optional caption

Expected result:

- upload accepted by integration contract
- persisted image record returned
- active list reconciled from confirmed data

### 3. View Image List

Expected projection:

- active images only
- stable ordering
- caption
- cover marker
- allowed actions

### 4. Update Caption

Caption mutation persists before the confirmed projection changes.

### 5. Set Cover

Runtime decides how the previous cover is cleared. UI does not infer this rule.

### 6. Soft Delete

The active projection removes the image only after confirmed mutation. Audit semantics remain backend-owned.

### 7. Refresh Persistence

After reload:

- uploaded images remain
- captions remain
- cover remains correct
- soft-deleted images remain absent from the active projection

## Exception Flow

### Invalid File

Unsupported, oversized, or corrupt files are rejected by feature policy/integration validation.

### Upload Failure

A failed request must not appear as persisted evidence.

### Duplicate Submission

FE-03 and FE-06 must prevent unintended duplicate records.

### Invalid Work Context

No image mutation proceeds without an accessible Laundry Work.

### Terminal Work

FE-03 defines view-only or mutation policy for closed/cancelled work.

### Cover Image Deleted

FE-03 defines whether cover becomes empty or another image is promoted.

### Isolation or Permission Failure

The feature exposes no data or mutation capability outside the authorized work and workspace.

## Source of Truth

```text
Backend image record / storage result
→ API contract
→ feature mapper
→ image projection
→ UI
```

Local preview is never durable proof of success.

## Cross-feature Import Rules

Allowed:

- own feature package
- approved public Laundry Work host contract
- business-neutral shared modules

Forbidden:

- Laundry Work internal store imports
- Issue internal imports
- shared importing Laundry Image feature modules
- direct host-state mutation

## FE-03 Runtime Handoff

FE-03 must define:

- load lifecycle
- upload lifecycle
- caption mutation lifecycle
- cover mutation lifecycle
- soft-delete lifecycle
- duplicate-submit protection
- terminal-work policy
- permission/workspace policy
- refresh reconciliation
- unknown/error handling
- allowed-action projection

Suggested frontend runtime categories:

```text
IDLE
LOADING
READY
UPLOADING
UPDATING_CAPTION
SETTING_COVER
DELETING
REFRESHING
ERROR
READ_ONLY
```

These are frontend runtime categories, not backend enums.

## FE-04 UI Composition Handoff

FE-04 must define:

- panel placement in Work Detail
- upload interaction
- gallery/card composition
- preview interaction
- caption editing
- cover indicator/action
- delete confirmation
- loading, empty, error, and read-only composition
- adaptive mobile/desktop behavior using one component family

FE-04 must not invent runtime, permission, cover, or deletion rules.

## Architecture Done State

This FE-02 gate is ready when:

- actor and user goals are defined
- host boundary is defined
- route, screen, and layout ownership are defined
- component boundary is defined
- main and exception flows are defined
- source-of-truth and import boundaries are defined
- FE-03 and FE-04 handoffs are actionable

Implementation remains governed by the Feature Task lifecycle and current Task Registry status.
