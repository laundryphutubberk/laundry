# Flow Registry

Status: ACTIVE

Laundry Image, Laundry Intake, and Bag Intake and Counting are completed. Sorting and Data Recording is ready for human testing.

## Candidate Pilot

| Flow | Reason | State |
|---|---|---|
| Laundry Image | First V2 pilot; provider-neutral metadata flow | COMPLETED_WITH_APPROVED_EXCEPTION |
| Laundry Intake and Work Creation | Atomic operational aggregate and initial Bag intake | COMPLETED |

Completed package: `../project/flows/laundry-image/`

## Next Main-flow Candidates

| Flow | Business value | Dependency position | Candidate state |
|---|---|---|---|
| Laundry Intake and Work Creation | Establishes the operational aggregate and Resort ownership | Upstream of bags, counting, issues, images, packing, and delivery | COMPLETED |
| Bag Intake and Counting | Captures the real quantity at the laundry | Produces authoritative operational quantities for issues and inventory | COMPLETED_WITH_APPROVED_EXCEPTION |
| Sorting and Data Recording | Confirms type/color dimensions and publishes Work quantity truth to Inventory | Required before return, packing, and delivery | READY_FOR_TEST |
| Return, Packing, and Delivery | Completes the customer-facing cycle | Depends on authoritative count/inventory and discrepancy rules | BLOCKED_BY_UPSTREAM_REVIEW |

Completed package: `../project/flows/laundry-intake/`

Completed package: `../project/flows/bag-intake-counting/`

Active package: `../project/flows/sorting-data-recording/`
