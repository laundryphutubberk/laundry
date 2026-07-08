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

## Current Status

BE-07 is not frozen yet.

Current result:

- Actor-first runtime scope is implemented for current Laundry backend domains.
- Operational write flows are Laundry-staff gated.
- Master-data flows are Laundry staff/management gated.
- Repository policy leakage is guarded by runtime verification.
- Controller policy context standard is established for active controllers.
- Final verification should be run in the development environment before freeze.

## Next Action

Recommended next actions:

1. Run `node scripts/verify-runtime.js` locally.
2. Fix any verification failures.
3. Add tests for policy functions and representative service flows.
4. Review BE-07 return contract.
5. Freeze BE-07 only after verification and review pass.
