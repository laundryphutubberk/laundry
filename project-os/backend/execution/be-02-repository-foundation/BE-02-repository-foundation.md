# BE-02 Repository Foundation Execution Package

Status: Standard
Scope: Backend Repository Foundation
Owner: Backend Architecture
Estimated Complexity: L

## Purpose

Establish repository execution patterns that isolate persistence from service and controller layers.

## Scope

Repository templates, query ownership, scoped data access, transaction-compatible clients, repository mapper usage, review checklist.

## Prerequisites

BE-01 Runtime Foundation complete or verified. Repository standards approved.

## Dependencies

Depends on BE-01. Enables BE-03 API and BE-04 module normalization.

## Allowed Files

- `fieldops-be/src/modules/**/**.repository.js`
- `fieldops-be/src/modules/**/**.repository.mapper.js`
- repository-related docs and package files

## Forbidden Files

- controller response behavior except to remove direct data access
- unrelated frontend files
- unrelated module business behavior

## Parallel Tasks

Repository work can be split per module when modules do not share the same repository files.

## Milestones

- BE-02.01 Repository Template
- BE-02.02 Query Ownership
- BE-02.03 Organization Scope
- BE-02.04 Transaction Client Support
- BE-02.05 Repository Mapper Alignment
- BE-02.06 Repository Review

## Atomic Commits

One commit per repository boundary or module repository responsibility.

## Definition of Done

```text
□ service does not own query shape
□ controller does not call repository directly
□ repository owns data access
□ organization-scoped data requires scope context
□ transaction-compatible client is supported where needed
□ mapper boundary is used when persistence shape differs from domain shape
```

## Merge Contract

Return commit list, files changed, verification result, review result, known exceptions, and ready-for-merge status.

## Freeze Criteria

Freeze when repository checklist passes for targeted scope.

## Next Phase

BE-03 REST API Layer.
