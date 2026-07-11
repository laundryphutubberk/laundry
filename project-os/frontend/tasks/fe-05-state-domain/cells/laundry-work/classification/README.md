# FE-05 / Laundry Work / Classification Cell

Status: SUCCESS_PATH_VERIFIED
Role: Specialized Completion Cell
Owner: FE-05 State Domain

## Purpose

Own narrow, implementation-capable completion work for Laundry Work classification behavior after the primary Codex flow has been implemented.

This cell exists to close focused gaps without rerunning the entire Codex flow.

## Ownership

This cell owns:

- Count Line classification edit state
- Item Type and Color edit payloads
- Save/cancel edit lifecycle
- Mutation pending/success/error state
- Duplicate-submit prevention
- Server-truth refresh after classification mutation
- Projection state required by classification UI
- User-safe mutation error state

## Boundary

This cell may patch the smallest required frontend path across:

- components
- pages
- controller
- policy
- projection
- API boundary
- feature-local state

This cell must not:

- change Backend behavior or contracts
- change Prisma schema
- redesign the Laundry Work business flow
- modify quantity or Bag-linkage rules
- perform unrelated UI refactors
- replace the primary Codex implementation flow

## Current Mission

Complete the Classification Save path observed during human testing:

- editing a Count Line accepted a Color value;
- clicking Save exited edit mode;
- the entered value was discarded;
- no API request was issued;
- no error feedback was shown.

The original no-API regression is now resolved. Human runtime validation on 2026-07-11 confirmed:

- one `PATCH /api/laundry/count-lines/:lineId` request returned `200`;
- backend emitted `laundry.count_line.updated`;
- Work Detail reloaded from the server;
- the refreshed Count Table displayed the saved value;
- quantity and Bag linkage remained unchanged.

Evidence:

- `validation/2026-07-11-classification-save-success.md`

## Completion Contract

The classification save flow is complete only when:

1. Save emits one classification mutation request. — VERIFIED
2. Only allowed classification fields are sent. — VERIFIED FOR SUCCESS PATH
3. Quantity and Bag linkage remain immutable. — VERIFIED
4. Edit mode closes only after confirmed success. — SUCCESS PATH VERIFIED; FAILURE PATH PENDING
5. Failed mutation keeps the row editable and shows a user-safe error. — PENDING
6. Controls lock while the request is pending. — PENDING CONTROLLED TEST
7. Duplicate submissions are prevented. — PENDING CONTROLLED TEST
8. UI refreshes from server truth after success. — VERIFIED
9. Available frontend lint/build/tests pass. — PENDING FINAL HARDENING
10. Human retest confirms the observed failure is resolved. — VERIFIED

## Routing Rule

Use this ownership path when assigning focused work:

```text
FE-05
  -> Laundry Work
    -> Classification Cell
```

Codex continues to own broad end-to-end flow implementation. This cell owns depth and completion for classification-specific gaps found during human operational testing.
