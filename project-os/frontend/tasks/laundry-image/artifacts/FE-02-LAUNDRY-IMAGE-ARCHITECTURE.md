# FE-02 Laundry Image Architecture

Status: ARCHITECTURE_BASELINE_READY
Owner Standard: FE-02 Architecture
Feature Task: Laundry Image
Implementation Task Status: NOT_STARTED

## 1. Purpose

Define the architecture boundary for Laundry Work image evidence before FE-03 runtime and FE-04 UI composition begin.

Primary operational flow:

```text
Upload
→ View
→ Caption
→ Set Cover
→ Soft Delete
→ Refresh
→ Persistence Confirmed
```

This document does not create runtime code, UI implementation, API implementation, schema changes, or business logic.

## 2. Actors

| Actor | Workspace | Responsibility |
|---|---|---|
| Laundry Staff | Laundry Workspace | Capture and upload evidence images during Laundry Work. |
| Laundry Manager | Laundry Workspace | Review images, update captions, choose cover evidence, and remove invalid images. |
| Laundry Owner | Laundry Workspace | Review evidence and audit image history where permitted. |
| Resort User | Resort Workspace | View only image evidence explicitly exposed for the resort's own Laundry Work. |

## 3. User Goals

- Attach visual evidence to a Laundry Work.
- View evidence in the correct work context.
- Add or update meaningful captions.
- Select one image as the primary cover when applicable.
- Remove an image without destroying auditability.
- Refresh the page and see the same persisted result.
- Preserve workspace isolation and Laundry Work ownership.

## 4. Feature Ownership

Suggested feature package owner:

```text
frontend/src/features/laundry-images/
```

The Laundry Image feature owns:

- image evidence projections
- image evidence runtime rules
- upload and mutation contracts
- image list state
- caption behavior
- cover selection behavior
- soft-delete behavior
- image-specific policies
- image-specific mappers
- image-specific stores and hooks
- image presentation components inside the feature

The feature does not own:

- Laundry Work lifecycle
- Work Detail page shell
- global file upload utilities that are business-neutral
- storage provider implementation
- Issue evidence behavior unless an approved public boundary is defined

## 5. Host Boundary

Laundry Image is a child capability of Laundry Work.

```text
Laundry Work
  -> Laundry Image Evidence
```

Every image must be associated with a valid Laundry Work context.

The host page remains owned by `laundry-works`.

The image feature owns only its panel, gallery, uploader, caption controls, cover controls, and deletion controls.

Direct imports into `laundry-works` internals are forbidden. Integration must use a public boundary or host contract.

## 6. Route Ownership

Laundry Image does not require a standalone primary route for the baseline.

Primary route composition:

| Route | Screen Surface | Layout | Page Owner | Feature Surface Owner |
|---|---|---|---|---|
| `/laundry/works/:workId` | Image Evidence Panel | `WorkDetailLayout` | `laundry-works` | `laundry-images` |

Optional future route, only if approved later:

| Route | Screen | Layout | Owner |
|---|---|---|---|
| `/laundry/works/:workId/images` | Full Image Evidence Workspace | `WorkDetailLayout` | `laundry-images` |

Baseline decision: keep image evidence inside Work Detail to preserve task-oriented operation and avoid unnecessary navigation.

## 7. Screen Inventory

| Screen / Surface | Owner | Purpose |
|---|---|---|
| Image Evidence Panel | `laundry-images` | Host all image evidence interactions inside Work Detail. |
| Image Upload Surface | `laundry-images` | Select and upload one or more images. |
| Image Gallery | `laundry-images` | Display active images for the work. |
| Image Preview | `laundry-images` | Inspect an image without leaving the work context. |
| Caption Editor | `laundry-images` | Add or update image caption. |
| Cover Selector | `laundry-images` | Select one active image as cover when policy permits. |
| Soft Delete Confirmation | `laundry-images` | Confirm removal while preserving persistence and audit semantics. |
| Empty State | `laundry-images` | Explain that no image evidence exists yet. |
| Upload Error State | `laundry-images` | Show safe retry or failure information. |

## 8. Layout Ownership

- `WorkDetailLayout` remains owned by the architecture/layout layer.
- Laundry Image must render as a contained Work Detail section.
- The feature must not create a competing workspace shell.
- Desktop and mobile use the same feature components with adaptive composition.
- A full-screen preview may use a modal, sheet, or route overlay defined later by FE-04.

## 9. Component Boundary

Suggested feature component boundary:

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
- Components do not calculate business policies.
- Components consume projection and allowed-action metadata.
- Container components may connect to feature hooks/stores explicitly.
- Shared UI may provide business-neutral primitives only.
- File validation policy remains feature-owned when it is Laundry Image specific.

## 10. Main Operational Flow

### Step 1 — Open Work Detail

Actor: Laundry Staff, Manager, or Owner

Goal: Access the correct Laundry Work and its image evidence surface.

Architecture result:

- Host supplies `workId` and workspace context.
- Image feature loads through its public host boundary.

### Step 2 — Upload Image

Actor: Authorized Laundry user

Goal: Attach evidence to the work.

Expected inputs:

- `workId`
- selected file or files
- optional initial caption

Expected output:

- upload request accepted
- persisted image record returned
- list projection refreshed

### Step 3 — View Image List

Actor: Authorized viewer

Goal: See active image evidence for the work.

Expected output:

- ordered image projection
- cover marker
- caption
- allowed actions

### Step 4 — Update Caption

Actor: Authorized Laundry user

Goal: Add context to an image.

Expected output:

- caption persists
- image projection refreshes safely

### Step 5 — Set Cover

Actor: Authorized Laundry user

Goal: Mark one active image as the primary evidence image.

Expected output:

- selected image becomes cover
- previous cover is cleared according to runtime policy
- list remains synchronized

### Step 6 — Soft Delete

Actor: Authorized Laundry user

Goal: Remove invalid or unwanted evidence without destructive deletion semantics.

Expected output:

- image no longer appears in active list
- deleted record remains auditable according to backend contract
- cover selection is reconciled if deleted image was cover

### Step 7 — Refresh Persistence

Actor: Any authorized viewer

Goal: Confirm the latest image state remains after reload.

Expected output:

- uploaded images remain
- captions remain
- cover remains correct
- soft-deleted images remain absent from active projection

## 11. Exception Flow

### Invalid File

Examples:

- unsupported type
- file too large
- corrupt file

Architecture rule:

- validation result belongs to feature policy/runtime
- UI displays supplied error state only

### Upload Failure

Architecture rule:

- failed upload must not create a false successful image projection
- retry behavior must be defined by FE-03

### Duplicate Submission

Architecture rule:

- repeated submit must not create unintended duplicate records
- FE-03 and FE-06 must define request and refresh protection

### Missing or Invalid Work

Architecture rule:

- no image mutation may proceed without a valid accessible Laundry Work
- host and integration layers must preserve work ownership validation

### Terminal Work

Architecture rule:

- FE-03 must decide whether CLOSED or CANCELLED work permits view-only access or controlled mutations
- UI consumes allowed-action projection

### Cover Image Deleted

Architecture rule:

- runtime must define whether cover becomes empty or another image is promoted
- UI must not infer this decision

### Workspace Isolation Failure

Architecture rule:

- Resort users must not access another resort's work images
- Laundry access must follow role and work permissions

## 12. Source-of-Truth Boundary

Frontend image state is not the durable source of truth.

Source order:

```text
Backend image record and storage result
  -> API contract
  -> Laundry Image mapper
  -> Image projection
  -> UI
```

The feature must not infer successful persistence from local preview alone.

## 13. Cross-feature Contract Boundary

### Host input from `laundry-works`

- `workId`
- workspace context
- terminal/read-only state
- host refresh signal or contract

### Public output from `laundry-images`

- image count summary
- cover image projection
- active image list projection
- mutation completion result

### Forbidden

- importing internal Laundry Work stores
- mutating Laundry Work state directly
- importing Issue internals
- shared layer importing image feature modules

## 14. FE-03 Runtime Handoff

FE-03 must define:

1. Image runtime state model
2. Load lifecycle
3. Upload lifecycle
4. Caption mutation lifecycle
5. Cover mutation lifecycle
6. Soft-delete lifecycle
7. Duplicate-submit protection
8. Terminal Work mutation policy
9. Permission and workspace policy
10. Refresh reconciliation
11. Unknown/error state handling
12. Allowed-action projection

Suggested runtime categories:

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

These are frontend runtime categories, not backend domain enums.

## 15. FE-04 UI Composition Handoff

FE-04 must define:

- panel placement inside Work Detail
- uploader composition
- gallery/card composition
- preview behavior
- caption editing interaction
- cover indicator and action
- soft-delete confirmation
- loading, empty, error, and read-only states
- mobile adaptation

FE-04 must not invent upload, permission, terminal, cover, or deletion policy.

## 16. FE-05 State Handoff

FE-05 should own:

- feature store boundary
- normalized image state
- request state
- selected preview state
- projection selectors
- mutation synchronization

Local preview state must remain separate from confirmed persisted image state.

## 17. FE-06 Integration Handoff

FE-06 must confirm:

- upload contract
- list contract
- caption update contract
- cover update contract
- soft-delete contract
- work ownership enforcement
- workspace isolation
- persisted refresh behavior

## 18. Done State

The Laundry Image architecture gate is complete when:

- host boundary is defined
- route and screen ownership are defined
- layout ownership is defined
- component boundary is defined
- main and exception flows are defined
- cross-feature contracts are defined
- FE-03 and FE-04 handoffs are actionable

Implementation remains blocked until the Laundry Issue completion gate and explicit task opening are satisfied.
