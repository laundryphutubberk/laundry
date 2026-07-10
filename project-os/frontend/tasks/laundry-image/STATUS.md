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

Backend contract inspection.

## Completed Inspection

- Confirmed `LaundryWorkImage` domain model supports the required flow.
- Confirmed migration `20260709070000_add_laundry_work_image` exists with work/resort foreign keys and required indexes.
- Confirmed frontend Laundry Work capability still reports image list/upload as unavailable.
- Confirmed `LaundryWorkDetailDTO`, normalization, and projection do not yet carry persisted images.
- Confirmed `ImagePanel` currently lacks caption, cover, and soft-delete action boundaries.
- Recorded findings in `artifacts/ARCHITECTURE-INSPECTION.md`.

## Next Required Actions

- Inspect backend image routes, controller, service, repository, validation, upload adapter, and policy.
- Confirm actual endpoint paths, multipart contract, response envelope, workspace isolation, and terminal-work rules.
- Define frontend image DTO and capability contract from backend truth.
- Implement API/state/controller/projection/UI wiring only after the backend contract is confirmed.
- Preserve presentational component boundaries and avoid direct API/store access in `ImagePanel`.

## Known Frontend Gaps

- No image DTO in Laundry Work Detail contract.
- No image normalization in the detail API boundary.
- Projection currently emits an empty image list.
- Image capability is disabled.
- No frontend caption, cover, soft-delete, or duplicate-submit orchestration.

## Evidence

- `artifacts/ARCHITECTURE-INSPECTION.md`
- Related commit: `8cf26243b58ed5faa7e8a8360df1f447567eb9f4`

## Completion Gate

Do not mark `COMPLETED` until upload, list, caption, cover, soft delete, refresh persistence, workspace isolation, build, lint, and runtime evidence all pass and final handoff is written.
