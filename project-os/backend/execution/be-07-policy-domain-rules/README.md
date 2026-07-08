# BE-07 Policy and Domain Rules

Status: IN_PROGRESS_CONTINUE
Scope: Backend Policy, Workspace Boundary, Actor Context, Authorization, Domain Rule Standardization
Owner: Backend Architecture
Execution Package: BE-07

## Purpose

BE-07 defines the backend policy layer for the Laundry platform.

The goal is to make workspace boundaries, actor context, authorization decisions, and domain rules explicit, testable, and reusable without moving business meaning into controllers, repositories, frontend code, or Prisma schema ownership.

## Current Architecture Standard

All policy-sensitive backend runtime code should follow this flow:

```text
Request
  -> actor auth middleware
  -> request actor context
  -> Controller parse/transport only
  -> shared policy context helper
  -> Service
  -> Authorization Policy
  -> Workspace Policy
  -> Domain Business Rules
  -> Repository
```

## BE-07 Core Files

Current core/policy files:

- `backend/src/core/actor.js`
- `backend/src/core/requestContext.js`
- `backend/src/core/policyContext.js`
- `backend/src/middlewares/authActor.middleware.js`
- `backend/src/middlewares/optionalActor.middleware.js`
- `backend/src/policies/workspace.policy.js`
- `backend/src/policies/authorization.policy.js`
- `backend/src/middlewares/error.middleware.js`

## Actor Standard

Actor is the source of truth for backend policy decisions.

Required actor fields:

- `userId`
- `role`
- `workspaceType`
- `resortId` for Resort workspace actors
- `active=true`

Supported roles:

- `LAUNDRY_OWNER`
- `LAUNDRY_MANAGER`
- `LAUNDRY_STAFF`
- `RESORT_OWNER`
- `RESORT_STAFF`

Supported workspace types:

- `LAUNDRY`
- `RESORT`

## Workspace Boundary Standard

Client-supplied workspace boundary fields must not be trusted for runtime scope decisions.

Do not use these as policy source of truth:

- `query.workspaceType`
- `query.resortId`

Runtime scope must come from actor context through the strict actor workspace policy helper.

Repository files must not import workspace policy directly. Repositories receive already-scoped `where` objects from services.

## Authorization Standard

Read/list flow:

- must be actor-scoped
- may support both Laundry workspace and Resort workspace when the domain allows resort-owned visibility

Operational write flow:

- must be gated by Laundry staff-level authorization

Master-data management flow:

- list/read requires Laundry staff-level authorization
- create/update requires Laundry management-level authorization

Current authorization helpers:

- `assertLaundryWorkspaceActor`
- `assertLaundryStaffActor`
- `assertLaundryManagementActor`

## Controller Standard

Controllers must remain transport-focused.

Controllers should:

- parse request params/query/body
- call the shared policy context helper
- pass policy context into services
- return response through response helpers

Controllers should not:

- decide workspace boundaries
- decide permissions
- build Prisma policy where clauses
- trust client-supplied workspace boundary fields as runtime scope

## Service Standard

Services own policy orchestration.

Services should:

- call authorization policy when permission is required
- call workspace policy to build scoped `where`
- call domain business rules for business meaning
- call repositories with already-scoped data/where

Services should not:

- trust query boundary fields
- delegate policy decisions to repositories
- allow write flows without role gate

## Repository Standard

Repositories are data-focused.

Repositories should:

- accept scoped `where` from services
- execute Prisma queries
- return data

Repositories should not:

- import workspace policy
- import authorization policy
- export `buildWorkspaceWhere`
- decide permissions
- decide workspace boundaries

## Policy Decision Log

BE-07 currently establishes these architecture decisions:

| Decision | Standard |
|---|---|
| Actor source of truth | Runtime policy scope comes from actor context. |
| Client boundary fields | Client-provided workspace boundary fields are never policy source of truth. |
| Controller responsibility | Controllers are transport-only and pass policy context into services. |
| Service responsibility | Services orchestrate policy, domain rules, and repository calls. |
| Repository responsibility | Repositories are data-focused and policy-free. |
| Read/list access | Read/list flow must be actor-scoped. |
| Operational writes | Operational write flow must require Laundry staff-level authorization. |
| Master-data writes | Master-data create/update flow must require Laundry management-level authorization. |
| Runtime verification | BE-07 standards must be executable through `verify-runtime.js`. |

## ADR Policy

Architecture-level policy changes require an ADR or equivalent project decision record before implementation.

ADR-required changes include:

- Actor model changes
- Workspace boundary model changes
- Permission model changes
- Role hierarchy changes
- Repository ownership changes
- Cross-workspace visibility changes
- New runtime policy source of truth

Small implementation refactors that preserve these decisions do not require a new ADR.

## Module Coverage Matrix

| Module / Domain | Scope | BE-07 Status | Notes |
|---|---|---:|---|
| LaundryWork | Operational | ✅ Hardened | Actor-scoped read/list; staff-gated writes. |
| LaundryBag | Operational | ✅ Hardened | Actor-scoped parent work access; staff-gated writes. |
| LaundryCountLine | Operational | ✅ Hardened | Actor-scoped work access; staff-gated count writes. |
| LinenMovement | Operational ledger | ✅ Hardened | Actor-scoped movement access; staff-gated movement writes. |
| IssueReport | Operational issue | ✅ Hardened | Actor-scoped issue visibility; staff-gated issue writes. |
| WashLoadPlan | Operational planning | ✅ Hardened | Actor-scoped work/plan access; staff-gated writes. |
| LaundryMachineLoadRule | Master data | ✅ Hardened | Staff read; management create/update. |
| Resort | Master data | ✅ Hardened | Staff read; management create/update. |
| Auth/User token issuance | Auth foundation | ⏳ Future hardening | Actor payload generation should be reviewed before freeze if auth endpoints are added. |
| Billing/Finance | Future module | ⏳ Out of current scope | Requires separate policy inventory when module is introduced. |
| Notification | Future module | ⏳ Out of current scope | Requires separate policy inventory when module is introduced. |
| Reporting | Future module | ⏳ Out of current scope | Requires read visibility and aggregation policy review. |
| Inventory beyond linen movement | Future module | ⏳ Out of current scope | Requires stock truth and movement boundary policy review. |

## Runtime Guarantees

When BE-07 verification passes, the current hardened backend domain guarantees:

- protected runtime routes require actor context
- read/list flows are actor-scoped
- operational write flows are staff-gated
- master-data write flows are management-gated
- controllers do not own workspace or permission decisions
- services own policy orchestration
- repositories remain policy-free
- client-supplied workspace boundary fields are not accepted as runtime scope
- nested route order is protected where route collision is possible
- source-level regression checks guard the current BE-07 architecture standard

## Hardened Domains

The current BE-07 standardization pass covers:

- `LaundryWork`
- `LaundryBag`
- `LaundryCountLine`
- `LinenMovement`
- `IssueReport`
- `WashLoadPlan`
- `LaundryMachineLoadRule`
- `Resort` management

## Runtime Route Standard

Public route:

- `/api/health`

Authenticated actor routes:

- `/api/laundry/works`
- `/api/laundry/works/:workId/bags`

Nested routes must be mounted before broader parent routes when path collision is possible.

Current required route order:

```text
/laundry/works/:workId/bags
/laundry/works
```

## Environment Requirements

Required runtime environment variables:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `ENABLE_DEV_ACTOR_HEADER`

`JWT_SECRET` must be at least 32 characters.

## Verification Standard

The canonical executable verification is:

```bash
cd backend
node scripts/verify-runtime.js
```

`verify-runtime.js` currently checks:

- schema availability
- BE-03 route/service contract exports
- BE-05 business-layer exports
- actor core exports
- request context exports
- policy context exports
- auth middleware exports
- optional dev actor middleware exports
- error middleware exports
- route auth middleware usage
- nested route order
- controller policy context usage
- strict actor workspace policy usage in services
- no client boundary scope usage in hardened services
- staff write gates in operational services
- management gates in master-data services
- repositories remain policy-free

## Definition of Done

BE-07 is considered complete only when all of these are true:

- all current protected routes require actor context
- all active controllers use the shared policy context helper
- all current read/list flows are actor-scoped
- all current operational write flows are staff-gated
- all current master-data write flows are management-gated
- all hardened repositories are policy-free
- client boundary fields are not used as runtime policy scope
- `node scripts/verify-runtime.js` passes locally
- policy unit tests exist for actor, workspace, and authorization policy helpers
- representative service-level policy tests exist for at least one operational domain and one master-data domain
- BE-07 documentation and return contract have been reviewed
- any architecture-level change required by ADR policy has a recorded decision

## Future Extensions / Out of Scope

The following are intentionally outside the current BE-07 implementation scope unless explicitly assigned later:

- attribute-based access control
- delegated permissions
- cross-resort sharing
- organization-level multi-tenancy beyond current actor workspace boundary
- audit policy
- reporting aggregation policy
- billing or finance policy
- notification policy
- frontend permission UI
- Prisma schema redesign

## Current Status

BE-07 is not frozen yet.

Current result:

- Actor-first runtime scope is implemented for current Laundry backend domains.
- Operational write flows are Laundry-staff gated.
- Master-data flows are Laundry staff/management gated.
- Repository policy leakage is guarded by runtime verification.
- Controller policy context standard is established for active controllers.
- Architecture governance sections are documented.
- Final verification should be run in the development environment before freeze.

## Next Action

Recommended next actions:

1. Run `node scripts/verify-runtime.js` locally.
2. Fix any verification failures.
3. Add tests for policy functions and representative service flows.
4. Review BE-07 return contract.
5. Freeze BE-07 only after verification and review pass.
