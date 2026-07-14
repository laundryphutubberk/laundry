# Full Campaign Acceptance Test V1

Status: ACTIVE
Work Status: BLOCKED
Campaign: Operational Platform V1 Completion
Acceptance timestamp: `2026-07-14T09:43:50Z`

## Production baseline

| Evidence | Value | Result |
| --- | --- | --- |
| Frontend | `https://laundry-tech.vercel.app` | PASS |
| Backend | `https://laundry-backend-pjgp.onrender.com` | PASS |
| Tested frontend SHA | `d7f72c8f341c0ebdebe53708ca03bebdae39b8df` | PASS |
| Tested backend SHA | `46fbf1bf683dc13ccac45e59b390f1c78fc7f590` | PASS |
| Backend branch | `main` | PASS |
| Application/database health | `ok` / `ok` | PASS |
| Credentialed CORS | exact Production origin; credentials `true`; no wildcard | PASS |
| Deployment automation | Vercel operational; Render certified; manual deployment recovery-only | PASS |

The SHA difference is valid: commits after the backend certification commit changed Project OS evidence only and did not modify `backend/**`.

## Acceptance matrix

| Area | Automated/static result | Production operator result | Notes |
| --- | --- | --- | --- |
| SPA routes, assets, lazy boundaries | PASS | NOT APPLICABLE | All required deep links returned 200; built assets loaded; local Production build emitted Reports and Settings chunks. |
| Backend route boundaries | PASS | NOT APPLICABLE | Required routes returned expected 401 boundaries, never 404/500. |
| Password authentication | PASS | BLOCKED | Verified locally and Production route exists; valid Production login requires approved test credentials. |
| Google login/registration policy | PASS | BLOCKED | Automated regressions pass; interactive linked-account and OAuth-origin evidence required. |
| Remember Device/non-remembered/logout | PASS | BLOCKED | Rotation, reuse, expiry, revoke, cookie policy pass; browser restart evidence required. |
| Owner/Manager/Staff RBAC | PASS | BLOCKED | Policy/HTTP regressions pass; role-specific Production accounts were not supplied. |
| Resort and Item Catalog | PASS | BLOCKED | CRUD/filter/deactivation regressions pass; no disposable Production data was created. |
| Work, Bag, Count, Image | PASS | BLOCKED | Service/HTTP/database regressions pass; camera and full Production lifecycle require operator execution. |
| Issue and Claim | PASS | BLOCKED | Embedded/global lifecycle and protection regressions pass; Production reversible lifecycle requires operator execution. |
| Data Recording, Ready, Return, Closure | PASS | BLOCKED | Workflow, queue, return, closure, concurrency and closed-work protections pass; Production lifecycle evidence required. |
| Operational Queues | PASS | BLOCKED | Shared implementation, semantics, navigation and active state pass; acceptance-work presence requires operator data. |
| Reports | PASS | BLOCKED | Range, scope, metrics, summaries and responsive contracts pass; authenticated Production cross-check required. |
| Workspace Settings and Security | PASS | BLOCKED | Policy/UI/API regressions pass; reversible Production persistence and identity UI require operator evidence. |
| Mobile/Desktop | PASS | BLOCKED | Static responsive/shell verification passes; physical device/browser acceptance remains. |

## Role coverage

Automated policy coverage includes Owner, Manager, Staff, cross-workspace denial, tenant scoping, management-only Reports, OWNER-only Settings mutation, and authentication-method invariants. Production role coverage is `BLOCKED_OPERATOR_EVIDENCE_REQUIRED` because approved credentials were not supplied.

## Defect register

No P0, P1, P2, P3, or P4 product defect was discovered by automated Production preflight or repository verification. Outstanding operator checks are missing acceptance evidence, not confirmed defects.

## Test data and disposition

No Production Resort, Item Type, Work, Bag, Count, Image, Issue, Claim, Return, Settings, identity, membership, or session record was created or modified by this run. Final disposition: `NOT APPLICABLE`.

## Deferred debt

- Vercel builds backend-only and Project OS-only commits; path-based suppression is an efficiency improvement.
- The main frontend bundle retains the existing non-blocking size advisory.
- Platform capability extraction remains deferred until Campaign Acceptance succeeds.

## Release decision

Trial release is blocked only on the operator checklist. Automated readiness is PASS. Recovery point: frontend `d7f72c8f341c0ebdebe53708ca03bebdae39b8df`; backend `46fbf1bf683dc13ccac45e59b390f1c78fc7f590`; database rollback remains a separate controlled action.

Capability Harvest trigger: `WAITING_FOR_OPERATOR_ACCEPTANCE`.
Next action: execute `OPERATOR-CHECKLIST.md`, return role/device evidence and disposable test-record identifiers, then issue the final Trial Release decision.
