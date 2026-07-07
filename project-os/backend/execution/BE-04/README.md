# BE-04 Architecture Normalization

Status: Draft
Scope: Backend Execution Package
Owner: Backend Architecture
Reviewer: Backend Engineering
Approver: Backend Architecture
Estimated Complexity: L

## Purpose

Normalize backend modules to the BE-OS clean backend layer standard so every module follows one responsibility-based structure before deeper business workflow work continues.

Canonical flow:

```text
Routes
  -> Controller
  -> Service
  -> Repository
  -> Prisma
```

Side-layer ownership:

```text
Controller
  - Validator
  - Response Mapper

Service
  - Policy / Guard
  - Domain Error
  - Transaction decision

Repository
  - Prisma query shape
  - Repository Mapper
```

## Scope

BE-04 owns architecture normalization only. It does not add new product features.

This phase may:

- normalize module folder structure
- add mandatory module `index.js`
- separate controller, service, repository, mapper, validator, policy, guard, and errors files
- move Prisma access out of controller/service into repository
- move response shaping into response mapper
- move Prisma-to-domain shaping into repository mapper
- document exceptions where full normalization must wait for BE-05, BE-06, BE-07, or BE-08

Initial module order:

1. Issue
2. Invite
3. Member
4. Organization
5. Equipment
6. Auth
7. Field Session

## Prerequisites

- BE-OS Execution System README is standard.
- Execution package template is standard.
- BE-01 Runtime Foundation exists.
- BE-02 Repository Foundation exists or has documented repository compatibility.
- BE-03 REST API Layer exists enough for normalization targets.
- Current module behavior must be preserved unless a package explicitly authorizes a behavior change.

## Dependencies

Upstream:

- BE-01 Runtime Foundation
- BE-02 Repository Foundation
- BE-03 REST API Layer
- BE-OS clean backend standards

Downstream:

- BE-05 Business Layer
- BE-06 Validation
- BE-07 Policy and Domain Rules
- BE-08 Transaction and Consistency
- BE-09 Observability

## Allowed Files

BE-04 may modify backend module architecture files only:

```text
fieldops-be/src/modules/**/index.js
fieldops-be/src/modules/**/*.routes.js
fieldops-be/src/modules/**/*.controller.js
fieldops-be/src/modules/**/*.service.js
fieldops-be/src/modules/**/*.repository.js
fieldops-be/src/modules/**/*.mapper.js
fieldops-be/src/modules/**/*.repositoryMapper.js
fieldops-be/src/modules/**/*.responseMapper.js
fieldops-be/src/modules/**/*.validator.js
fieldops-be/src/modules/**/*.validation.js
fieldops-be/src/modules/**/*.policy.js
fieldops-be/src/modules/**/*.guard.js
fieldops-be/src/modules/**/*.errors.js
fieldops-be/src/routes/module.routes.js
```

BE-04 may also update execution tracking documents for its own phase:

```text
docs/project-os/backend/execution/BE-04/**
docs/project-os/backend/execution/README.md
```

## Forbidden Files

BE-04 must not modify unrelated app/domain infrastructure unless explicitly approved:

```text
fieldops-fe/**
fieldops-be/prisma/schema.prisma
fieldops-be/prisma/migrations/**
fieldops-be/src/core/**
fieldops-be/src/app.js
fieldops-be/src/server.js
.env*
package.json
package-lock.json
pnpm-lock.yaml
yarn.lock
```

BE-04 must not introduce new business workflows. If business logic gaps are discovered, document them for BE-05.

## Parallel Tasks

Parallel execution is allowed only when tasks do not share mutable ownership of the same module files.

Safe parallel groups:

- Issue and Invite may run separately if route registry is not touched by both.
- Member and Organization should not run in parallel unless ownership is split explicitly.
- Equipment and Field Session should not run in parallel with BE-05/BE-07 tasks touching the same module.

Ownership rule:

```text
One module normalization task owns all files under that module until returned through the task return contract.
```

## Milestones

- BE-04.01 Normalize Issue module architecture
- BE-04.02 Normalize Invite module architecture
- BE-04.03 Normalize Member module architecture
- BE-04.04 Normalize Organization module architecture
- BE-04.05 Normalize Equipment module architecture
- BE-04.06 Normalize Auth module architecture
- BE-04.07 Normalize Field Session module architecture
- BE-04.08 Architecture normalization review and freeze

## Atomic Commits

Atomic commit themes:

- `BE-04.01 Normalize issue module architecture`
- `BE-04.02 Normalize invite module architecture`
- `BE-04.03 Normalize member module architecture`
- `BE-04.04 Normalize organization module architecture`
- `BE-04.05 Normalize equipment module architecture`
- `BE-04.06 Normalize auth module architecture`
- `BE-04.07 Normalize field session module architecture`
- `BE-04.08 Freeze architecture normalization`

Each atomic commit should prefer one module at a time.

## Definition of Done

BE-04 is complete when:

- target modules follow Routes -> Controller -> Service -> Repository -> Prisma
- controllers contain HTTP-only logic
- services do not import Prisma directly
- repositories are the only module layer importing Prisma
- response mappers own API DTO shape where present
- repository mappers own Prisma-to-domain shape where present
- module `index.js` exists where required
- known exceptions are documented
- no new product features are introduced

## Review Checklist

Reviewers must confirm:

- no controller imports Prisma
- no service imports Prisma directly
- repository methods accept explicit scope such as `organizationId` where applicable
- route middleware remains in the route layer
- business behavior is preserved
- any deferred validation/policy/transaction work is recorded for later phases
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

BE-04 may be frozen when:

- BE-04.01 through BE-04.07 are complete or explicitly deferred
- BE-04.08 review is approved
- all known architecture deviations are recorded
- BE-05 can start without re-deciding module structure

## Next Phase

BE-05 Business Layer
