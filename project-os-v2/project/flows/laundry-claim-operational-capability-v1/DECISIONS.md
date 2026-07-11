# Laundry Claim Operational Capability V1 Decisions

Status: APPROVED

- One Claim per Issue; Work and Resort derive through Issue.
- Explicit lifecycle only: OPEN to IN_REVIEW or REJECTED; IN_REVIEW to APPROVED or REJECTED; APPROVED to RESOLVED.
- REJECTED and RESOLVED are terminal.
- CLOSED Work permits Claim creation and progression; CANCELLED Work is readable and immutable.
- Claim operations never mutate Issue, Work, Count Line, Inventory, Movement or Image truth.
