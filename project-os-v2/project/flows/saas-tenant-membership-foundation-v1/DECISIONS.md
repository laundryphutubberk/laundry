# Decisions

- Tenant and LaundryWorkspace are separate one-to-one records.
- Branch retains `tenantId`; a composite foreign key enforces workspace ownership consistency.
- A PostgreSQL partial unique index enforces one default Branch per Tenant.
- Pilot data is deterministic: `laundry-pilot`, active workspace, and active default `MAIN` Branch named `สำนักงานใหญ่` in `Asia/Bangkok`.
- Only active, explicit Laundry users map to active OWNER, MANAGER, or STAFF memberships. Other users are excluded.
- Multiple active OWNER memberships are permitted; last-OWNER governance is deferred.
- PENDING is schema-only. Only ACTIVE Tenants resolve; other lifecycle states fail closed.
- Legacy actor claims remain runtime authorization authority.
- Development-only bootstrap: absent an eligible owner, promote the lowest-ID active Laundry user whose onboarding is not PENDING before backfill. No user is created and reruns do not bootstrap again. Production onboarding and authoritative Tenant provisioning replace this policy.
