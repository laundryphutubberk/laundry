# Authentication Experience V1 — Google Login (Existing Identity)

Document Status: APPROVED
Work Status: COMPLETED
Mission Result: PASS

Google Login for an existing Laundry User who already has an active linked Google identity. Password login and account linking/unlinking remain supported. Access sessions use Session Storage; durable remember-device restoration is authorized only by the HttpOnly device-session cookie and startup refresh.

Flow: authentication-google-login-existing-identity-v1

Known limitation: First-time Google onboarding / Google registration remains NOT_STARTED.
