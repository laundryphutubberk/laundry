# BACKEND-HANDOFF.md

Status: Active  
Owner: Data Architect / Backend Architect  
Project: `laundryphutubberk/laundry`

## Purpose

This document is the handoff package from Domain Model Design to Backend Execution.

Backend should read this before BE-01.

## Handoff Checklist

| Item | Status | Notes |
|---|---|---|
| Business Blueprint reviewed | ✅ | |
| schema.prisma exists | ✅ | |
| Domain Model Review exists | ✅ | |
| Prisma Design Decisions exists | ✅ | |
| Domain Classification exists | ✅ | |
| Migration Strategy exists | ✅ | |
| Backend Structure Blueprint exists | ✅ | |
| Capability Matrix exists | ✅ | |

## Backend Must Know

```text
LaundryWork is the operational aggregate root
LaundryBag is the intake unit
LaundryCountLine is counted linen quantity
LinenMovement is workflow-generated movement history
LinenInventorySummary is derived from movement history
IssueReport records damaged/lost/mismatch issues
WorkStatusLog is internal workflow history
resortId protects Resort Workspace isolation
```

## Backend Execution Start Condition

Backend execution may start when:

```text
Domain model is reviewed
Every Prisma model is classified
Migration strategy is known
Backend capability expectations are mapped
Open questions are documented
```

## Open Questions

```text
None recorded in this template yet.
```

## Maintenance Rule

Update this handoff whenever domain model, classification, migration strategy, or backend structure expectations change.
