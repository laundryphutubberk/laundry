# FE-05 / Laundry Work / Classification Cell

Status: ACTIVE
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

- editing a Count Line currently accepts a Color value;
- clicking Save exits edit mode;
- the entered value is discarded;
- no API request is issued;
- no error feedback is shown.

## Completion Contract

The classification save flow is complete only when:

1. Save emits one classification mutation request.
2. Only allowed classification fields are sent.
3. Quantity and Bag linkage remain immutable.
4. Edit mode closes only after confirmed success.
5. Failed mutation keeps the row editable and shows a user-safe error.
6. Controls lock while the request is pending.
7. Duplicate submissions are prevented.
8. UI refreshes from server truth after success.
9. Available frontend lint/build/tests pass.
10. Human retest confirms the observed failure is resolved.

## Routing Rule

Use this ownership path when assigning focused work:

```text
FE-05
  -> Laundry Work
    -> Classification Cell
```

Codex continues to own broad end-to-end flow implementation. This cell owns depth and completion for classification-specific gaps found during human operational testing.
