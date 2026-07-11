# Laundry Image Traceability

Status: ACTIVE

## Authority During Pilot

V2 does not supersede V1. This record distinguishes approved intent, governance state, source implementation, and verification evidence.

## Source Map

| Concern | V1/source reference | Observed state | V2 interpretation |
|---|---|---|---|
| Dependency | `project-os/00-core/CAPABILITY-DEPENDENCY-GRAPH.md` | `BE-LW-002 BLOCKED_BY DM-LW-003` | Governance claim pending evidence refresh |
| Backend state | `project-os/backend/execution/EXECUTION-STATE-LOCK.json` | Image endpoints marked blocked by schema/migration | Conflicts with repository artefacts; do not silently unblock |
| Feature contract | `project-os/frontend/tasks/laundry-image/CONTRACT.md` | Provider-neutral metadata contract ready | Governing feature contract for pilot |
| Feature status | `project-os/frontend/tasks/laundry-image/STATUS.md` | BE and FE boundaries implemented, runtime evidence missing | Matches current source inventory |
| FE architecture | `project-os/frontend/tasks/laundry-image/artifacts/FE-02-LAUNDRY-IMAGE-ARCHITECTURE.md` | Architecture says implementation not started | Historical architecture state; stale as implementation status |
| Domain | `backend/prisma/schema.prisma` | `LaundryWorkImage` exists | Static implementation evidence only |
| Migration | `backend/prisma/migrations/20260709070000_add_laundry_work_image/migration.sql` | Migration file exists | Static migration evidence only |
| Backend | route/controller/service/repository/validator image files | Metadata boundary exists | Implemented pending verification |
| Frontend | API/controller/store/policy/projection/runtime/panel files | Metadata runtime exists | Implemented pending verification |

## Canonical Contract Preserved

```text
GET    /api/laundry/works/:workId/images
POST   /api/laundry/works/:workId/images
PATCH  /api/laundry/images/:imageId
PATCH  /api/laundry/images/:imageId/cover
DELETE /api/laundry/images/:imageId
```

## Governance Drift

### GD-LI-001

The V1 State Lock claims schema and migration support are missing, while the repository contains both. Presence alone is not sufficient to change the lock because V1 uses verified-evidence-only policy.

Resolution requires schema validation, migration inspection/verification, API smoke evidence, and an authorized V1 state update. V2 records this drift but does not edit V1.

### GD-LI-002

The FE architecture foundation retains `Implementation Status: NOT_STARTED`, while the feature STATUS and source tree show implementation. Treat the architecture file as design history and the feature STATUS as the newer execution report, still pending runtime proof.

## Contract Alignment Finding

Frontend previously typed soft delete as `{ deleted: true }`, while the backend controller returns the soft-deleted image record. The pilot aligned the frontend API boundary with the existing backend response and fixed the repository return path so the deleted record is available after `deletedAt` is set. No REST contract or route changed.
