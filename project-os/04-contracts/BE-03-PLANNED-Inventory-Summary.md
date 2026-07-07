# BE-03.03 Planned Contract - Inventory Summary

Status: PLANNED
Runtime: No Runtime Yet
Implementation: Not Approved
Mode: Documentation Only

## Source Support

Business Blueprint: Yes
schema.prisma: Yes
Runtime: No

## Domain Meaning

Inventory Summary records calculated linen quantity visibility for each resort, item type, and color group.

It should be derived from work and movement history.

## Source Fields

- id
- resortId
- itemTypeId
- colorGroup
- totalKnownQty
- atResortQty
- atLaundryQty
- issueQty
- returnedQty
- calculatedAt
- updatedAt

## Contract Status

This is a planned contract record only.

No runtime endpoint is approved by this file.

## Deferred

Runtime work is deferred until a later approved backend milestone.

Workspace policy and authorization are deferred to BE-07.
