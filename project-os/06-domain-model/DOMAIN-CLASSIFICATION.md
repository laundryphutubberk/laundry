# DOMAIN-CLASSIFICATION.md

Status: Active  
Owner: Data Architect / Backend Architect  
Project: `laundryphutubberk/laundry`

## Purpose

This file classifies every Prisma model before Backend execution.

Classification determines whether a model needs public API, repository, service, business layer, validation, policy, and transaction handling.

## Classification Legend

| Type | Meaning |
|---|---|
| Aggregate Root | Main workflow owner |
| Entity | Child or domain object |
| Internal Log | History/audit/internal record |
| Derived Summary | Calculated or projected state |
| Lookup / Master Data | Reference data |
| Policy Object | Permission/workspace control object |
| Infrastructure | Technical support model |

## Laundry Classification Matrix

| Prisma Model | Classification | Public API | Repository | Service | Business | Policy | Transaction | Notes |
|---|---|---:|---:|---:|---:|---:|---:|---|
| User | Policy Object / Actor | Yes | Yes | Yes | Limited | Yes | Optional | Required before production auth |
| Resort | Aggregate / Workspace Owner | Yes | Yes | Yes | Yes | Yes | Optional | Owns resort workspace boundary |
| LaundryItemType | Lookup / Master Data | Limited | Yes | Limited | No | Optional | No | Reference data |
| LaundryWork | Aggregate Root | Yes | Yes | Yes | Yes | Yes | Yes | Operational center |
| LaundryBag | Entity | Yes | Yes | Yes | Yes | Yes | Yes | Intake unit under LaundryWork |
| LaundryCountLine | Entity | Yes | Yes | Yes | Yes | Yes | Yes | Real counted linen quantity |
| LinenMovement | Internal Log / Ledger | Limited | Yes | Yes | Yes | Yes | Yes | Workflow-generated, no generic CRUD |
| LinenInventorySummary | Derived Summary | Read-only | Yes | Yes | Limited | Yes | Yes | Derived from movement history |
| IssueReport | Entity | Yes | Yes | Yes | Yes | Yes | Yes | Issue/mismatch tracking |
| WorkStatusLog | Internal Log | No | Yes | No | No | No | Via owner | Created by workflows |
| LaundryMachine | Entity / Resource | Yes | Yes | Yes | Yes | Optional | Optional | Operational machine resource |
| LaundryMachineLoadRule | Lookup / Rule | Limited | Yes | Yes | Yes | Optional | Optional | Planning rule |
| WashLoadPlan | Aggregate / Planning | Yes | Yes | Yes | Yes | Yes | Yes | Machine planning capability |

## Rule

Do not expose a model as public API unless Public API is `Yes` or explicitly approved.

Do not create generic CRUD for Internal Log or Derived Summary models.

## Maintenance Rule

Update this file whenever schema.prisma changes or a model runtime role changes.
