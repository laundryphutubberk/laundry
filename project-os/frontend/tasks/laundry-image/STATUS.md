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

Detail-image read integration and backend mutation contract definition.

## Completed Inspection

- Confirmed `LaundryWorkImage` domain model supports the required flow.
- Confirmed migration `20260709070000_add_laundry_work_image` exists with work/resort foreign keys and required indexes.
- Confirmed no dedicated Laundry Image router/controller/service/repository/validation/upload adapter is registered in the active backend route graph.
- Confirmed backend currently has no multipart dependency or established upload transport contract.
- Confirmed frontend Laundry Work capability still reports image list/upload as unavailable.
- Confirmed `LaundryWorkDetailDTO`, normalization, and projection do not yet carry persisted images.
- Confirmed `ImagePanel` currently lacks caption, cover, and soft-delete action boundaries.
- Recorded findings in `artifacts/ARCHITECTURE-INSPECTION.md`.

## Implemented This Phase

- Laundry Work Detail repository now includes only active images where `deletedAt = null`.
- Image ordering is deterministic: cover first, then `displayOrder`, then `uploadedAt`.
- Related commit: `1f884efe0243414e0a9d993141dc0a155d2bddc6`.

This implementation establishes the backend read source only. It is not runtime PASS evidence yet.

## Next Required Actions

- Add image DTO and detail normalization to the frontend API boundary.
- Project normalized image evidence into `ImagePanel`.
- Keep upload/caption/cover/delete capabilities disabled until backend mutation endpoints are implemented.
- Define backend mutation contracts for upload, caption, cover, and soft delete within the Laundry Image Task boundary.
- Define workspace isolation, role permission, terminal-work, validation, storage adapter, and audit behavior before exposing mutations.
- Preserve presentational component boundaries and avoid direct API/store access in `ImagePanel`.

## Confirmed Blocker

The image mutation contract does not currently exist.

Missing contracts:

- Upload endpoint and transport format
- Caption update endpoint
- Set-cover endpoint and atomic single-cover rule
- Soft-delete endpoint
- Storage/provider adapter
- File validation limits
- Workspace and permission enforcement
- Terminal-work mutation behavior
- Business audit events

Frontend mutation implementation must not guess these contracts.

## Known Frontend Gaps

- No image DTO in Laundry Work Detail contract.
- No image normalization in the detail API boundary.
- Projection currently emits an empty image list.
- Image capability is disabled.
- No frontend caption, cover, soft-delete, or duplicate-submit orchestration.

## Evidence

- `artifacts/ARCHITECTURE-INSPECTION.md`
- Architecture inspection commit: `8cf26243b58ed5faa7e8a8360df1f447567eb9f4`
- Backend detail read-path commit: `1f884efe0243414e0a9d993141dc0a155d2bddc6`
- Backend contract inspection update: `ab2136776b78e6137da9d64e56e65063ac2b2c78`

## Completion Gate

Do not mark `COMPLETED` until upload, list, caption, cover, soft delete, refresh persistence, workspace isolation, build, lint, and runtime evidence all pass and final handoff is written.
