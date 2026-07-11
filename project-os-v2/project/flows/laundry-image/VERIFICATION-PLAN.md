# Laundry Image Metadata Verification Plan

Status: ACTIVE

## Evidence Rule

Each claim remains `NOT_EXECUTED` until its named command or observed action runs successfully. Source inspection is not runtime PASS evidence.

## Domain and Migration

| Claim | Level | Required evidence | State |
|---|---|---|---|
| LI-DM-001 model matches approved metadata fields and relations | STATIC | Prisma validation and focused schema inspection | PASS |
| LI-DM-002 migration creates required table, keys, and indexes | DATABASE | migration inspection plus applicable migration status/test | PASS |

## Backend Service

| Claim | Level | Required behavior | State |
|---|---|---|---|
| LI-BE-SVC-001 | INTEGRATION | active list scope | PASS |
| LI-BE-SVC-002 | INTEGRATION | metadata registration and authenticated ownership | PASS |
| LI-BE-SVC-003 | INTEGRATION | caption/order persistence | PASS |
| LI-BE-SVC-004 | INTEGRATION | atomic cover replacement orchestration | PASS |
| LI-BE-SVC-005 | INTEGRATION | soft delete and cover clearing | PASS |
| LI-BE-SVC-006 | SECURITY | Resort mutation rejection and terminal Work rejection | PASS |

## Backend HTTP

| Claim | Level | Required behavior | State |
|---|---|---|---|
| LI-BE-HTTP-001 | RUNTIME | all five authenticated routes and response envelopes | PASS |
| LI-BE-HTTP-002 | SECURITY | authenticated Resort read, cross-resort rejection, and mutation rejection | PASS |
| LI-BE-HTTP-003 | RUNTIME | invalid body and terminal Work failures | PASS |

## Frontend Engineering

| Claim | Level | Required evidence | State |
|---|---|---|---|
| LI-FE-001 | STATIC | architecture verification where available | PASS |
| LI-FE-002 | STATIC | lint | PASS |
| LI-FE-003 | STATIC | production build | PASS |
| LI-FE-004 | INTEGRATION | API normalization and response compatibility | PASS |

## User Flow

| Claim | Level | Required behavior | State |
|---|---|---|---|
| LI-UX-001 | SMOKE | list persists after reload | PASS |
| LI-UX-002 | SMOKE | register metadata refreshes list | PASS |
| LI-UX-003 | SMOKE | caption persists after reload | PASS |
| LI-UX-004 | SMOKE | one cover remains after reload | PASS |
| LI-UX-005 | SMOKE | soft-deleted image remains absent after reload | PASS |
| LI-UX-006 | SECURITY | Resort UI is read-only and scoped | APPROVED_EXCEPTION |
| LI-UX-007 | REGRESSION | terminal Work hides/disables mutations | PASS |
| LI-UX-008 | REGRESSION | duplicate in-flight mutation is prevented | PASS |

## Next Verification Action

Run database-backed migration/integration evidence and browser metadata persistence scenarios.
