# Persistent Device Session Stage A Automated Verification

Status: ACTIVE

- Focused real DB/HTTP verification: PASS.
- Login without remember-device: PASS.
- Login with remember-device and protected cookie: PASS.
- Rotation and old-credential reuse family revocation: PASS.
- Concurrent refresh permits one rotation and rejects/revokes the reused family: PASS.
- Idle and absolute expiry controlled 401: PASS.
- Current logout, selected revoke and logout-all: PASS.
- Session list excludes credential hashes: PASS.
- No plaintext refresh credential persisted: PASS.
- Resort actor role/workspace/resort context preserved: PASS.
- Backend runtime and policy regressions: PASS.
- Prisma validate: PASS.
- Frontend lint/build: PASS.
- Initial human browser test: FAIL — persistent cookie existed, but browser restart made no refresh request and Login remained visible.
- Root cause: persisted local access session suppressed startup refresh; root and Login routing did not honor restored authentication.
- Targeted fix: startup now attempts one authoritative cookie refresh before rendering; stale local state cannot suppress it; authenticated root/Login routing uses the initialized session.
- Valid transient access is preserved only after the startup refresh attempt and only while its JWT remains unexpired.
- Targeted-fix Frontend lint/build: PASS.
- Human verification: RETEST_REQUIRED; not marked passed.
