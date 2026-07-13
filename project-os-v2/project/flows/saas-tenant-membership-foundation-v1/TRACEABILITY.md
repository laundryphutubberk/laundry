# Traceability

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| Additive domain schema | Prisma schema and migration | Prisma gates |
| Pilot/backfill/bootstrap | Phase 1B migration | Focused verifier; owner `userId=1` |
| Workspace ownership | Composite foreign key | Negative DB test |
| One default Branch | Partial unique index | Negative DB test |
| Tenant-scoped reads | Repositories/context service | Scope tests |
| Fail-closed lifecycle | Membership policy | Suspended-tenant test |
| Compatibility | Legacy authority retained | Regression/frontend gates |
