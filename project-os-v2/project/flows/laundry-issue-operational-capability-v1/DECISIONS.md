# Laundry Issue Operational Capability V1 Decisions

Status: APPROVED

- Preserve OPEN, REVIEWING, RESOLVED and CANCELLED semantics.
- Active Work permits supported mutations; CLOSED/CANCELLED Work permits reads only.
- Bag and Count Line links are optional but must remain within the selected Work and Resort.
- Issue quantity does not alter Count Line quantity or Inventory Summary.
- No Issue-specific image relation, delete endpoint, escalation, compensation, notification, or schema change.
