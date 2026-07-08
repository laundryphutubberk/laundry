# BE-05 — Business Capability Gate

Status: IN_PROGRESS
Mode: IMPLEMENTATION GATE

## Purpose

BE-05 defines the business capability boundary for the backend domain layer.

This gate is not complete when a single module is implemented. It is complete only when every model in `schema.prisma` has been classified and every model classified as `Required Business Layer` has either:

1. a business layer implementation, or
2. a reviewed reason explaining why a business layer is not required.

## Gate Definition of Done

BE-05 is done when all items below are complete:

- Domain Coverage Matrix covers every Prisma model.
- Operational Domain Map covers the core work-detail workspace.
- Every `Required Business Layer` domain has explicit business rules.
- Every required rule is enforced through service/domain/repository boundaries.
- Runtime verification includes BE-05 coverage checks.
- No Business Blueprint, schema, API Contract, Workspace Boundary, or ADR change is required.

## Domain Categories

| Category | Meaning | Business Layer Required |
|---|---|---:|
| Required Business Layer | Domain owns workflow, state transition, validation, transaction, or business decision rules. | Yes |
| Internal Only | Model supports internal execution or audit/history but should not own user-facing business decisions. | No |
| Derived | Model or value is calculated from other source-of-truth domains. | No direct layer |
| Lookup | Reference/master data used by other domains. | Usually no |
| Infrastructure | Technical/security/runtime support. | No |

## Domain Coverage Matrix

| Prisma Model | Category | Source of Truth Role | Business Layer Status | Reason |
|---|---|---|---|---|
| User | Infrastructure | Identity, role, and workspace binding | Not required | Supports access context rather than laundry workflow decisions. |
| Resort | Required Business Layer | Customer/workspace owner for linen assets | Required | Owns customer activation and Resort Workspace boundary assumptions. |
| LaundryItemType | Lookup | Linen type reference and per-piece weight | Not required | Used by count/load rules but does not own workflow state. |
| LaundryWork | Required Business Layer | Aggregate root for receive-wash-return workflow | Complete | Owns work lifecycle, status transitions, resort scope, and operational state. |
| LaundryBag | Required Business Layer | Intake unit for received laundry | Complete | Owns bag lifecycle, bag uniqueness within work, and receive/open/count readiness. |
| LaundryCountLine | Required Business Layer | Real item count captured after opening bags | Complete | Owns counted quantity, item type, color group, issue quantity, and movement trigger. |
| LinenMovement | Required Business Layer | Linen inventory movement history | Complete | Owns inventory-affecting movement semantics and adjustment constraints. |
| LinenInventorySummary | Derived | Current inventory projection | No direct layer | Must be derived from movement/work history, not edited directly. |
| IssueReport | Required Business Layer | Damage, missing, mismatch, and operational issue records | Complete | Owns issue lifecycle, quantity impact, and reporting/resolution rules. |
| WorkStatusLog | Internal Only | Audit/projection source for workflow history | Not required | Created by business domains; should not own business decisions. |
| LaundryMachine | Lookup | Machine capacity reference | Not required | Master data for load planning; does not own workflow state. |
| LaundryMachineLoadRule | Required Business Layer | Owner-defined load standards | Required | Owns min/target/max load constraints used by planning. |
| WashLoadPlan | Required Business Layer | Machine load planning for a work | Required | Owns load composition, fit status, and planning lifecycle. |

## Operational Domain Map

This map is based on the work-detail operational workspace.

Photo/image handling is intentionally excluded from BE-05 because it is not part of the core business workflow, state machine, inventory truth, or count truth.

| UI Section | Owner Domain | Data Type | Editable | Source / Rule |
|---|---|---|---:|---|
| Work header | LaundryWork | Business Domain | Yes | Work number, resort, received date, responsible user, and current status. |
| Workflow timeline | LaundryWork + WorkStatusLog | Projection | No | Derived from current status and status logs. |
| Bag count card | LaundryBag | Derived | No | Count of bags under the work. |
| Total weight card | LaundryCountLine | Derived | No | Sum of counted lines using captured or item-type-based weight logic. |
| Total counted items card | LaundryCountLine | Derived | No | Sum of counted line quantities. |
| Issue item count card | IssueReport / LaundryCountLine | Derived | No | Sum of reported issue quantities and/or count-line issue quantities. |
| Counted item table | LaundryCountLine | Business Domain | Yes | Real count captured after opening bags. |
| Note / problem summary | IssueReport | Business Domain | Yes | Problem records and descriptions. |
| Work history | WorkStatusLog | Projection | No | Audit/history generated by business actions. |
| Next action button | LaundryWork | Business Decision | Yes | Allowed next action depends on work status and required child domain readiness. |

## Completed

- Laundry Work Business Layer
  - Resort must exist and be active before Work creation.
  - `workNo` must be unique.
  - Work can only be created as `DRAFT` or `BAG_RECEIVED`.
  - Work status transition is constrained by the business workflow.
  - Status changes are logged through `WorkStatusLog`.
- Laundry Bag Business Layer
  - Work must exist before bag operations.
  - Resort Workspace must remain scoped by `resortId`.
  - Work in `CLOSED` or `CANCELLED` cannot receive new bags.
  - `bagNo` must be unique within a Laundry Work.
  - First bag received moves Work from `DRAFT` to `BAG_RECEIVED`.
  - Bag status transition is constrained by business rules.
- Laundry Count Line Business Layer
  - Work must be in a count-capable status before count lines are recorded.
  - Bag must belong to the Work when a bag is referenced.
  - Bag must be opened or already counted before receiving count lines.
  - Laundry Item Type must exist and be active.
  - `quantity` and `issueQuantity` must be non-negative.
  - `issueQuantity` must not exceed `quantity`.
  - First count line moves Work from `BAG_OPENED` to `ITEM_COUNTED` and creates a status log.
- Linen Movement Business Layer
  - Movement quantity must be valid for the movement type.
  - Non-adjustment movements must be positive.
  - Adjustment movements cannot be zero.
  - Work-linked movements require a movement-ready Work status.
  - Movement `resortId` must match the linked Work resort.
  - Laundry Item Type must exist and be active before movement creation.
- Issue Report Business Layer
  - Work must be in an issue-capable status before issue reports are created.
  - Issue quantity must be a non-negative integer.
  - Optional Laundry Item Type must be active when referenced.
  - Issue status transitions are constrained by business rules.
  - Closed Issue Reports cannot be updated.
  - Open or reviewing issues increment Work issue count on creation.

## Remaining Required Business Layers

1. Resort Business Layer
2. Laundry Machine Load Rule Business Layer
3. Wash Load Plan Business Layer
4. Runtime verification expansion for all BE-05 required domains

## Freeze Condition

BE-05 may be frozen only after:

- Domain Coverage Matrix is complete and reviewed.
- Operational Domain Map is complete and reviewed.
- Every required domain has a business layer or an approved exception.
- Runtime verification confirms business layer exports and boundaries.
- No stop condition is triggered.

## Stop Conditions

Stop and request approval if implementation requires any of the following:

- Business Blueprint change
- `schema.prisma` change
- API Contract change
- Workspace Boundary change
- ADR creation
