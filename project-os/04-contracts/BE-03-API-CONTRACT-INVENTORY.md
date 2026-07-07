# BE-03.03 API Contract Inventory

Status: ACTIVE
Mode: Documentation Only
Owner: Backend Architecture
Project: laundryphutubberk/laundry

## Purpose

This document inventories REST API contracts for BE-03 without creating runtime behavior.

It separates contracts into:

- Existing Contract: runtime exists and contract exists.
- Planned Contract: Business Blueprint and schema support the domain, but runtime does not exist yet.
- Future Contract: not created unless Business Blueprint and Domain Model support it.

## Rules

- Do not create runtime routes from this inventory.
- Do not change route behavior.
- Do not change controllers.
- Do not change schema.prisma.
- Do not touch frontend.
- Planned contracts must clearly say No Runtime Yet.
- Do not design APIs for domains not supported by Business Blueprint or Domain Model.

## Existing Contracts

| Domain | Contract | Runtime | Status |
|---|---|---|---|
| Health | Route inventory only | Yes | Existing |
| Laundry Work | BE-03-Laundry-Works-API.md | Yes | Existing |
| Laundry Bag | BE-03-Laundry-Bags-API.md | Yes | Existing |

## Planned Contracts

| Domain | Contract | Runtime | Status |
|---|---|---|---|
| Laundry Count Line | BE-03-PLANNED-Laundry-Count-Lines.md | No | Planned - No Runtime Yet |
| Issue Report | BE-03-PLANNED-Issues.md | No | Planned - No Runtime Yet |
| Linen Movement | BE-03-PLANNED-Linen-Movements.md | No | Planned - No Runtime Yet |
| Linen Inventory Summary | BE-03-PLANNED-Inventory-Summary.md | No | Planned - No Runtime Yet |

## Future Contracts

No future contracts are created in BE-03.03.

Any domain not supported by both Business Blueprint and schema.prisma must remain undocumented as an API contract until the source of truth changes.

## Deferred to Other BE Phases

| Topic | Target Phase | Reason |
|---|---|---|
| Controller split | BE-04 | Architecture normalization |
| API version strategy | BE-04 or ADR | API contract and architecture impact |
| Auth middleware | BE-07 | Policy and permission impact |
| Authorization boundary | BE-07 | Workspace boundary impact |
| Error code standard | BE-06 or BE-09 | Validation and observability impact |
| Runtime route implementation | Later approved BE milestone | Must follow contract and implementation approval |

## Freeze Recommendation

BE-03 Documentation and Contract can be frozen when:

- Existing runtime-backed contracts are listed.
- Planned domain contracts are marked No Runtime Yet.
- API Coverage Matrix exists.
- Gaps are assigned to later BE phases.
- No contract is created for unsupported domains.
