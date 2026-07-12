# User Identity Persistence Decisions

Status: APPROVED

- Provider subject and provider form the immutable external identity key; email remains a snapshot.
- Identity creation requires an explicitly selected existing User and never creates or reassigns User ownership.
- Unlinked identities remain durable evidence and are excluded from active lookup.
- Existing password hash and User role, workspace, resort and active fields remain unchanged.
- Provider tokens, credentials and authorization fields are prohibited from identity persistence.
