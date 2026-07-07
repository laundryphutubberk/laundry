# BE-05 Business Layer Execution Package

Status: Standard
Scope: Backend Business Layer
Owner: Backend Architecture
Estimated Complexity: L

## Purpose

Strengthen business workflows after module architecture is normalized.

## Scope

Service use cases, workflow sequencing, domain-safe outputs, audit intent, side-effect placement, and business orchestration review.

## Prerequisites

Target module should pass BE-04 normalization or have an approved exception.

## Dependencies

Depends on BE-04 for target module. Works with BE-07 policy and BE-08 transaction.

## Allowed Files

- target module service files
- target module policy files when directly tied to workflow
- target module errors when workflow needs stable domain errors
- audit integration points when approved

## Forbidden Files

- controller transport behavior unless needed to pass explicit input
- repository query redesign outside workflow needs
- unrelated modules
- frontend files

## Parallel Tasks

Can run per module or per use case when file ownership does not overlap.

## Milestones

- BE-05.01 Use Case Inventory
- BE-05.02 Service Workflow Cleanup
- BE-05.03 Domain Result Review
- BE-05.04 Side Effect Placement
- BE-05.05 Business Layer Freeze

## Atomic Commits

One commit per use case or workflow responsibility.

## Definition of Done

```text
□ service methods express business intent
□ raw request objects do not enter service
□ business workflow order is clear
□ policy is used for reusable rules
□ transaction need is reviewed
□ audit-worthy actions are identified
□ output is domain-safe
```

## Merge Contract

Return commit list, files changed, workflow notes, verification result, review result, known exceptions, and ready-for-merge status.

## Freeze Criteria

Freeze when business workflow checklist passes for target module or use case.

## Next Phase

BE-06 Validation.
