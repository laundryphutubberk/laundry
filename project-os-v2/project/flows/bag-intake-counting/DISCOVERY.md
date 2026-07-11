# Bag Intake and Counting Discovery

Status: ACTIVE

## Blueprint

The Resort sends Bags without piece counting. Laundry opens Bags and records actual quantities. Count Lines become the quantity truth used downstream.

## Data Model

- `LaundryBag.status` supports `RECEIVED`, `OPENED`, `COUNTED`, and `CLOSED`.
- `LaundryCountLine.bagId` is nullable.
- Count Lines contain item type, optional color, quantity, issue quantity, and note.
- Explicit opening and completion can use the current schema while nullable linkage remains readable for legacy data.

## Backend Reality

- Bag transition service exists, but no HTTP route mounts it.
- Generic Work transition can set `BAG_OPENED` independently of Bag state.
- First Count Line automatically advances Work to `ITEM_COUNTED`.
- Count update does not preserve the issue-quantity invariant when quantity decreases.
- Item type text can silently create master data.

## Frontend Reality

- Work Detail supports Count Line CRUD but has no explicit Bag-open action.
- Count entry permits an unspecified Bag.
- Generic Continue drives Work status independently of Bag/count completeness.

## Conclusion

The CRUD foundation exists, but completion must become an explicit domain command rather than an inference from the first row.
