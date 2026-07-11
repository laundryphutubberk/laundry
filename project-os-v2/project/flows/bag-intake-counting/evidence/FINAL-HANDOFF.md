# Bag Intake and Counting Final Handoff

Status: ACTIVE
Decision: COMPLETED_WITH_APPROVED_EXCEPTION

## Completed Capability

```text
Open received Bags explicitly
  -> record actual quantities against active Item Types
  -> edit/delete while counting is open
  -> reject duplicate dimensional rows
  -> explicitly complete counting
  -> atomically mark Bags COUNTED and Work ITEM_COUNTED
```

## Verified

- Laundry-only mutation and Resort-scoped read policy;
- first Bag open and Work `BAG_OPENED` transition in one transaction;
- mandatory same-Work OPENED Bag and active Item Type linkage;
- duplicate-submit race accepts exactly one row;
- incomplete counting completion rejection;
- atomic successful completion and authenticated audit identity;
- post-completion Frontend action prevention;
- post-completion Backend PATCH/DELETE rejection with persisted data unchanged;
- Count Line Item Type, category, Bag, quantity, and color detail projection;
- Laundry Issue and Laundry Image host regressions;
- browser open, create, edit, delete, complete, and refresh persistence.

## Defects Corrected During Browser Verification

- Item Type list queried a nonexistent `displayOrder` field;
- Count entry click handler referenced an undefined `itemTypeId` identifier;
- Work Detail omitted Count Line Item Type and Bag relations;
- initial nested include patch was placed under `_count` and was corrected with separate list/detail projections.

## Approved Exceptions

- The local dataset has no permanent active Laundry Item Type. Browser verification used temporary controlled Master Data. Master-data lifecycle belongs to its own flow.
- The Frontend package has no TypeScript compiler/type-check gate. Vite build and ESLint cannot guarantee detection of undefined runtime identifiers. This remains a Project OS/tooling gap.

## Cleanup

Browser verification seed `20260710185643` was removed successfully.

## Git

Changes remain uncommitted and unpushed pending explicit authorization.
