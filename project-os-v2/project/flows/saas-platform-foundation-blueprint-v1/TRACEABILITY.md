# SaaS Platform Foundation Traceability

Status: APPROVED

Architecture Direction: LOCKED_FOR_FOUNDATION_PLANNING

## Sources

- Mission-approved SaaS domain policy
- Authentication Experience Blueprint V1
- Completed Google Login decisions/evidence
- Domain/Data and Security standards
- Current Prisma, actor, JWT middleware, policies, auth services, and frontend bootstrap/session source

## Mapping

| Current | Proposed |
|---|---|
| User.role | TenantMembership or ClientOrganizationMembership role |
| User.workspaceType | ActiveContext compatibility projection |
| User.resortId | Client membership/context |
| Resort | Tenant-owned ClientOrganization type RESORT |
| Implicit single Laundry | Tenant + one-to-one LaundryWorkspace |
| No Branch | Tenant-owned Branch |
| Full authorization JWT claims | User/session/context IDs plus membership version |
| Resort-only row scope | Immutable tenantId plus clientOrganizationId where relevant |
| Console audit events | Durable append-only AuditEvent |

Preserve Google verification, identity uniqueness, explicit linking/no email auto-link, short access sessions, Session Storage, and rotating HttpOnly device sessions. Every future schema/API/migration requires a separate approved implementation flow.

## Policy Lock Trace

- Tenant/LaundryWorkspace separation, Branch ownership, initial Branch transaction, scoped memberships, ClientOrganization ownership/types, nullable password, usable-method invariant, PlatformAccess, hybrid context, registration modes, Google Registration minimum records, invitation routing, provisioning transaction, eventual work, suspension behavior, and additive migration are Architect-approved.
- Product Implementation remains NOT_STARTED.
- Google Registration is WAITING_FOR_FOUNDATION_SELECTION.
