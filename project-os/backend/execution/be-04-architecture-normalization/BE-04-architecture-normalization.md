# BE-04 Architecture Normalization Execution Package

Status: Standard
Scope: Backend Module Architecture Normalization
Owner: Backend Architecture
Estimated Complexity: XL

## Purpose

Apply BE-OS architecture to real backend modules without adding new features.

## Scope

Module normalization into controller, validator, response mapper, service, policy, domain errors, repository, repository mapper, constants, and index boundary.

## Prerequisites

BE-01, BE-02, and BE-03 verified for target scope. BE-OS Foundation sealed.

## Dependencies

Depends on BE-01 to BE-03. Enables BE-05 to BE-10.

## Allowed Files

- target module folder only
- shared core files only when explicitly approved
- module-specific docs when needed

## Forbidden Files

- unrelated modules
- frontend files
- database schema changes unless a separate approved package owns it
- feature expansion beyond normalization

## Parallel Tasks

These module tracks can run in parallel when each task owns only its module files:

- BE-04.01 Issue
- BE-04.02 Invite
- BE-04.03 Member
- BE-04.04 Organization
- BE-04.05 Equipment
- BE-04.06 Auth
- BE-04.07 Field Session

## Milestones

Each module should normalize:

- Repository
- Service
- Controller
- Validator
- Policy
- Errors
- Mappers
- Module Index
- Compliance Review
- Freeze

## Atomic Commits

One commit per module responsibility. Do not normalize multiple modules in one commit.

## Definition of Done

```text
□ module follows Clean Backend Layer
□ query shape is in repository
□ service owns orchestration only
□ controller uses shared response contract
□ validator owns input normalization
□ policy owns domain rules when present
□ domain errors replace generic errors
□ mapper boundaries are explicit
□ module index exports stable boundaries
```

## Merge Contract

Return commit list, files changed, compliance checklist, verification result, review result, known exceptions, and ready-for-merge status.

## Freeze Criteria

Freeze module after compliance checklist passes and no blocking exceptions remain.

## Next Phase

BE-05 Business Layer.
