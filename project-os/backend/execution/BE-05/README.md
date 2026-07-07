# BE-05 Business Layer

Status: Draft
Scope: Backend Execution Package
Owner: Backend Architecture
Reviewer: Backend Engineering
Approver: Backend Architecture
Estimated Complexity: XL

## Purpose

Establish the backend business layer as the owner of domain orchestration, workflow decisions, and cross-repository use cases after module architecture has been normalized.

BE-05 makes service files intentional business coordinators rather than mixed HTTP, validation, and data-access containers.

## Scope

BE-05 owns business workflow and service orchestration.

This phase may:

- move domain orchestration into service files
- define use-case style service functions
- coordinate multiple repositories from services
- decide transaction boundaries for later BE-08 implementation
- call policy/guard functions that already exist
- call audit service interfaces where available
- document missing policies, validators, transactions, or audit events for later phases

BE-05 must preserve existing API contracts unless a package explicitly authorizes a contract change.

Primary business domains:

1. Organization scope and auth workflows
2. Field session lifecycle
3. Equipment checkout and return
4. Verification and issue lifecycle
5. Service item and consumable usage
6. Job billing, expense, and payout
7. Audit intent integration

## Prerequisites

- BE-04 Architecture Normalization is complete or the target module is normalized.
- Repository access is available through repository layer.
- Controllers call services only.
- Current REST contracts are known.
- Known architecture exceptions are documented.

## Dependencies

Upstream:

- BE-04 Architecture Normalization
- BE-02 Repository Foundation
- BE-03 REST API Layer

Downstream:

- BE-06 Validation
- BE-07 Policy and Domain Rules
- BE-08 Transaction and Consistency
- BE-09 Observability
- BE-10 Production Readiness

## Allowed Files

BE-05 may modify business-layer and orchestration files:

```text
fieldops-be/src/modules/**/*.service.js
fieldops-be/src/modules/**/*.policy.js
fieldops-be/src/modules/**/*.guard.js
fieldops-be/src/modules/**/*.errors.js
fieldops-be/src/modules/**/*.mapper.js
fieldops-be/src/modules/**/*.responseMapper.js
fieldops-be/src/modules/**/*.repository.js
fieldops-be/src/modules/**/index.js
docs/project-os/backend/execution/BE-05/**
```

Repository files may be touched only to expose existing data-access methods needed by service orchestration. Repository files must not receive business decisions.

## Early Development Refactoring Authority

Human Authorization is granted for BE-05 during the early development phase.

Within the active BE-05 responsibility boundary, the Backend Steward may refactor, replace, reorganize, or delete old implementation when it improves Business Layer architecture, removes legacy confusion, or makes service orchestration clearer.

This authority includes:

- refactoring service workflow structure
- moving business logic to the correct service or policy boundary
- deleting dead code, obsolete helpers, or legacy implementation files inside BE-05 ownership
- replacing a weak implementation with a cleaner implementation
- reorganizing allowed files when responsibility becomes clearer
- updating BE-05 execution documentation to match repository reality

Backward compatibility of internal implementation is not required when the existing implementation is clearly legacy, unused, or harmful to the BE-05 architecture.

Current API contracts should still be preserved unless Human Authorization or the active execution package explicitly allows a contract change.

All destructive or broad refactor work must stay inside the active BE-05 ownership boundary and must be recorded in the task execution document and return contract.

This authority does not automatically grant permission to modify files outside BE-05 ownership. Cross-domain files still require Human Authorization or routing to the responsible execution package.

## Forbidden Files

BE-05 must not modify:

```text
fieldops-fe/**
fieldops-be/prisma/schema.prisma
fieldops-be/prisma/migrations/**
fieldops-be/src/app.js
fieldops-be/src/server.js
fieldops-be/src/routes/module.routes.js
.env*
package.json
lock files
```

BE-05 must not introduce request validation as a primary concern. Validation belongs to BE-06 unless minimal defensive domain validation is required inside service.

## Parallel Tasks

Parallel work is allowed by business domain only when repository and service ownership do not overlap.

Suggested parallel groups:

- Issue lifecycle can run independently from Invite lifecycle.
- Equipment checkout/return must coordinate with Field Session lifecycle before merge.
- Job finance work must wait for billing/expense/payout repository readiness.
- Auth and Organization workflows should not be edited in parallel unless ownership is explicitly split.

## Milestones

- BE-05.01 Define service orchestration baseline and service boundaries
- BE-05.02 Normalize Issue business workflow
- BE-05.03 Normalize Invite business workflow
- BE-05.04 Normalize Member and Organization business workflow
- BE-05.05 Normalize Auth session business workflow
- BE-05.06 Normalize Equipment checkout/return workflow
- BE-05.07 Normalize Field Session lifecycle workflow
- BE-05.08 Normalize Verification and Issue lifecycle integration
- BE-05.09 Normalize Job finance workflow boundaries
- BE-05.10 Business layer review and freeze

## Atomic Commits

Atomic commit themes:

- `BE-05.01 Define service orchestration baseline`
- `BE-05.02 Normalize issue business workflow`
- `BE-05.03 Normalize invite business workflow`
- `BE-05.04 Normalize member organization workflow`
- `BE-05.05 Normalize auth session workflow`
- `BE-05.06 Normalize equipment checkout return workflow`
- `BE-05.07 Normalize field session lifecycle workflow`
- `BE-05.08 Normalize verification issue integration`
- `BE-05.09 Normalize job finance workflow boundaries`
- `BE-05.10 Freeze business layer`

## Definition of Done

BE-05 is complete when:

- services own business orchestration and do not contain HTTP logic
- controllers remain HTTP-only
- repositories remain data-access only
- business workflows are represented as clear service methods
- cross-repository coordination is centralized in service layer
- transaction needs are documented for BE-08
- policy gaps are documented for BE-07
- validation gaps are documented for BE-06
- audit intent gaps are documented for BE-09

## Review Checklist

Reviewers must confirm:

- no service imports Express request/response objects
- no service returns raw HTTP response shape unless intentionally mapped
- service methods have clear use-case names
- business logic is not hidden in repository methods
- transaction decisions are documented even if not yet implemented
- no API contract is changed silently
- changed files stay within Allowed Files

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

BE-05 may be frozen when:

- service orchestration is clear for all target domains
- deferred policy/validation/transaction/audit items are recorded
- BE-06 can implement validation without re-deciding business workflow shape
- BE-07 can implement policy without rediscovering domain rule ownership

## Next Phase

BE-06 Validation
