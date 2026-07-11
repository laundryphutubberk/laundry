# Return, Packing, and Work Closure Decisions

Status: APPROVED

- RETURNED is permitted only from DATA_RECORDED after persisted Count Lines match recorded Inventory truth.
- Return creates existing RETURNED_TO_RESORT movements and updates the existing Inventory Summary atomically.
- CLOSED is permitted only from RETURNED and is terminal.
- Generic status mutation cannot reach RETURNED or CLOSED.
- No packing schema/state is introduced because no durable packing concept exists in the approved schema.
