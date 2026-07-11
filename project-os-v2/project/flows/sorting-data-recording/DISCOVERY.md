# Sorting and Data Recording Discovery

Status: ACTIVE

## Blueprint Truth

- Type sorting follows actual counting.
- Color sorting follows type sorting.
- Data recording confirms counted/sorted data as the reference for Work and Inventory.
- Inventory must be calculated from Work/Movement history, not manually entered again.

## Current Model and Runtime

- Count Lines already require an active Item Type and may contain `colorGroup`.
- Work statuses include `TYPE_SORTED`, `COLOR_SORTED`, and `DATA_RECORDED`.
- The generic Work endpoint can advance these statuses without checking Count Lines.
- Linen Movement supports `COUNTED_AT_LAUNDRY`, `ISSUE_REPORTED`, `RETURNED_TO_RESORT`, and `ADJUSTMENT`.
- Movement create trusts client-supplied resort, Item Type, color, and quantity.
- `LinenInventorySummary` exists but no inspected command derives/upserts it during data recording.
- Frontend Continue currently drives all three statuses generically and has no confirmation summary.

## Structural Conclusion

Sorting stages should confirm completeness of existing Count Line dimensions. `DATA_RECORDED` must be an explicit server-derived publication command, not a generic status change or client-authored Movement request.
