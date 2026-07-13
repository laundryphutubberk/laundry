# Phase 1A Risks

Status: APPROVED

- Invalid null-password/no-identity User: session issuance fails closed.
- Privilege placeholder: avoided through nullable legacy authorization fields.
- Legacy actor regression: old claims derive business context and retain the old normalized shape.
- Workspace flash/API race: workspace layout is guarded before operational children mount.
- Refresh of invalid method state: session issuance rechecks usable authentication method.
- Password step-up crash: null hash is rejected before bcrypt.
- Frontend-only trust: backend operational policy independently rejects onboarding actors.
- Recovery and password enrollment remain future work; no method-removal feature was added.
- Inactive onboarding actor bypass: found during continuation audit and fixed by enforcing active state before the onboarding actor branch.
