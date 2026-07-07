# BE-08 Transaction and Consistency

Status: Draft
Scope: Backend Execution Package
Owner: Backend Architecture / BE-08 Transaction and Consistency Owner
Reviewer: Backend Engineering
Approver: Backend Architecture
Estimated Complexity: L

## Purpose

BE-08 defines the backend transaction and consistency execution package.

Its purpose is to make mutation behavior safe, atomic where required, organization-scoped, auditable, and predictable across services that change persistent state.

BE-08 does not introduce business behavior by itself. It standardizes how backend services execute state-changing work without losing consistency.

## Scope

BE-08 owns backend execution rules for:

```text
transaction boundaries
unit-of-work conventions
multi-write mutation consistency
rollback behavior
idempotency expectations
retry safety
concurrency conflict handling
cross-service consistency handoff
transaction verification evidence
```

BE-08 applies especially to service methods that:

```text
create, update, or delete persistent records
write to more than one table
combine domain mutation with audit/outbox side effects
perform inventory, billing, payout, assignment, approval, closure, or lifecycle transition work
need organization-scoped consistency guarantees
```

## Development Authority During Early Development

During the Early Development phase, the BE-08 Transaction and Consistency Owner is authorized to refactor repository files that are inside the BE-08 responsibility boundary.

Within BE-08 ownership, the owner may:

```text
modify existing files
refactor existing implementations
replace obsolete implementations
move files or directories
rename files
remove obsolete or redundant files
rebuild modules when a cleaner architecture is required
```

This authority applies only to work that is necessary for BE-08 transaction and consistency outcomes.

All changes must:

```text
follow Repository Reality
stay inside the BE-08 ownership boundary
preserve route / controller / service responsibility where applicable
keep business decisions in services or domain modules
be committed as reviewable atomic commits
include implementation evidence, verification evidence, or documented deferral
update related documentation when repository structure or ownership changes
```

The BE-08 owner should prefer replacement over preserving obsolete implementations when replacement improves consistency, maintainability, or architecture quality.

Changes outside the BE-08 ownership boundary require explicit assignment, handoff, or approval.

## Prerequisites

Before BE-08 implementation starts, these inputs must be available or explicitly deferred:

```text
BE-01 Runtime Foundation standards
BE-02 Repository Foundation standards
BE-03 REST API Layer contracts
BE-04 Architecture Normalization rules
BE-05 Business Layer ownership rules
BE-06 Validation rules
BE-07 Policy and Domain Rules
current Prisma schema truth
service boundary map
organization scope contract
error contract
verification strategy
```

## Dependencies

Upstream dependencies:

```text
Prisma schema intent
repository/client access pattern
service ownership boundaries
validation-before-mutation discipline
organization scope enforcement
policy/domain rule outcomes
```

Downstream dependencies:

```text
BE-09 Observability
BE-10 Production Readiness
frontend-visible consistency/error behavior
QA transaction and rollback test coverage
future audit/outbox reliability work
```

## Allowed Files

BE-08 may modify these file groups only when the milestone explicitly requires it:

```text
fieldops-be/src/core/transaction/**
fieldops-be/src/core/consistency/**
fieldops-be/src/core/idempotency/**
fieldops-be/src/core/errors/**
fieldops-be/src/core/audit/**
fieldops-be/src/modules/**/service*.js
fieldops-be/src/modules/**/repository*.js
fieldops-be/src/modules/**/transaction*.js
fieldops-be/src/modules/**/consistency*.js
fieldops-be/src/modules/**/outbox*.js
fieldops-be/tests/**
fieldops-be/docs/**
docs/project-os/backend/execution/BE-08/**
docs/project-os/repository-map/**
```

Allowed source changes must preserve route/controller/service boundaries and must not bypass service ownership.

## Forbidden Files

BE-08 must not modify these files unless a separate owner handoff or human approval exists:

```text
fieldops-be/prisma/schema.prisma
fieldops-fe/**
infra/**
.env* files
unrelated module routes/controllers
unrelated execution packages BE-01 through BE-07 and BE-09 through BE-10
```

BE-08 must not redefine persistent truth, frontend experience truth, deployment policy, or unrelated business rules.

## Parallel Tasks

The following BE-08 work can run in parallel if mutable ownership does not overlap:

```text
BE-08.01 Transaction inventory and risk map
BE-08.02 Transaction boundary standard
BE-08.03 Unit-of-work helper design
BE-08.04 Idempotency policy draft
BE-08.05 Concurrency and conflict rule draft
BE-08.06 Rollback and side-effect consistency audit
BE-08.07 Transaction test strategy
BE-08.08 Documentation and handoff package
```

Parallel work is blocked when two tasks need the same service file, repository file, or transaction helper contract.

## Milestones

### BE-08.01 Transaction Inventory and Risk Map

Identify all service operations that mutate persistent state or coordinate multiple writes.

Output:

```text
transaction candidate list
risk classification
organization scope requirement
validation prerequisite
side-effect/outbox/audit involvement
```

### BE-08.02 Transaction Boundary Standard

Define when a service must use an explicit transaction and where that transaction boundary belongs.

Output:

```text
transaction boundary rule
controller/service/repository responsibility rule
nested transaction rule
deferred behavior rule
```

### BE-08.03 Unit-of-Work Foundation

Design or verify a shared unit-of-work convention without hiding business behavior in shared foundation.

Output:

```text
unit-of-work contract
Prisma client handoff convention
service usage examples
test or documented verification
```

### BE-08.04 Idempotency and Retry Safety

Define which operations need idempotency and how retry-safe behavior is detected.

Output:

```text
idempotency requirement map
retry-safe mutation rule
conflict response contract
known deferrals
```

### BE-08.05 Concurrency and Conflict Handling

Define expected behavior for competing writes and stale state transitions.

Output:

```text
conflict detection rule
optimistic/pessimistic strategy decision where applicable
error contract
verification cases
```

### BE-08.06 Rollback and Side-Effect Consistency

Audit state-changing operations with audit/outbox/notification/payment-like side effects.

Output:

```text
rollback expectation
side-effect consistency rule
outbox/audit sequencing rule
deferral list
```

### BE-08.07 Transaction Verification

Add or document verification for transaction success, rollback, conflict, and idempotency behavior.

Output:

```text
test coverage or documented deferral
manual verification notes
known gaps
```

### BE-08.08 Freeze and Handoff

Freeze BE-08 standards after review and provide successor handoff.

Output:

```text
completion report
files changed
verification result
known exceptions
ready-for-merge result
```

## Atomic Commits

Recommended atomic commits:

```text
BE-08.01 map transaction candidates
BE-08.02 document transaction boundary standard
BE-08.03 add unit-of-work foundation
BE-08.04 document idempotency and retry rules
BE-08.05 add conflict handling standard
BE-08.06 audit rollback side-effect consistency
BE-08.07 add transaction verification coverage
BE-08.08 freeze BE-08 package
```

Each commit must remain reviewable on its own and must not mix unrelated module behavior.

## Definition of Done

BE-08 is done when:

```text
transaction boundaries are explicit
multi-write mutations have a consistency rule
organization scope is preserved inside transaction work
validation remains before mutation
rollback behavior is documented or tested
idempotency/retry expectations are known
conflict behavior is intentional
source changes have verification evidence or documented deferral
repository reality is updated when structure changes
handoff report is complete
```

## Review Checklist

Review must confirm:

```text
business logic remains in services or domain modules
controllers only orchestrate request/response
shared transaction helpers are domain-neutral
Prisma schema truth is not redefined
organization scope is not bypassed
validation happens before mutation
errors and conflict responses follow backend contracts
side effects do not escape rollback expectations silently
parallel ownership did not collide with another package
```

## Task Return Contract

Every BE-08 task must return a structured handoff result so Project OS, reviewers, and downstream owners can decide whether the work is complete, blocked, or requires another owner.

Minimum task return payload:

```text
Task
Scope
Repository
Branch
Commit List
Files Changed
Runtime Files Affected
Documentation Files Affected
Transaction Boundary Result
Consistency Result
Rollback Result
Idempotency Result
Conflict Handling Result
Organization Scope Result
Tests Executed
Test Result
Verification Evidence
Known Exceptions
Blockers
New Issues Created
External Owner Handoff
Review Result
Ready State
```

BE-08-specific result fields must use these values unless the task documents a justified exception:

```text
Transaction Boundary Result: ADDED | MODIFIED | VERIFIED_EXISTING | NOT_REQUIRED | DEFERRED | BLOCKED
Consistency Result: VERIFIED | PASS_WITH_NOTES | DEFERRED | BLOCKED | FAILED
Rollback Result: VERIFIED | NOT_REQUIRED | DEFERRED | BLOCKED | FAILED
Idempotency Result: VERIFIED | NOT_REQUIRED | REQUIRED_DEFERRED | BLOCKED_BY_SCHEMA | BLOCKED_BY_PRODUCT_CONTRACT
Conflict Handling Result: VERIFIED | NOT_REQUIRED | REVIEW_REQUIRED | DEFERRED | BLOCKED
Organization Scope Result: VERIFIED | NOT_APPLICABLE | DEFERRED | BLOCKED | FAILED
Test Result: PASS | PASS_WITH_NOTES | NOT_RUN | FAILED | BLOCKED
Review Result: READY_FOR_REVIEW | WAITING_REVIEW | APPROVED | APPROVED_WITH_NOTES | CHANGES_REQUESTED
Ready State: READY_FOR_REVIEW | READY_FOR_MERGE | RUNTIME_VERIFIED_LOCAL_PASS | WAITING_IMPLEMENTATION | WAITING_EXTERNAL_OWNER | BLOCKED | FAILED
```

If a BE-08 task discovers an error outside transaction and consistency ownership, it must route the issue by owner instead of silently expanding BE-08 scope:

```text
BE-03: route, controller, HTTP status, API response shape
BE-06: request validation and payload contract
BE-07: policy, domain rules, duplicate behavior, status transition decision
BE-09: logging, tracing, observability, audit visibility
BE-10: production readiness, deployment, runtime configuration
Platform / Tooling: connector, CI, test runner, environment, package/module warnings
```

Task return example:

```text
Task: Equipment category auto-create transaction boundary
Scope: BE-08 Transaction and Consistency
Repository: opsreadyapp-star/fieldops
Branch: test/step-e10-ci-flow
Commit List: <commits>
Files Changed: fieldops-be/src/modules/equipment/equipment.service.test.js
Runtime Files Affected: equipment service transaction path
Documentation Files Affected: BE-08.08, BE-08.11
Transaction Boundary Result: VERIFIED
Consistency Result: VERIFIED
Rollback Result: VERIFIED
Idempotency Result: REQUIRED_DEFERRED
Conflict Handling Result: REVIEW_REQUIRED
Organization Scope Result: VERIFIED
Tests Executed: npm run test:run
Test Result: PASS
Verification Evidence: 22 test files passed, 101 tests passed
Known Exceptions: MODULE_TYPELESS_PACKAGE_JSON warning routed to Platform / Tooling
Blockers: none
New Issues Created: #135
External Owner Handoff: Platform / Tooling if module warning cleanup is required
Review Result: READY_FOR_REVIEW
Ready State: RUNTIME_VERIFIED_LOCAL_PASS
```

## Merge Contract

Every task must return:

```text
Commit List
Files Changed
Verification Result
Review Result
Known Exceptions
Ready For Merge
```

## Freeze Criteria

BE-08 may be frozen when:

```text
all BE-08 milestones are complete or explicitly deferred
all transaction helper contracts are reviewed
all touched services have verification evidence or documented deferral
known consistency risks are recorded
handoff is complete
review result is APPROVED or APPROVED_WITH_NOTES
```

## Next Phase

After BE-08 freeze, continue to:

```text
BE-09 Observability
```
