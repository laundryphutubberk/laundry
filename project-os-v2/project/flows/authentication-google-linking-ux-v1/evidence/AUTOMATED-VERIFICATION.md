# Google Linking UX Automated Verification

Status: ACTIVE

- Linking Frontend: IMPLEMENTED_AND_VERIFIED.
- Identity management entry and safe method list: PASS.
- Explicit link confirmation and password step-up orchestration: PASS.
- Cancel/terminal cleanup, duplicate-submit lock and server-truth refresh: PASS.
- Explicit unlink confirmation and password step-up orchestration: PASS.
- Sensitive linking material absent from frontend storage code paths: PASS.
- Mobile-safe dialog, wrapping, touch targets and actions: PASS by implementation/build; Human Test PASSED.
- Frontend focused verification/lint/build: PASS.
- Stage B3, Stage A, B1 and B2 backend regressions: PASS.
- Google Login and Onboarding: NOT_STARTED.
- Human Test: PASSED.

## Human Browser Test — 2026-07-12

PASS:
- Google Identity account chooser opened successfully
- Real Google credential verified by Backend
- Safe Google account summary displayed before linking
- Account was not linked automatically
- Explicit confirmation required
- Incorrect password returned STEP_UP_FAILED
- Incorrect password produced exactly one step-up request
- No session refresh followed STEP_UP_FAILED
- No duplicate step-up request occurred
- Correct password step-up succeeded
- Google identity linking completed
- Identity list refreshed from server truth
- Linked Google identity persisted after page reload
- Unlink confirmation dialog displayed
- Unlink required password step-up
- Google identity unlink completed
- Identity list refreshed after unlink
- Browser Local Storage contained no Google credential, ID token,
  provider token, link-intent secret, or step-up grant
- Browser Session Storage contained no Google or linking secret

KNOWN EXPECTED STORAGE:
- laundry.auth.session
- laundry.auth.token

These contain the Laundry access session only.
The refresh/device-session credential remains in the protected HttpOnly cookie.

## Targeted Defect Verification — Wrong-password duplicate retry

The authenticatedFetch function in authApi.ts was patched to inspect
body.meta.code on 401 responses. Only AUTHENTICATION_REQUIRED triggers
a session refresh + retry. STEP_UP_FAILED and every other business/domain
401 return the original response immediately.

Human test confirmed:
- Incorrect password produced exactly one step-up request
- No session refresh followed STEP_UP_FAILED
- No duplicate step-up request occurred
