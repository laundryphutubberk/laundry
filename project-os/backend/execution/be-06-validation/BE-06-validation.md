# BE-06 Validation Execution Package

Status: Standard
Scope: Backend Validation Layer
Owner: Backend Architecture
Estimated Complexity: M

## Purpose

Standardize request input validation and DTO normalization across backend modules.

## Scope

Validator files, DTO rules, validation error mapping, controller validation calls, and service input cleanup.

## Prerequisites

Target API/controller scope should be known. BE-03 and BE-04 should be complete or approved for target module.

## Dependencies

Depends on BE-03 API and BE-04 module normalization. Supports BE-05 and BE-07.

## Allowed Files

- target module validator files
- target module controller files only for validator wiring
- target module errors when validation uses stable errors
- validation docs

## Forbidden Files

- repository query behavior
- unrelated module files
- frontend files
- business workflow redesign outside validation scope

## Parallel Tasks

Can run per module or per endpoint group when file ownership is separate.

## Milestones

- BE-06.01 Validation Inventory
- BE-06.02 DTO Normalization
- BE-06.03 Validator Extraction
- BE-06.04 Validation Error Alignment
- BE-06.05 Validation Freeze

## Atomic Commits

One commit per validator or endpoint validation responsibility.

## Definition of Done

```text
□ body/query/params are validated where needed
□ service receives normalized DTOs
□ controller does not contain long validation chains
□ validation errors map to stable error contract
□ validator does not access database
```

## Merge Contract

Return commit list, files changed, validation checklist, verification result, review result, known exceptions, and ready-for-merge status.

## Freeze Criteria

Freeze when validation checklist passes for target scope.

## Next Phase

BE-07 Policy and Domain Rules.
