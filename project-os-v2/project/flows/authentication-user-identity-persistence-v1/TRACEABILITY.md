# User Identity Persistence Traceability

Status: ACTIVE

- Blueprint: `project/blueprints/AUTHENTICATION-EXPERIENCE-BLUEPRINT-V1.md`.
- Persistence: Prisma `UserIdentity` owned by central `User`.
- Backend: identity repository → identity domain service.
- Verification: focused real DB ownership, uniqueness, snapshot, revocation, authorization and cascade checks.
