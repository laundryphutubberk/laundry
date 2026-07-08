# BE-07 Compliance Audit Report

Status: PHASE_1_AUDIT_COMPLETE
Scope: Backend-wide BE-07 compliance audit using currently mounted runtime routes and loaded backend foundation modules
Date: 2026-07-08

## Audit Purpose

This report records the Phase 1 verification audit for BE-07.

The goal is to distinguish between:

1. Active Runtime Coverage — routes currently mounted and reachable through `backend/src/routes/index.js`.
2. Loaded Foundation Coverage — services, repositories, and domain modules loaded by `backend/scripts/verify-runtime.js` but not necessarily mounted as runtime API routes yet.

This prevents overclaiming system-wide runtime coverage while preserving evidence for the current backend policy baseline.

## Evidence Sources

Primary source files:

- `backend/src/routes/index.js`
- `backend/scripts/verify-runtime.js`
- `backend/src/core/actor.js`
- `backend/src/core/requestContext.js`
- `backend/src/core/policyContext.js`
- `backend/src/policies/workspace.policy.js`
- `backend/src/policies/authorization.policy.js`
- `backend/src/middlewares/authActor.middleware.js`
- `backend/src/middlewares/optionalActor.middleware.js`
- `backend/src/middlewares/error.middleware.js`

## Active Runtime Route Inventory

Current active route inventory from `backend/src/routes/index.js`:

| Route | Auth State | BE-07 Status | Notes |
|---|---|---:|---|
| `/api/health` | Public | ✅ Expected | Health route intentionally public. |
| `/api/laundry/works` | Actor auth required | ✅ Compliant | Mounted with actor auth middleware. |
| `/api/laundry/works/:workId/bags` | Actor auth required | ✅ Compliant | Mounted before `/laundry/works` to avoid path collision. |

No other backend runtime routes are currently mounted from the root route index.

## Active Controller Compliance

| Controller | Policy Context | BE-07 Status | Notes |
|---|---:|---:|---|
| `laundryWorks.controller.js` | ✅ Uses shared policy context helper | ✅ Compliant | Controller remains transport-focused. |
| `laundryBags.controller.js` | ✅ Uses shared policy context helper | ✅ Compliant | Controller remains transport-focused. |

## Loaded Foundation Service Coverage

These services are loaded and checked by `verify-runtime.js`:

| Service | Actor Scope | Write Authorization | BE-07 Status |
|---|---:|---:|---:|
| `laundryWorks.service.js` | ✅ Strict actor workspace policy | ✅ Staff-gated writes | ✅ Compliant |
| `laundryBags.service.js` | ✅ Strict actor workspace policy | ✅ Staff-gated writes | ✅ Compliant |
| `laundryCountLines.service.js` | ✅ Strict actor workspace policy | ✅ Staff-gated writes | ✅ Compliant |
| `linenMovements.service.js` | ✅ Strict actor workspace policy | ✅ Staff-gated writes | ✅ Compliant |
| `issueReports.service.js` | ✅ Strict actor workspace policy | ✅ Staff-gated writes | ✅ Compliant |
| `washLoadPlans.service.js` | ✅ Strict actor workspace policy | ✅ Staff-gated writes | ✅ Compliant |
| `laundryMachineLoadRules.service.js` | N/A master-data policy | ✅ Staff read / management write | ✅ Compliant |
| `resorts.service.js` | N/A master-data policy | ✅ Staff read / management write | ✅ Compliant |

## Repository Compliance

Repositories verified as policy-free by `verify-runtime.js`:

| Repository | Policy Import | Workspace Helper Export | BE-07 Status |
|---|---:|---:|---:|
| `laundryWorks.repository.js` | ✅ None | ✅ None | ✅ Compliant |
| `laundryBags.repository.js` | ✅ None | ✅ None | ✅ Compliant |
| `laundryCountLines.repository.js` | ✅ None | ✅ None | ✅ Compliant |
| `linenMovements.repository.js` | ✅ None | ✅ None | ✅ Compliant |
| `issueReports.repository.js` | ✅ None | ✅ None | ✅ Compliant |
| `washLoadPlans.repository.js` | ✅ None | ✅ None | ✅ Compliant |

## Workspace Boundary Audit

Current hardened services reject client boundary scope usage by verification:

- no `query.workspaceType` as runtime policy source
- no `query.resortId` as runtime policy source
- runtime scope comes from actor context and workspace policy

Status: ✅ Compliant for current hardened backend domains.

## Authorization Audit

Current hardened operational write flows are staff-gated:

- LaundryWork writes
- LaundryBag writes
- LaundryCountLine writes
- LinenMovement writes
- IssueReport writes
- WashLoadPlan writes

Current master-data flows are role-gated:

- LaundryMachineLoadRule list/read: staff-level
- LaundryMachineLoadRule create/update: management-level
- Resort list/read: staff-level
- Resort create/update: management-level

Status: ✅ Compliant for current hardened backend domains.

## Verification Coverage

`backend/scripts/verify-runtime.js` currently checks:

- schema availability
- BE-03 route/service contract exports
- BE-05 business-layer exports
- actor core exports
- request context exports
- policy context exports
- auth middleware exports
- optional actor middleware exports
- error middleware exports
- root route auth middleware usage
- nested route order
- active controller policy context usage
- strict actor workspace policy usage in services
- rejection of client boundary scope usage in hardened services
- staff write gates in operational services
- staff/management gates in master-data services
- repositories remain policy-free

Status: ✅ Executable audit baseline exists.

## Audit Findings

### Passed

- Active runtime protected routes require actor auth.
- Active runtime route order avoids nested route collision.
- Active controllers use shared policy context.
- Current hardened services use actor-first workspace policy.
- Current hardened operational writes are staff-gated.
- Current hardened master-data writes are staff/management-gated.
- Current hardened repositories are policy-free.
- BE-07 documentation is aligned with Laundry backend architecture.

### Gaps / Not Yet Covered

- Backend-wide file discovery is limited by connector search capability, so this audit uses root route index and `verify-runtime.js` as the current authoritative manifest.
- Only active controllers mounted through root route index are controller-audited.
- Services loaded by `verify-runtime.js` are foundation-audited but may need controller/route audit when exposed as runtime routes later.
- Automated policy unit tests are still recommended before BE-07 freeze.
- Representative service-level policy tests are still recommended before BE-07 freeze.

## Compliance Conclusion

Phase 1 Verification Audit result:

```text
Active Runtime BE-07 Compliance: PASS
Loaded Foundation BE-07 Compliance: PASS for current verified manifest
Backend-wide Unknown Surface: LIMITED by current route manifest and connector discovery
Freeze Readiness: NOT YET — tests and final local verification still required
```

## Recommended Next Actions

1. Run local verification:

```bash
cd backend
node scripts/verify-runtime.js
```

2. Add policy unit tests for:

- actor normalization and validation
- workspace policy
- authorization policy

3. Add representative service-level tests for:

- one operational write flow
- one actor-scoped read flow
- one master-data management write flow

4. After verification and tests pass, proceed to BE-07 Freeze Review.
