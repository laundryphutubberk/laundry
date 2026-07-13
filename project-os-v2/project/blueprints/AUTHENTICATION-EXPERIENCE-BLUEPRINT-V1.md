# Authentication Experience Blueprint V1

Status: APPROVED
Owner: Project Owner / Chief Architect
Authority: Authentication and secure session experience architecture for the Laundry Platform
Blueprint Lock: LOCKED

## 1. Purpose

Define the secure, mobile-friendly authentication architecture for the Laundry Platform. The Blueprint minimizes repeated login while preserving internal role, EmployeeProfile, branch, position, workspace, permission, device, and account-security boundaries.

This document defines architecture and product contract only. It records no implementation, execution, capability, project, or verification state.

## 2. Business Goals

- Fast mobile sign-up and sign-in.
- Minimal repeated authentication on trusted personal devices.
- Secure, expiring, rotating, and revocable device persistence.
- Clear account recovery.
- No automatic privilege elevation.
- Compatibility with customer and employee flows.
- Continued support for existing email/password users during staged rollout.

## 3. Actors

- Customer.
- Laundry employee.
- Administrator.
- Unapproved employee candidate.
- Existing password user.
- Google-authenticated user.
- Passkey-enabled user.

## 4. Identity Versus Authorization

Authentication proves identity or control of an authentication method. Authorization remains an internal server-controlled business decision.

- Google authentication proves external identity only.
- Passkey/WebAuthn proves credential possession and, where required, user verification only.
- The central `User` remains the internal identity.
- `CustomerProfile` and `EmployeeProfile` remain internal domain records.
- Internal User role, EmployeeProfile approval, branchId, position, workspace access, and permissions remain server-controlled.
- No external provider may directly assign employee or administrator access.
- Google authentication must never automatically grant Employee role.
- Employee access requires an approved EmployeeProfile, branch assignment, position, and internal authorization.
- Authentication method must not redefine business authorization.
- Authorization is checked on every protected request.

## 5. Supported Authentication Methods

### V1

- Email/password.
- Persistent device session.
- Sign in with Google.

### V1.1 or Later

- Passkey/WebAuthn.
- Biometric-backed device authentication where supported by the platform authenticator.

### Recovery

- Password reset.
- Google provider account recovery through Google.
- Passkey fallback to another usable authentication method.
- Passkey removal from authenticated device management.

Persistent device session is implemented before Google Sign-In and Passkey/WebAuthn.

## 6. Account Linking Rules

- Existing email/password accounts may be linked to Google only after explicit user confirmation.
- Verified-email matching may identify a possible existing account, but matching alone must not silently link accounts.
- The server must prevent duplicate internal accounts when a trusted verified email corresponds to an existing User.
- Conflicts, including provider identity already linked elsewhere or ambiguous email ownership, must stop linking and present a recoverable explanation.
- Provider subject identifier is the stable external identifier and must be stored with the provider relationship.
- Email is not the primary stable provider identifier.
- Linking requires recent authentication or equivalent step-up confirmation.
- Unlinking requires authenticated confirmation and must preserve at least one usable authentication method.
- An account with no remaining usable authentication method must not permit unlink.
- Provider tokens are not persisted unless a later approved capability requires Google API authorization.
- No deceptive or automatic account linking is allowed.

## 7. Registration Rules

### Customer

- Email/password or Google authentication may create a customer User.
- CustomerProfile creation remains an internal application action.
- Registration must prevent duplicate accounts and return clear recoverable outcomes.

### Employee

- Authentication may create or locate a User identity.
- Authentication alone never creates an approved employee.
- Employee access requires administrator approval and EmployeeProfile assignment.
- Branch, position, workspace, and permission assignment remain internal.
- An unapproved employee candidate receives an explicit pending or not-authorized state rather than employee access.
- Customer authentication must not be promoted to employee or administrator by provider identity.

## 8. Persistent Device Session Architecture

- Protected API access uses short-lived access authentication.
- Remembered login uses a long-lived rotating refresh or session credential.
- The server maintains a session/device record and revocation state.
- The refresh/session credential is delivered using a Secure, HttpOnly cookie.
- The Secure flag is required in production.
- SameSite behavior and CSRF protection must match the deployment topology and request model.
- Credential rotation occurs on successful refresh.
- Reuse of an already-rotated credential triggers token-family risk handling and revocation policy.
- Sessions have an idle expiry and an absolute expiry.
- No permanent, non-expiring remembered login is allowed.
- Refresh/session credentials must not be stored in frontend localStorage.
- Logout current device revokes the current session.
- Logout all devices revokes all active device sessions for the User.
- A User may remotely revoke another device.
- Password reset, critical security change, compromise response, or administrator action may revoke affected sessions.
- Lost-device handling uses remote revocation and logout-all controls.
- Session fixation is prevented by issuing a new session identity after successful authentication or privilege-sensitive transition.

## 9. Device Session Model

Conceptual fields may include:

- Session/device identifier.
- userId.
- Credential hash or token family identifier.
- createdAt.
- lastUsedAt.
- expiresAt.
- revokedAt.
- User-agent or user-readable device label.
- Approximate IP and security metadata where legally appropriate.
- Rotation state.
- Reuse or compromise state.

This Blueprint does not prescribe a database migration or concrete schema.

## 10. Google Sign-In Contract

- Use Google Identity Services for web authentication.
- Integration must be FedCM-ready and tolerate browser privacy-policy evolution.
- The server verifies the Google ID token.
- Verification includes signature, issuer, audience, expiry, and token validity.
- The Google provider subject (`sub`) is the stable external identifier.
- Verified-email state is evaluated according to Google token claims and internal linking policy.
- Google authentication remains separate from Google API authorization.
- No Google data scopes are requested unless a later approved capability requires them.
- Account chooser and One Tap may be offered according to privacy, shared-device, and UX policy.
- One Tap must not silently link accounts or elevate authorization.
- Popup, FedCM, third-party-cookie, or browser-policy failure must degrade gracefully to another supported sign-in path.
- Provider tokens must not become internal authorization credentials.

## 11. Passkey/WebAuthn Contract

- Passkey/WebAuthn provides the fingerprint, Face ID, PIN, or device-unlock style experience.
- The application never reads, receives, transmits, or stores fingerprint, face, or other biometric templates.
- Registration uses a server-generated, single-use challenge.
- Authentication uses a server-generated, single-use challenge.
- Challenges expire and cannot be replayed.
- RP ID and origin are validated against approved deployment origins.
- The server persists public-key credential material and required credential metadata only.
- Assertion signature verification is server-side.
- Signature counter or authenticator-risk signals are evaluated without assuming all authenticators expose identical counter behavior.
- User verification is required for authentication operations defined as passkey login.
- Discoverable credentials are preferred where they improve username-less sign-in without weakening account recovery.
- Multiple passkeys per User are allowed.
- Passkeys have user-readable names, creation time, last-used information where available, and explicit removal.
- Removal requires a remaining usable authentication or recovery method.
- Recovery must not depend exclusively on a lost passkey.
- Cross-device and device-bound credential behavior must be communicated without assuming every passkey syncs.
- Unsupported browsers or devices fall back to Google or email/password.

## 12. Login and Registration UX

- Mobile-first flow with one primary action per screen.
- Sign in with Google is prominently available where configured.
- Email/password remains a visible fallback.
- Passkey entry is shown only when supported and usable.
- Password-manager and autocomplete behavior must be supported.
- Inputs use appropriate type, input mode, and autocomplete semantics.
- Password fields provide an accessible show/hide control.
- Loading, success, error, pending, and retry states are explicit.
- Duplicate submission is prevented while authentication is pending.
- Entered email is preserved after recoverable errors.
- Layout remains usable when the software keyboard is open.
- Touch targets are operationally safe.
- Focus order and error announcement are accessible.
- Browser back must not silently discard meaningful input.
- Deep links return the User to the intended authorized destination after authentication when safe.
- Automatic or deceptive account linking is prohibited.

## 13. Remember This Device UX

- Personal mobile devices may default to remembered-session eligibility, subject to product policy and explicit disclosure.
- Shared or public devices must clearly offer a non-persistent session path.
- The interface communicates a user-readable session duration and that the session expires and can be revoked.
- No wording may imply permanent or irrevocable login.
- Device management lists active sessions with a user-readable device label.
- The current device is clearly marked.
- Last-used time is displayed where reliable.
- Users can revoke individual devices and all devices.
- Sensitive security changes and suspicious activity should generate appropriate security notifications when that capability exists.

## 14. Security Boundaries

- CSRF protection applies to cookie-authenticated state-changing requests.
- XSS prevention remains critical because script execution can act through an authenticated browser even when HttpOnly protects the credential value.
- Login, registration, linking, reset, refresh, and verification endpoints require rate limiting and abuse controls.
- Credential stuffing defenses must not rely on one control alone.
- Login responses should reduce account-enumeration disclosure while remaining usable.
- Session fixation is prevented.
- Refresh/session rotation and reuse detection are required.
- Authentication and security events are auditable.
- OAuth client configuration and application secrets remain environment-managed and are never stored in Blueprint or frontend code.
- HTTPS is required in production.
- Redirect and origin allowlists are explicit and minimal.
- Provider tokens are not persisted unless separately approved.
- Internal authorization is checked on every protected request.
- Authentication success does not imply workspace, branch, employee, or administrator authorization.
- Error handling must not expose credentials, provider tokens, token families, or sensitive security metadata.

## 15. Audit Events

Conceptual events include:

- `auth.login.succeeded`
- `auth.login.failed`
- `auth.google.linked`
- `auth.google.unlinked`
- `auth.session.created`
- `auth.session.rotated`
- `auth.session.revoked`
- `auth.logout.all`
- `auth.passkey.registered`
- `auth.passkey.used`
- `auth.passkey.removed`
- `auth.refresh.reuse_detected`

Audit records must avoid plaintext passwords, refresh credentials, ID tokens, biometric data, and secrets.

## 16. API Contract Boundary

Command-oriented endpoint groups are defined conceptually for:

- Google authentication and callback/credential verification.
- Session refresh.
- Current session/device list.
- Current-device logout.
- Revoke a selected device.
- Revoke all devices.
- Passkey registration options.
- Passkey registration verification.
- Passkey authentication options.
- Passkey authentication verification.
- Link Google account.
- Unlink Google account.

Endpoints must express explicit commands and reads. No generic authentication-status mutation endpoint is allowed.

This Blueprint does not prescribe final route names, request bodies, database schema, or implementation language changes.

## 17. Migration and Compatibility

- Existing email/password login remains supported throughout V1 rollout.
- Existing Users and internal profiles remain authoritative.
- Existing sessions may continue until an approved migration or expiry policy replaces them.
- Rollout is staged by environment and capability stage.
- Google and Passkey availability depends on environment configuration and approved origins.
- Local development uses non-production configuration without weakening production requirements.
- Backward compatibility is preserved until replacement behavior is verified and explicitly approved.
- Rollback can disable new authentication entry points while preserving email/password access.
- Passkey adoption is optional in V1 and must not be forced.
- Frontend uses the existing authentication architecture unless a later implementation plan explicitly defines a migration boundary.
- Backend implementation remains CommonJS.

## 18. Implementation Sequence

### Stage A — Persistent Device Session

Establish short-lived access authentication, server-managed rotating sessions, secure cookie handling, expiry, revocation, reuse detection, and logout boundaries.

### Stage B — Mobile Login/Register UX

Improve mobile sign-in, registration, password recovery, keyboard safety, accessibility, loading, and duplicate-submit behavior without changing business authorization.

### Stage C — Google Sign-In and Account Linking

Add server-verified Google identity, explicit account linking, duplicate prevention, conflict handling, and employee-authorization isolation.

### Stage D — Device Session Management

Add current-device identity, device list, remote revocation, logout-all, last-used information, and lost-device response.

### Stage E — Passkey/WebAuthn

Add registration, authentication, multiple-passkey management, removal, fallback, and recovery-safe behavior.

### Stage F — Human Security and Mobile Verification

Verify supported mobile and desktop flows, security boundaries, authorization isolation, recovery, expiry, revocation, and regression behavior.

The sequence is architectural ordering only and does not record execution state.

## 19. Human Reality Gate

Required Human verification includes:

- Android Chrome.
- iPhone Safari where available.
- Google first-time customer sign-up.
- Existing-account Google login.
- Account-link conflict.
- Employee not automatically authorized.
- Refresh after browser restart.
- Idle expiry.
- Absolute expiry.
- Logout current device.
- Revoke another device.
- Logout all devices.
- Expired credential behavior.
- Rotated or reused credential behavior.
- Passkey registration.
- Passkey login.
- Passkey fallback and recovery.
- Shared-device behavior.
- Browser back and protected deep links.
- No sensitive refresh/session credential visible in localStorage.
- No HTTP 500 for expected authentication or authorization outcomes.
- Existing email/password login regression.
- Desktop authentication regression.

Automated checks do not replace the Human Reality Gate.

## 20. Definition of Done

The Authentication Experience capability conforms to this Blueprint when:

- Email/password remains operational during the approved migration window.
- Persistent sessions are expiring, rotating, revocable, server-managed, and not stored in frontend localStorage.
- Google identity is verified server-side and cannot elevate employee or administrator authorization.
- Account linking is explicit, conflict-safe, and duplicate-resistant.
- Employee access still requires approved internal profile and assignment.
- Device-session management supports current logout, remote revocation, and logout all.
- Passkey/WebAuthn stores public-key credential material only and never biometric templates.
- Recovery retains at least one usable authentication path.
- Protected requests perform server-side authorization checks.
- Mobile, shared-device, security, deep-link, and desktop-regression behavior passes Human verification.
- Expected failures return controlled responses and do not produce HTTP 500.
- No product behavior outside the approved authentication boundary is changed.

## 21. Out of Scope

- Social providers other than Google.
- Native Android or iOS biometric APIs.
- Collection, transmission, or storage of biometric data.
- Google Drive, Gmail, Calendar, or other Google API authorization.
- Automatic employee approval.
- Automatic administrator approval.
- Full enterprise SSO or SAML.
- Passwordless-only enforcement.
- Native mobile application.
- Concrete React, CSS, Tailwind, Prisma, migration, secret, client-ID, or deployment implementation.
- Completion of the full Cross-Platform or Mobile Experience capability.

## 22. Blueprint Lock

Authentication Experience Blueprint V1 is `LOCKED` as the architectural and product-contract source of truth.

The following decisions are locked:

- Persistent device session precedes Google and Passkey implementation.
- Google proves external identity only and cannot elevate internal authorization.
- Internal User role, EmployeeProfile, branch, position, workspace, and permissions remain server-controlled.
- Passkey/WebAuthn provides biometric-backed device authentication without application access to biometric templates.
- Remembered login remains expiring, rotating, revocable, and server-managed.
- Refresh/session credentials are prohibited from frontend localStorage.
- Existing email/password remains supported during staged rollout.
- Employee access requires approved internal profile and assignment.
- This Blueprint does not complete the full Mobile Experience capability.

Any change to these identity, authorization, session, provider-linking, passkey, recovery, or security boundaries requires explicit Blueprint revision and approval.