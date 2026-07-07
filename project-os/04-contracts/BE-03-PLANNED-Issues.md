# BE-03.03 Planned Contract - Issues

Status: PLANNED
Runtime: No Runtime Yet
Implementation: Not Approved
Mode: Documentation Only

## Source Support

Business Blueprint: Yes
schema.prisma: Yes
Runtime: No

## Domain Meaning

Issue Report records explicit laundry work issues such as damaged items, missing items, count mismatch, return mismatch, or other reported problems.

## Source Fields

- id
- workId
- resortId
- itemTypeId optional
- colorGroup optional
- issueType
- quantity
- description
- status
- reportedAt
- resolvedAt

## Contract Status

This is a planned contract record only.

No runtime endpoint is approved by this file.

## Deferred

Runtime work is deferred until a later approved backend milestone.

Workspace policy and authorization are deferred to BE-07.
