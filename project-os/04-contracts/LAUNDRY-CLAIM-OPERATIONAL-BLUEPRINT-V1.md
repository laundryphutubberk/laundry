# Laundry Claim Operational Capability V1 Blueprint

Status: LOCKED
Owner: Project Owner / Chief Architect
Scope: Business and architecture source of truth for Laundry Claim V1

## Purpose

Freeze the approved business and architectural decisions for Laundry Claim Operational Capability V1 before implementation continues.

After this lock, executors implement the capability. They do not redesign it without Blueprint revision and new approval.

## Business Goal

Transform an operational Laundry Issue into a managed Claim lifecycle without affecting inventory, counting, Laundry Work lifecycle, images, or financial processing.

## Business Value

- Track customer claims.
- Prevent duplicate claims.
- Preserve operational history.
- Enable structured review.
- Prepare a future compensation capability without introducing financial behavior in V1.

## Domain Model

```text
Laundry Work
    -> Laundry Issue
        -> Laundry Claim (0..1)
```

- Issue represents an operational finding.
- Claim represents business follow-up.
- Resolving an Issue does not automatically resolve a Claim.
- Claim progression must never modify Issue history.
- One Issue may have at most one Claim.

## Lifecycle

```text
OPEN -> IN_REVIEW -> APPROVED -> RESOLVED
OPEN -> REJECTED
IN_REVIEW -> REJECTED
```

Terminal states:

- `REJECTED`
- `RESOLVED`

Only explicit business commands may change Claim state. No generic status update endpoint is allowed.

## Eligibility

Claim creation requires:

- An existing Laundry Issue.
- An authorized workspace.
- Issue status is not `CANCELLED`.
- The Issue has not already been claimed.

An eligible Issue may be `OPEN` or `RESOLVED`.

## Laundry Work Policy

| Work state | Read | Create | Progress |
|---|:---:|:---:|:---:|
| Active/non-terminal | Allowed | Allowed | Allowed |
| `CLOSED` | Allowed | Allowed | Allowed |
| `CANCELLED` | Allowed | Rejected | Rejected |

`CANCELLED` Work is read-only for Claim behavior.

## Data Model Boundary

Include:

- Issue reference.
- Claim reason.
- Claim status.
- Created information.
- Review information.
- Resolution information.

Exclude from V1:

- Compensation.
- Money.
- Invoices.
- Assignment.
- Notification.
- Image attachment.
- Approval chain.
- SLA.

## API Contract

```text
GET  /api/laundry/works/:workId/claims
GET  /api/laundry/claims/:claimId
POST /api/laundry/issues/:issueId/claim
POST /api/laundry/claims/:claimId/start-review
POST /api/laundry/claims/:claimId/approve
POST /api/laundry/claims/:claimId/reject
POST /api/laundry/claims/:claimId/resolve
```

The contract is command-oriented. No generic Claim status endpoint is permitted.

## UI Blueprint

```text
Laundry Work Detail
    -> Issue Card
        -> Claim Panel
```

Issue without Claim:

```text
Create Claim
```

Issue with Claim:

```text
View Claim
```

### Action Matrix

| Claim state | Actions |
|---|---|
| `OPEN` | Start Review, Reject |
| `IN_REVIEW` | Approve, Reject |
| `APPROVED` | Resolve |
| `REJECTED` | Read only |
| `RESOLVED` | Read only |

## UX Rules

- No optimistic close or terminal-state assumption.
- Refresh from server after every mutation.
- Pending state prevents duplicate submission.
- Terminal Claims expose no mutation actions.
- `CLOSED` Work follows the Claim policy and remains actionable.
- `CANCELLED` Work remains read-only.

## Integrity Rules

Claim behavior must never modify:

- Issue status.
- Issue quantity.
- Count Line.
- Inventory.
- Movement.
- Laundry Work lifecycle.
- Images.

## Human Reality Gate

Required browser verification before capability acceptance:

- Create Claim.
- Start Review.
- Approve.
- Reject from `OPEN`.
- Reject from `IN_REVIEW`.
- Resolve.
- Duplicate prevention.
- `CLOSED` Work behavior.
- `CANCELLED` Work behavior.

## Out of Scope

- Financial settlement.
- Compensation.
- Invoice.
- Payment.
- Notification.
- External communication.
- Analytics.

## Blueprint Lock

This document contains business and architecture truth only.

It does not record implementation status, verification status, or execution progress.

Laundry Claim Operational Capability V1 is `LOCKED`. Any change to business meaning, domain ownership, lifecycle, integrity boundary, or API contract requires Blueprint revision and explicit approval.
