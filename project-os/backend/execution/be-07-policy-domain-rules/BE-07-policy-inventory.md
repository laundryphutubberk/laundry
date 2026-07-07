# BE-07 Policy Inventory

Status: In Progress
Scope: Backend Policy and Domain Rules
Owner: Backend Architecture
Phase: BE-07
Milestone: Continuous BE-07 Development

## Purpose

Record the Backend policy inventory and progress for BE-07.

This inventory is intentionally limited to repository reality observed on `test/step-e10-ci-flow`.

## BE-07 Package Contract

BE-07 owns reusable domain decisions, policy boundaries, stable domain errors, policy usage in services, and policy review.

The package Definition of Done requires:

```text
□ domain rules are explicit
□ repeated service condition chains are extracted
□ policy does not access database directly
□ service calls policy for business decisions
□ domain errors are stable and safe
```

Final backend tests and final return-contract review are deferred until the full assigned BE-07 work is complete.

## Current Verified Policy Surface

### Equipment

Verified files:

```text
fieldops-be/src/modules/equipment/equipment.service.js
fieldops-be/src/modules/equipment/equipment.service.test.js
fieldops-be/src/modules/equipment/equipmentLifecycle.policy.js
fieldops-be/src/modules/equipment/equipmentLifecycle.policy.test.js
docs/project-os/backend/execution/BE-07/README.md
docs/project-os/backend/execution/BE-07/BE-07-task-return-contract.md
```

Observed policy boundary:

```text
equipment.service.js
  -> imports classifyEquipmentStatusUpdate
  -> delegates manual status update authorization to equipmentLifecycle.policy.js
  -> calls canManuallyUpdateEquipmentStatus for explicit policy allow/deny naming
  -> raises EQUIPMENT_STATUS_MANUAL_UPDATE_BLOCKED when policy denies direct update
```

Observed policy rules:

```text
READY                 -> manualAllowed
IN_USE                -> scannerOwned
MISSING               -> issueOwned
DAMAGED               -> issueOwned
INSPECTION_REQUIRED   -> manualAllowed
RETIRED               -> adminRestricted
unknown               -> manual update blocked by default
```

Equipment segment assessment:

```text
Policy file exists: YES
Policy avoids database access: YES
Service calls policy for business decision: YES
Domain error code exists for blocked manual status update: YES
Policy test coverage observed in this inventory pass: YES
Service domain error test coverage observed in this inventory pass: YES
Final backend test execution: DEFERRED_UNTIL_FINAL_BE07_REVIEW
Final return-contract review: DEFERRED_UNTIL_FINAL_BE07_REVIEW
```

BE-07 equipment progress:

```text
Equipment policy exposes blockedReason for denied manual status updates.
Equipment policy exposes canManuallyUpdateEquipmentStatus for explicit rule usage.
Equipment policy exposes getEquipmentStatusBlockedReason for safe error detail mapping.
Policy tests cover manual allowed statuses, scanner-owned statuses, issue-owned statuses, admin-restricted statuses, normalization, and unknown status fallback.
Service tests verify EQUIPMENT_STATUS_MANUAL_UPDATE_BLOCKED, stable statusCode, stable code, details, and repository short-circuit behavior.
```

### Field Session

Verified files:

```text
fieldops-be/src/modules/field-session/fieldSession.service.js
fieldops-be/src/modules/field-session/fieldSessionLifecycle.guard.js
fieldops-be/src/modules/field-session/fieldSessionLifecycle.policy.js
fieldops-be/src/modules/field-session/fieldSessionLifecycle.policy.test.js
```

Observed policy boundary:

```text
fieldSession.service.js
  -> imports lifecycle guard assertions
  -> imports lifecycle policy constants and helpers
  -> delegates lifecycle status transitions, scan mode ownership, session item transitions, and closure checks to lifecycle guard/policy files
```

Observed policy rules:

```text
field session active statuses are centralized
field session status aliases are normalized centrally
scan mode runtime config is centralized
scan modes are allowed only in owned session statuses
field session transitions are declared in policy
session item transitions are declared in policy
closure is blocked by pending-return statuses and issue statuses
```

Field session segment progress:

```text
Expanded fieldSessionLifecycle.policy.test.js to cover scan mode normalization, scan-mode allowed statuses, unsupported terminal transitions, issue item inspection transitions, and closure acceptance for RETURNED/INSPECTION_REQUIRED items.
No repository query behavior changed.
No controller behavior changed.
No frontend behavior changed.
Final backend test execution: DEFERRED_UNTIL_FINAL_BE07_REVIEW
Final return-contract review: DEFERRED_UNTIL_FINAL_BE07_REVIEW
```

### Issue

Verified files:

```text
fieldops-be/src/modules/issue/issue.service.js
fieldops-be/src/modules/issue/issue.policy.js
fieldops-be/src/modules/issue/issue.errors.js
fieldops-be/src/modules/issue/issue.validator.js
fieldops-be/src/modules/issue/issue.policy.test.js
fieldops-be/src/modules/issue/issue.validator.test.js
```

Observed policy boundary:

```text
issue.service.js
  -> imports assertIssueOrganizationContext and assertIssueExists from issue.policy.js
  -> delegates organization context checks and existence checks to policy
  -> delegates create/update field filtering, normalization, and required field checks to issue.validator.js
```

Observed policy rules:

```text
issue organization context is required before repository access
issue existence is required after repository lookup
create issue requires sessionId, type, and title
create/update payloads are allow-listed
string payload fields are trimmed and empty strings become null
reportedAt/resolvedAt values are converted to Date when present
empty update payload is blocked
```

Issue segment progress:

```text
Added issue.policy.test.js for organization context and issue existence domain errors.
Added issue.validator.test.js for allow-listing, normalization, create requirements, empty update blocking, and update normalization.
No repository query behavior changed.
No controller behavior changed.
No frontend behavior changed.
Final backend test execution: DEFERRED_UNTIL_FINAL_BE07_REVIEW
Final return-contract review: DEFERRED_UNTIL_FINAL_BE07_REVIEW
```

## Remaining Policy Discovery

Verified route registry on active branch:

```text
fieldops-be/src/routes/module.routes.js
```

Observed mounted module routes:

```text
auth
organizations
users
members
field-sessions
invites
issues
equipments
```

Discovery result:

```text
team module route is not mounted on the active branch.
vehicle module route is not mounted on the active branch.
notification module route is not mounted on the active branch.
team.service.js was not found on the active branch during BE-07 discovery.
notification policy/service files were not found during BE-07 discovery.
```

Current interpretation:

```text
No additional BE-07 policy implementation is approved for team, vehicle, or notification from current active-branch evidence.
If these modules are introduced later, BE-07 can evaluate their policy/domain-rule boundaries after source ownership is assigned.
```

## Candidate Policy Groups

The following domain rule groups remain candidates for future BE-07 follow-up after their current source files are verified and ownership is assigned:

```text
team assignment policy
notification delivery policy
vehicle status transition policy
```

These groups are not included until explicitly assigned and backed by active source files.

## Inventory Rules

BE-07 must not:

```text
- move policy into shared foundation when it has domain meaning
- add database reads inside policy files
- hide domain decisions in controllers
- modify unrelated modules
- assume Prisma schema intent without current source evidence
```

## Next Milestone

BE-07 remains in continuous development.

Recommended next target:

```text
Update the accumulated return-contract draft with remaining discovery status, then prepare for final BE-07 test/review gate when the user confirms scope closure.
```

Reason:

```text
Equipment policy boundary, field-session lifecycle policy coverage, issue policy coverage, and remaining module discovery are now tracked as BE-07 progress. Additional module expansion should wait for explicit ownership assignment or verified BE-07 policy/domain-rule need.
```
