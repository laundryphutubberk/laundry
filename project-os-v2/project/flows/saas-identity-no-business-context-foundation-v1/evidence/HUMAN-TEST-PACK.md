# Phase 1A Human Test Pack

Status: ACTIVE

Human Verification: PASS

Operator-confirmed results: existing password and linked-Google login, operational workspace access, onboarding redirect and direct-workspace block, absence of Laundry API requests during onboarding, logout, remembered/non-remembered restart behavior, storage policy, and approximately 360px mobile layout all passed.

1. Existing password User: login and confirm unchanged operational destination.
2. Existing linked Google User: login and confirm unchanged operational destination.
3. Existing operational workspace: load list/detail and confirm protected APIs succeed.
4. Onboarding fixture: establish an approved test session and confirm authenticated identity details render without operational navigation.
5. Confirm onboarding-only session routes to `/onboarding`.
6. Open `/workspace/laundry/works` directly and confirm redirect to `/onboarding` with no Laundry API request.
7. Log out from onboarding and confirm `/login` plus cleared Session Storage.
8. Remember checked: restart browser and confirm device refresh restores `/onboarding`.
9. Remember unchecked: restart browser and confirm AUTH_SESSION_REQUIRED then `/login`.
10. Inspect storage: access session only in Session Storage; no provider/device credential or subject.
11. Network: no protected Laundry API while onboarding page is active.
12. At mobile width, confirm page readability, logout touch target, and no operational navigation.

Google Registration and Tenant creation are not testable in this phase.
