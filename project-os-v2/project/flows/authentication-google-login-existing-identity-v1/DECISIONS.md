# Google Login (Existing Identity) Decisions

Status: APPROVED

- Add one focused POST /auth/google/login endpoint under the existing auth routes.
- Reuse existing Google verification service (googleIdentityVerification.service.js).
- Reuse existing UserIdentity lookup by provider + providerSubject with unlinkedAt null.
- Reuse existing JWT and persistent-device session issuance (auth.service.js issueSession).
- Reuse existing auth rate limiter (authRateLimit.middleware.js).
- Return the same normalized AuthSession shape as password login.
- Frontend: reuse existing googleIdentityClient.ts for credential acquisition.
- Frontend: reuse existing submitAuth() helper for API call and session persistence.
- Frontend: add AuthRequestError class to preserve envelope.meta.code for controlled error display.
- Frontend: add isGoogleIdentityConfigured() and ensureGoogleIdentityAvailable() to googleIdentityClient.ts.
- Frontend: add Google Login button to LoginPage.tsx with synchronous in-flight ref guard.
- Frontend: allowlisted error messages only; never display raw backend error.message.
- No User creation, first-time onboarding, email linking, identity transfer, or schema change.
- No Google credential or provider token persisted in browser storage.
- Access token and normalized auth session use Session Storage for the active browser session.
- The HttpOnly device-session cookie is the only durable remember-device authority.
- Startup refresh must resolve before protected application routes can mount; failed refresh clears current and legacy client auth.
