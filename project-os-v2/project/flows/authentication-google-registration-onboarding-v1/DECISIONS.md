# Decisions

- Google Login remains login-only; registration uses `POST /api/auth/google/register`.
- Modes are DISABLED, INVITATION_ONLY, and PUBLIC_LAUNDRY_ONBOARDING. Development/test defaults public; production defaults disabled.
- INVITATION_ONLY fails closed until Invitation is implemented.
- Verified email is mandatory. Email matches never auto-link.
- Provider subject is the stable ownership key; linked, unlinked, and inactive-owner states fail safely.
- User and identity creation use one Prisma transaction and uniqueness constraints arbitrate concurrency.
- Registration creates no Tenant, Workspace, Branch, Membership, Subscription, PlatformAccess, or operational data.
- Standard access/device-session delivery and shared authenticated destination routing are reused.
