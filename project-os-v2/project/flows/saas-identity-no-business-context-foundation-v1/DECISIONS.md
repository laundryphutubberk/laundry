# Phase 1A Decisions

Status: APPROVED

- Existing Users backfill to `onboardingStatus=NOT_REQUIRED`; hashes and legacy authorization remain unchanged.
- Onboarding-only is explicit: `PENDING` plus null role, workspaceType, and resortId.
- Legacy role/workspace columns become nullable to avoid privilege-bearing placeholders.
- Architect decision: nullable role/workspaceType/resortId plus explicit onboardingStatus/hasBusinessContext is locked; sentinel authorization values are prohibited.
- A session requires passwordHash or an active UserIdentity.
- Password login and password step-up reject null passwordHash through existing generic failures.
- Onboarding actor claims add onboardingStatus and hasBusinessContext; old actor shapes remain compatible.
- Operational policy returns ONBOARDING_REQUIRED only for explicit onboarding context.
- Frontend uses one shared destination decision and guards workspace layout before operational pages mount.
- Google Registration and Tenant/onboarding creation UI remain out of scope.
