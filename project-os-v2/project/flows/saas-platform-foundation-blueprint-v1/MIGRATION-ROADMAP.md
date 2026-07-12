# SaaS Platform Foundation Migration Roadmap

Status: APPROVED

Architecture Direction: LOCKED_FOR_FOUNDATION_PLANNING

1. **Policy lock:** approve vocabulary and decision candidates; no runtime change.
2. **Additive foundation:** implement separately approved nullable-password/usable-method, Tenant, one-to-one Workspace, Branch, memberships, ClientOrganization, Invitation, OnboardingJourney, Audit, idempotency, and outbox foundations.
3. **Pilot backfill:** create one pilot Tenant/Workspace, memberships, ClientOrganizations from Resorts, and deterministic tenant ownership; reconcile all records.
4. **Active context:** resolve memberships server-side and derive legacy actor projections so current routes continue.
5. **Identity onboarding:** implement no-access sessions, atomic User+Identity+OnboardingJourney creation, invitation routing, three-mode availability control, then Google registration.
6. **Tenant provisioning:** atomically create Tenant, Workspace, one initial Branch, OWNER Membership, Trial, onboarding completion marker, and outbox; billing customer, notifications, analytics, and integrations are eventual.
7. **Client migration:** generalize Resort and introduce client memberships with compatibility projection.
8. **Operational scoping:** add tenantId by vertical slice; update unique keys, repositories, jobs, storage, caches, exports, search, reports, and integrations.
9. **Commercial capability:** add plan, subscription, entitlement, override, rollout, and usage enforcement.
10. **Platform governance:** add controlled PlatformAccess, support delegation, emergency access, and durable audit.
11. **Legacy removal:** stop writes/claims, migrate remaining routes, remove adapter, then remove User.role/workspaceType/resortId under separate approval.

Each phase remains additive until verified and requires reconciliation, rollback, and cross-tenant negative evidence. Destructive cleanup is always a separate migration.

Recommended first implementation foundation phase: additive identity/tenancy primitives and compatibility contracts only—nullable password with usable-method invariant, Tenant, one-to-one LaundryWorkspace, Branch, TenantMembership, OnboardingJourney, idempotency/outbox, and no-business-context session design. Google Registration waits until this phase is selected and approved for implementation.
