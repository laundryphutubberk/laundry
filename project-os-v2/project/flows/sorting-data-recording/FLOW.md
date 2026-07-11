# Sorting and Data Recording

Document Status: DRAFT
Work Status: READY

## Outcome

Confirm that counted linen is classified by Item Type and color, then publish one immutable, idempotent Work-derived quantity record for Inventory and downstream return/packing flows.

## Boundary

```text
ITEM_COUNTED
  -> confirm type classification
  -> confirm color classification
  -> record authoritative Work data
  -> create derived Inventory Movements/Summary atomically
  -> DATA_RECORDED
```

Return, packing, delivery, and closing belong to later flows.

## Selection Rationale

The Blueprint defines `DATA_RECORDED` as the point where counted/sorted data becomes the Work and Inventory reference. Return/Packing depends on this truth boundary and therefore cannot safely precede it.
