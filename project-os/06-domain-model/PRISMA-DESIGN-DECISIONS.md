# PRISMA-DESIGN-DECISIONS.md

Status: Active  
Owner: Data Architect  
Project: `laundryphutubberk/laundry`

## Purpose

This document records important Prisma design decisions that affect Backend execution.

It is not a replacement for ADR. If a decision changes architecture, workspace boundary, API contract, or business flow, create an ADR as well.

## Decision Categories

```text
Model ownership
Aggregate root
Relation cardinality
Unique constraints
Indexes
Delete behavior
Enums
Derived summaries
Internal ledgers/logs
Migration baseline
```

## Current Decision Log

| ID | Decision | Status | Reason | ADR Required |
|---|---|---|---|---|
| PDD-001 | LaundryWork is operational aggregate root | Accepted | Matches Business Blueprint and ADR-0001 | No |
| PDD-002 | Inventory summary is derived from movement history | Accepted | Prevents duplicate inventory truth | No |
| PDD-003 | Resort workspace isolation uses resortId | Accepted | Required workspace boundary | No |

## Template

```text
ID:
Decision:
Status:
Context:
Reason:
Consequences:
Affected Models:
ADR Required:
Owner:
Date:
```

## Maintenance Rule

Add a decision whenever schema design requires an explicit choice that Backend must understand.
