# Bag Intake and Counting Decisions

Status: APPROVED

Approved by the user on 2026-07-11. All five recommended decisions are authoritative for this flow.

## Decision 1 - Bag linkage

Recommended: every new Count Line belongs to one OPENED Bag. Keep Prisma nullable only for legacy compatibility.

## Decision 2 - Opening semantics

Recommended: opening the first received Bag moves Work to `BAG_OPENED`. Generic Work transition cannot bypass this command.

## Decision 3 - Count completion

Recommended: the first Count Line does not complete counting. An explicit completion command requires every Bag to contain at least one valid Count Line, then marks all Bags `COUNTED` and Work `ITEM_COUNTED` atomically.

## Decision 4 - Item type authority

Recommended: Staff select an active Item Type. Operational counting must not silently create master data from free text.

## Decision 5 - Duplicate dimensional rows

Recommended: within one Bag, the same Item Type plus normalized color is one logical row. Reject repeats with `409` rather than silently merging.

## Compatibility Position

Keep the Prisma schema and endpoint families. Add explicit Bag-open and count-completion commands, tighten creates, and retain legacy reads.
