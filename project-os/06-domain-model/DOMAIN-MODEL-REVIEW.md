# DOMAIN-MODEL-REVIEW.md

Status: Active  
Owner: Data Architect  
Project: `laundryphutubberk/laundry`

## Purpose

This document records the review result of `schema.prisma` before Backend execution.

It verifies that the data model matches the Business Blueprint and is safe to hand off to Backend execution.

## Review Checklist

| Check | Status | Notes |
|---|---|---|
| Business workflows represented | ⏳ | |
| Workspace boundary represented | ⏳ | |
| Aggregate roots identified | ⏳ | |
| Child entities identified | ⏳ | |
| Logs/history models identified | ⏳ | |
| Derived summary models identified | ⏳ | |
| Lookup/master data identified | ⏳ | |
| Relations reviewed | ⏳ | |
| Required unique constraints reviewed | ⏳ | |
| Indexes reviewed | ⏳ | |
| Delete/cascade behavior reviewed | ⏳ | |
| Migration risk reviewed | ⏳ | |
| Backend handoff ready | ⏳ | |

## Required Review Questions

```text
1. What is the operational aggregate root?
2. Which models are public runtime resources?
3. Which models are internal only?
4. Which models are derived/read-only?
5. Which models are workflow-generated?
6. Which fields enforce workspace isolation?
7. Which operations require transactions?
8. Which models must never expose generic CRUD?
9. Which constraints should be database constraints?
10. Which rules should remain in Business Layer?
```

## Review Result

```text
Status: PENDING_REVIEW
```

## Maintenance Rule

Update this file whenever `schema.prisma` changes or a domain model decision is revised.
