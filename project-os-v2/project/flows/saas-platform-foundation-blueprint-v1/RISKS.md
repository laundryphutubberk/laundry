# SaaS Platform Foundation Risks

Status: APPROVED

| Risk | Current exposure | Safeguard |
|---|---|---|
| Cross-tenant leak | Operational rows lack Laundry tenantId | Immutable tenant scope and negative tests |
| Stale privilege | JWT carries global authorization | Short hybrid token and current membership resolution |
| Provider elevation | Registration accepts roles | Google registration creates no membership |
| Multi-business limitation | One role/workspace/resort per User | Multiple memberships and active context |
| Client ambiguity | Resort is global and single-type | Tenant-owned ClientOrganization |
| Partial provisioning | No tenant transaction | Atomic core, idempotency, outbox |
| Platform-admin abuse | No governance model | Separate access, MFA, dual control, JIT, audit |
| Passwordless lockout | Non-null passwordHash | Explicit nullable method and final-method checks |
| Subscription bypass | No entitlement layer | Central backend capability service |
| Infrastructure scope loss | No job/cache/storage convention | Tenant namespace everywhere |
| Suspension inconsistency | Only active flags | Explicit lifecycle precedence |
| Audit leakage | providerSubject is not a generic redaction key | Audit allowlist and sensitive classification |
| Big-bang migration | Routes depend on legacy actor | Compatibility adapter and vertical slices |
| Registration abuse | Current register lacks limiter | Config availability and layered abuse controls |
| Suspended-tenant bypass | Current system has no Tenant lifecycle | Block normal writes; controlled read/export; audited emergency override |
| Registration over-provisioning | Current registration assigns operational role | Google Registration creates only User, Identity, Journey, and session |

Dedicated threat review is required for schema, backfill, authorization adapter, Google registration, platform access, support delegation, subscription enforcement, and each aggregate migration.

Open risk-treatment details remain for platform MFA/recovery, support approval, commercial periods/limits, audit retention/tamper evidence, LegalOrganization, duplicate-email wording, billing integration, and future multi-Laundry legal-client sharing.
