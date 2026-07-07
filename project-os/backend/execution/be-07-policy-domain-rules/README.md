# BE-07 Policy and Domain Rules

Status: Standard
Scope: Backend Policy and Domain Rules
Owner: Backend Architecture
Execution Package: BE-07

## Purpose

BE-07 defines and maintains backend policy boundaries and domain rules.

The package exists to make reusable domain decisions explicit, testable, and safe without moving business meaning into controllers, repositories, shared foundation, frontend, or Prisma schema ownership.

## Scope

BE-07 owns:

- policy files inside target backend modules
- domain rule naming
- service calls to policy boundaries
- domain error alignment for policy decisions
- policy review and freeze documentation

BE-07 does not own:

- repository query behavior unless explicitly required by a service-owned policy workflow
- controller business decisions
- unrelated module behavior
- frontend behavior
- Prisma schema truth
- BE-01 through BE-06 foundation work
- BE-08 transaction and consistency work

## Development Authority

BE-07 is currently in early development.

Within the active BE-07 responsibility boundary, the steward is authorized to:

- edit existing files when they are part of BE-07 policy/domain-rule work
- delete obsolete files when they are redundant, stale, or conflicting with the intended BE-07 architecture
- move, split, merge, or rename files when it improves policy clarity
- refactor policy and service policy-call structure without preserving temporary backward compatibility during development
- replace earlier BE-07 documentation when the newer source of truth is clearer

This authority applies only when the change stays inside the current BE-07 responsibility boundary.

Any change that touches another execution package must have a clear BE-07 policy/domain-rule reason or wait for explicit assignment.

When old files are changed or removed, BE-07 documentation should be kept aligned through README, inventory, or the accumulated return-contract draft.

## Canonical Package File

Read first:

- `BE-07-policy-domain-rules.md`

This is the execution package contract for BE-07.

## Current Package Documents

- `README.md` — package entry point and index
- `BE-07-policy-domain-rules.md` — canonical BE-07 execution package
- `BE-07-policy-inventory.md` — verified policy inventory and progress notes
- `BE-07-task-return-contract.md` — accumulated return contract draft for the current BE-07 scope

## Milestones

BE-07 milestones:

- BE-07.01 Policy Inventory
- BE-07.02 Domain Rule Extraction
- BE-07.03 Policy Naming Alignment
- BE-07.04 Domain Error Alignment
- BE-07.05 Policy Freeze

## Development Workflow

Current workflow decision:

- Do not stop for backend tests after each small BE-07 segment.
- Do not perform small/intermediate return-contract review gates during development.
- Continue BE-07 implementation until the assigned BE-07 scope is complete.
- Run backend tests once at the end of the full assigned BE-07 work.
- Review the final BE-07 return contract once at the end of the full assigned BE-07 work.

Progress and evidence documents may still be updated during development.

## Current Status

Current completed target scopes:

- Equipment manual status update ownership policy
- Field Session lifecycle policy coverage
- Issue policy coverage
- Remaining policy discovery

Current result:

- Equipment policy scope is implemented for the initial BE-07 target scope.
- Field Session lifecycle policy coverage has been expanded and documented.
- Issue policy and validator coverage has been added and documented.
- Remaining active-module policy discovery has been recorded.
- README entry point exists.
- Progress inventory exists.
- Return contract draft exists.
- Source-level verification and test-coverage-by-inspection are complete for current completed scopes.
- Final backend tests and final return-contract review are deferred until the end of the full assigned BE-07 work.

Current development status:

- `IN_PROGRESS_CONTINUE`

## Equipment Policy Decisions

- `READY` -> `manualAllowed`
- `IN_USE` -> `scannerOwned`
- `MISSING` -> `issueOwned`
- `DAMAGED` -> `issueOwned`
- `INSPECTION_REQUIRED` -> `manualAllowed`
- `RETIRED` -> `adminRestricted`
- unknown status -> blocked by default

## Field Session Lifecycle Policy Decisions

- active session statuses are centralized
- legacy field-session status aliases are normalized centrally
- scan mode runtime config is centralized
- scan modes are allowed only in owned session statuses
- field-session transitions are declared in policy
- session-item transitions are declared in policy
- closure is blocked by pending-return and issue item statuses

## Issue Policy Decisions

- organization context is required before repository access
- issue existence is required after repository lookup
- create issue requires sessionId, type, and title
- create/update payload fields are allow-listed
- string payload fields are trimmed and empty strings become null
- reportedAt/resolvedAt values are converted to Date when present
- empty update payload is blocked

## Remaining Discovery Decisions

- active module routes are verified from `fieldops-be/src/routes/module.routes.js`
- current mounted modules are auth, organizations, users, members, field-sessions, invites, issues, and equipments
- team route is not mounted on the active branch
- vehicle route is not mounted on the active branch
- notification route is not mounted on the active branch
- no team policy implementation is included because no active mounted team route or team service file was verified
- no vehicle policy implementation is included because no active mounted vehicle route was verified
- no notification policy implementation is included because no active mounted notification route or notification policy/service file was verified

## Verification Notes

Relevant source files:

- `fieldops-be/src/routes/module.routes.js`
- `fieldops-be/src/modules/equipment/equipmentLifecycle.policy.js`
- `fieldops-be/src/modules/equipment/equipmentLifecycle.policy.test.js`
- `fieldops-be/src/modules/equipment/equipment.service.js`
- `fieldops-be/src/modules/equipment/equipment.service.test.js`
- `fieldops-be/src/modules/field-session/fieldSessionLifecycle.policy.js`
- `fieldops-be/src/modules/field-session/fieldSessionLifecycle.guard.js`
- `fieldops-be/src/modules/field-session/fieldSession.service.js`
- `fieldops-be/src/modules/field-session/fieldSessionLifecycle.policy.test.js`
- `fieldops-be/src/modules/issue/issue.policy.js`
- `fieldops-be/src/modules/issue/issue.errors.js`
- `fieldops-be/src/modules/issue/issue.validator.js`
- `fieldops-be/src/modules/issue/issue.service.js`
- `fieldops-be/src/modules/issue/issue.policy.test.js`
- `fieldops-be/src/modules/issue/issue.validator.test.js`

Relevant documentation files:

- `docs/project-os/backend/execution/BE-07/BE-07-policy-domain-rules.md`
- `docs/project-os/backend/execution/BE-07/BE-07-policy-inventory.md`
- `docs/project-os/backend/execution/BE-07/BE-07-task-return-contract.md`

## Next Action

Recommended next action:

1. Confirm whether BE-07 scope should close at the current completed scopes.
2. If confirmed, run final backend tests once for the full assigned BE-07 work.
3. Review and finalize the BE-07 return contract once.
4. Freeze BE-07 after final verification/review.

Do not expand BE-07 to vehicle, team, billing, notification, or other domains until ownership is explicitly assigned or verified as a BE-07 policy/domain-rule need.
