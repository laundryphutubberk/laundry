# Bag Intake and Counting

Document Status: APPROVED
Work Status: COMPLETED

## Outcome

Open received Bags, record actual linen quantities, and establish trustworthy completion semantics for downstream flows.

## Boundary

```text
Received Bags -> explicitly open a Bag -> record actual quantities for that Bag
  -> correct Count Lines while counting remains open -> explicitly complete counting
```

This flow stops before sorting, authoritative data recording, and inventory movements.

## Confirmed Blueprint Rules

- Resort sends Bags without piece counting.
- Laundry opens Bags and records actual piece counts.
- Bag is an intake unit, not an inventory unit.
- Count Lines are the source of actual quantities.
- Operational work should remain on Work Detail where practical.

## Completed State

Laundry Staff explicitly opens Bags, records actual Count Lines against active Item Types, and explicitly completes counting. Completion atomically marks every Bag `COUNTED` and the Work `ITEM_COUNTED`. Automated, database, and human browser verification passed.
