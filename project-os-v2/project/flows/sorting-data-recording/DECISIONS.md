# Sorting and Data Recording Decisions

Status: APPROVED

Approved by the user on 2026-07-11. All six recommended decisions are authoritative for this flow.

## Decision 1 - Type sorting meaning

Recommended: `TYPE_SORTED` is an explicit confirmation that every Count Line has an active Item Type. It does not duplicate or rewrite Count Lines.

## Decision 2 - Color sorting meaning

Recommended: `COLOR_SORTED` is an explicit confirmation that every Count Line has a normalized non-empty `colorGroup`. Missing color blocks confirmation and must be corrected while the sorting window is open.

## Decision 3 - Mutation window

Recommended: reopen controlled Count Line editing during `ITEM_COUNTED` and `TYPE_SORTED` only for classification corrections. Quantities and Bag linkage remain immutable after counting completion. After `COLOR_SORTED`, Count Lines are fully immutable.

## Decision 4 - Data recording command

Recommended: an explicit server command aggregates Count Lines by Resort + Item Type + normalized color, creates `COUNTED_AT_LAUNDRY` Movements, updates Inventory Summary, writes the audit log, and moves Work to `DATA_RECORDED` in one transaction.

## Decision 5 - Idempotency

Recommended: serialize recording per Work and reject/replay safely when Work is already recorded. Never create a second Movement set for the same Work truth.

## Decision 6 - Issue quantities

Recommended: counted quantity remains the physical quantity truth. `issueQuantity` is tracked separately and does not reduce `COUNTED_AT_LAUNDRY`; Issue-derived movements are handled by the Issue/Inventory reconciliation rule rather than silently subtracting here.

## Compatibility Position

Keep the current Prisma schema. Add explicit confirmation/recording commands and block the three generic transitions from bypassing validation.
