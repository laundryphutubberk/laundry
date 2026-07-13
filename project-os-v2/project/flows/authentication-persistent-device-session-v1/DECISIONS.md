# Persistent Device Session Stage A Decisions

Status: APPROVED

- Access JWT lifetime defaults to 15 minutes and retains the existing response shape.
- Persistent credential is random, stored only as an HttpOnly cookie, and persisted only as a SHA-256 hash.
- Cookie is SameSite=Lax, scoped to `/api/auth`, Secure in production, and sent only to configured credentialed CORS origins.
- Idle expiry defaults to 14 days; absolute expiry defaults to 30 days and both are environment configurable.
- Each refresh rotates the credential; immediate old-credential reuse revokes the family as compromised.
- Existing roles, resort assignment, workspace context and authorization middleware are unchanged.
