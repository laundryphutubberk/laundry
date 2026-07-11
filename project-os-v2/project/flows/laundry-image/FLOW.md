# Laundry Image Evidence Flow

Document Status: APPROVED
Work Status: COMPLETED
Pilot: Project OS V2 first flow

## Outcome

Authorized users can view and manage durable image evidence attached to the correct Laundry Work. Metadata operations must remain persisted after refresh, preserve workspace isolation, and never present local UI state as confirmed success.

## Pilot Boundary

This pilot validates the metadata flow only:

```text
List
  -> Register provider-neutral metadata
  -> Edit caption/order
  -> Set one cover
  -> Soft delete
  -> Refresh and confirm persistence
```

Binary upload/storage selection is explicitly deferred. The pilot must not change the approved Prisma schema or REST contract.

## Actors

- Laundry staff: register and manage evidence for mutable work.
- Laundry manager/owner: review and manage evidence according to the same mutation policy.
- Resort user: read only evidence belonging to the authenticated resort scope.

## Main Flow

1. Open an accessible Laundry Work.
2. Load active images ordered by cover, display order, upload time, and identity.
3. Register metadata only after a provider boundary supplies a usable URL.
4. Refresh the authoritative list.
5. Update caption or display order and refresh.
6. Select a cover atomically and refresh.
7. Soft delete an image and refresh.
8. Reload the page and confirm the persisted result.

## Exception Flows

- Missing or inaccessible Work returns no cross-scope data.
- Resort mutation is rejected.
- Closed or cancelled Work mutation is rejected.
- Deleted images are excluded from the active list.
- Duplicate in-flight frontend mutation is ignored or disabled.
- Failed mutation retains the previously confirmed projection and exposes an error.
- Deleting a cover may leave the Work without a cover; automatic replacement is not implied.

## Business Rules and Invariants

- `LaundryWorkImage` is the persisted metadata source.
- Active means `deletedAt = null`.
- At most one active image is selected as cover per Work after a completed cover command.
- Resort scope derives from authenticated context, never request override.
- Image mutations require Laundry staff authority.
- `CLOSED` and `CANCELLED` Works are immutable for this flow.
- Presentation components do not call APIs or decide authorization.

## Dependencies

- Domain model and migration readiness: implemented in repository, governance verification unresolved.
- Backend metadata boundary: implemented, runtime verification missing.
- Frontend metadata boundary: implemented, engineering/browser verification missing.
- Binary storage provider: deferred and non-blocking for this metadata pilot.

## Completion Boundary

This metadata pilot is complete with the Project Owner's acceptance. Binary upload remains a separate future capability. V1 governance drift remains recorded for later reconciliation and does not invalidate the observed metadata behavior.
