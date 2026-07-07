# BE-07 Policy and Domain Rules Execution Package

Status: Standard
Scope: Backend Policy and Domain Rules
Owner: Backend Architecture
Estimated Complexity: L

## Purpose

Extract reusable domain decisions into policy boundaries and stable domain errors.

BE-07 exists to make business decisions explicit, reusable, testable, and safe while keeping controllers thin, repositories data-focused, and shared foundation free from domain-specific meaning.

## Scope

BE-07 owns:

- policy files inside target backend modules
- domain rule naming
- policy usage in services
- domain error alignment for policy decisions
- policy inventory and evidence documents
- policy review and final return-contract documentation

## Prerequisites

Target module should have service and error boundaries from BE-04 or approved equivalent.

When a target module is incomplete but is explicitly assigned to BE-07, BE-07 may refactor or replace old files inside the assigned policy/domain-rule boundary.

## Dependencies

Depends on BE-04 and supports BE-05 and BE-08.

BE-07 must not take ownership of BE-01 through BE-06 or BE-08 work unless a change is required to express, call, or protect a BE-07 policy/domain rule.

## Allowed Files

- target module policy files
- target module service files for policy calls
- target module error files
- policy tests
- service tests for policy decisions and domain errors
- BE-07 policy docs

## Forbidden Files

- repository query behavior unless policy requires repository read through service-owned workflow
- controller business decisions
- unrelated modules
- frontend files
- Prisma schema truth unless explicitly assigned outside BE-07

## Development Authority

BE-07 is in early development.

Within the active BE-07 responsibility boundary, the steward may:

- edit existing files
- delete obsolete files
- move, split, merge, or rename files
- refactor policy and service policy-call structure
- replace earlier BE-07 documentation when the newer source of truth is clearer

This authority is limited to BE-07 policy/domain-rule responsibility.

Changes that touch another execution package require a clear BE-07 policy/domain-rule reason or explicit assignment.

## Development Workflow

BE-07 uses continuous development for the assigned scope.

During development:

- do not stop for backend tests after each small segment
- do not perform small/intermediate return-contract review gates
- continue BE-07 implementation until the assigned BE-07 scope is complete
- keep README, inventory, and return-contract draft aligned as progress evidence

At final BE-07 completion:

- run backend tests once for the full assigned BE-07 work
- review the final BE-07 return contract once
- return final verification, review result, known exceptions, and ready-for-merge status

## Parallel Tasks

Can run per module or per domain rule group when ownership is separate.

Do not expand into a new module or domain rule group until ownership is explicitly assigned.

## Milestones

- BE-07.01 Policy Inventory
- BE-07.02 Domain Rule Extraction
- BE-07.03 Policy Naming Alignment
- BE-07.04 Domain Error Alignment
- BE-07.05 Policy Freeze

Milestones may contain multiple related commits when the planned execution order is clear.

## Commit Strategy

Use as many commits as needed to preserve meaningful progress and safe rollback points.

A commit may cover one policy responsibility or a related group of policy/domain-rule changes when they belong to the same planned milestone.

## Definition of Done

```text
□ domain rules are explicit
□ repeated service condition chains are extracted
□ policy does not access database directly
□ service calls policy for business decisions
□ domain errors are stable and safe
□ policy tests or service policy tests cover the rule where practical
□ BE-07 README, inventory, and return-contract draft are aligned
```

## Merge Contract

Final return contract must include:

- commit list
- files changed
- policy checklist
- verification result
- review result
- known exceptions
- ready-for-merge status

During development, the return contract may remain a draft and should be updated as accumulated evidence.

## Freeze Criteria

Freeze when policy checklist passes for the assigned target scope and the final backend test/review gate has completed.

Intermediate segments may be marked as completed progress, but final BE-07 freeze happens only at the end of the full assigned BE-07 work.

## Next Phase

BE-08 Transaction and Consistency.
