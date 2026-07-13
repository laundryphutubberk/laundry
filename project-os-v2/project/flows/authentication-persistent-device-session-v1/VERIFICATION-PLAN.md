# Persistent Device Session Stage A Verification Plan

Status: ACTIVE

- Automated DB/HTTP: remembered and transient login, rotation, reuse, idle/absolute expiry, current logout, logout-all, list and selected revocation, controlled 4xx, credential hashing and actor preservation.
- Regression: backend runtime/policy, Prisma validation, frontend lint/build, Project OS and Git checks.
- Human: remembered browser restart, non-remembered browser restart, current logout, two-device revocation, logout-all, expiry fallback, localStorage inspection and customer/employee authorization regression.
