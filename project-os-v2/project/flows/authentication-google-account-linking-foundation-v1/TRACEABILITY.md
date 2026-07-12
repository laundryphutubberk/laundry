# Google Account Linking Foundation Traceability

Status: ACTIVE

- Blueprint: `project/blueprints/AUTHENTICATION-EXPERIENCE-BLUEPRINT-V1.md`.
- Foundations: Stage A DeviceSession, Stage B1 Google verification and Stage B2 UserIdentity.
- Backend: auth routes → identity linking controller → transactional linking service → Prisma intents/grants/identity.
- Verification: focused real DB/HTTP linking, unlinking, expiry, replay, race, context, ownership and authorization checks.
