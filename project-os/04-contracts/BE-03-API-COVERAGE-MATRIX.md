# BE-03.03 API Coverage Matrix

Status: ACTIVE
Mode: Documentation Only
Owner: Backend Architecture
Project: laundryphutubberk/laundry

## Purpose

This matrix records API coverage by domain without creating runtime behavior.

## Matrix

| Domain | Business | Schema | Runtime | Contract | Notes |
|---|---|---|---|---|---|
| Health | Utility | Utility | Yes | Inventory | Existing runtime utility |
| LaundryWork | Yes | Yes | Yes | Yes | Existing contract |
| LaundryBag | Yes | Yes | Yes | Yes | Existing contract |
| LaundryCountLine | Yes | Yes | No | Planned | No Runtime Yet |
| IssueReport | Yes | Yes | No | Planned | No Runtime Yet |
| LinenMovement | Yes | Yes | No | Planned | No Runtime Yet |
| LinenInventorySummary | Yes | Yes | No | Planned | No Runtime Yet |

## Runtime Gaps

- LaundryCountLine has no runtime route yet.
- IssueReport has no runtime route yet.
- LinenMovement has no runtime route yet.
- LinenInventorySummary has no runtime route yet.

## Policy Gaps

- Auth-derived workspace boundary is deferred to BE-07.
- Authorization redesign is deferred to BE-07.

## Architecture Gaps

- Controller split is not approved in BE-03.03.
- API version strategy is not approved in BE-03.03.

## Freeze Recommendation

BE-03 Documentation and Contract can be frozen after planned contracts are created and reviewed.

Runtime implementation remains on hold until explicitly approved in a later milestone.
