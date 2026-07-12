# SaaS Platform Foundation Blueprint V1

Document Status: APPROVED
Work Status: READY

Documentation-only architecture discovery and blueprint drafting for the long-term multi-tenant SaaS foundation. Product implementation, schema changes, migrations, Google registration, staging, and publication are excluded.

Architecture Direction: LOCKED_FOR_FOUNDATION_PLANNING
Product Implementation: NOT_STARTED
Google Registration: WAITING_FOR_FOUNDATION_SELECTION

## Current Evidence

- User mixes global identity and authorization through role, workspaceType, resortId, and active.
- JWT middleware trusts those global claims.
- Resort is the only client-organization concept; Tenant, Membership, Branch, platform access, subscription, entitlement, and durable audit models do not exist.
- Completed Google login, explicit linking, Session Storage access sessions, and HttpOnly device-session rotation must be preserved.

## Proposed Outcome

The Architect approved staged separation of User/Identity, platform governance, Laundry Tenant/Workspace, memberships, Branch, tenant-owned Client Organization, onboarding, active context, subscriptions, entitlements, and audit.

No current runtime behavior is changed.
