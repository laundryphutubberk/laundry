# SaaS Platform Foundation Decision Candidates

Status: APPROVED

Architecture Direction: LOCKED_FOR_FOUNDATION_PLANNING

| ID | Candidate | Status | Recommendation | Alternative/trade-off |
|---|---|---|---|---|
| A | Tenant vs Laundry Workspace | APPROVED | Separate one-to-one in V1 | Same entity rejected for V1 because it couples security/billing to a product. |
| B | Role scope | APPROVED | PlatformAccess plus tenant/client memberships | Global role cannot represent multiple businesses safely. |
| C | Client tenancy | APPROVED | ClientOrganization belongs to one Laundry Tenant | Global clients introduce consent and isolation complexity. |
| D | Multi-Laundry client | DEFERRED | Tenant-local records; LegalOrganization remains OPEN | Direct sharing of one ClientOrganization record is deferred. |
| E | Passwordless User | APPROVED | Nullable passwordHash and at least one usable method | Fake hashes obscure usable-method state. |
| F | Active context | APPROVED | Hybrid short JWT with stable identity/context IDs; resolve membership server-side | Complete permission graphs become stale. |
| G | SuperAdmin | APPROVED | Separate internally provisioned PlatformAccess | Global User role risks public/invitation assignment. |
| H | Support impersonation | OPEN | Time-limited delegated support session with case/reason/audit | Direct impersonation weakens attribution. |
| I | Tenant provisioning | APPROVED | Atomic Tenant, Workspace, initial Branch, OWNER Membership, Trial, onboarding marker, and outbox; external work eventual | Partial authority records are unacceptable. |
| J | Subscription enforcement | RECOMMENDED | Central backend capability service | UI/route-only and scattered checks are bypassable or drift. |
| K | Invitation ordering | APPROVED | Valid invitation routes registration into acceptance; no invitation routes eligible Users to explicit Tenant onboarding | Either-only blocks useful onboarding paths. |
| L | Public registration | APPROVED | Modes DISABLED, INVITATION_ONLY, PUBLIC_LAUNDRY_ONBOARDING; production default recommendation INVITATION_ONLY | Always-on raises abuse; disabled prevents self-service. |

Approved constraints: concepts remain separate; no generic CUSTOMER; client organizations/users are Laundry-tenant scoped; Google grants no privilege; SuperAdmin is internally governed; Tenant creation is explicit; provider/device secrets and subjects never reach client storage, URLs, responses, or logs.

## Additional Locked Decisions

- Branch is Tenant-owned through LaundryWorkspace, and provisioning creates one initial Branch atomically.
- Resort, Hotel, Hospital, Institution, and Other are ClientOrganization types.
- Google Registration creates only User, Google UserIdentity, OnboardingJourney, and standard access session.
- Suspended Tenants block normal writes, preserve controlled login/read/export, and require audited platform override for emergency access.
- Migration is additive and staged; no big-bang rewrite.

## Retained Open or Deferred Decisions

- OPEN: platform MFA/recovery; support impersonation approval; trial/grace/plans/limits; audit retention/tamper evidence; Platform LegalOrganization; duplicate-email public wording; billing-provider integration.
- DEFERRED: multi-Laundry legal-client sharing and direct sharing of one ClientOrganization record.
