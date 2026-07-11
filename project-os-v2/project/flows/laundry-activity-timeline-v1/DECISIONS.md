# Laundry Activity Timeline V1 Decisions

Status: APPROVED

- Read-only, chronological ascending, deterministic tie-break.
- Omit image update/cover/delete events when durable evidence cannot reconstruct the exact action.
- No schema, event store, mutation, filtering or pagination.
