# Phase 1A Traceability

Status: APPROVED

| Requirement | Implementation |
|---|---|
| Nullable password | Prisma User.passwordHash and additive migration |
| No operational role | Nullable role/workspaceType plus PENDING state |
| Usable method invariant | auth issueSession + active identity query + atomic foundation repository method |
| Generic password failure | auth login null guard |
| Final identity protection | existing unlink transaction and method counts preserved |
| Onboarding session | actor/user onboardingStatus and hasBusinessContext |
| Operational denial | authorization policy ONBOARDING_REQUIRED |
| Safe frontend routing | destination helper, RequireBusinessContext, /onboarding |
| Existing compatibility | NOT_REQUIRED backfill and legacy actor-shape fallback |

Depends on the approved SaaS Platform Foundation Blueprint and completed Google Login/device-session flows.

## Null-Safety Audit

- A — identity/authentication safe: session serialization, optional workspace context extraction, nullable repository selects, and display fallbacks preserve nulls without dereference.
- B — operational-only: Laundry services reach actor role/workspace usage only after Laundry authorization; frontend operational controllers mount behind RequireBusinessContext.
- C — defect corrected: onboarding actor validation originally returned before checking active state; active validation now precedes the onboarding branch.
- D — fixtures/documents: legacy policy fixtures intentionally omit new fields and verify compatible normalization.
- E — architecture blockers: none. No Tenant, Membership, or sentinel role is required.

No production role/workspace use calls trim, case conversion, or unsafe methods on nullable values. Role/workspace label maps have safe fallbacks and are inside the guarded operational layout.
