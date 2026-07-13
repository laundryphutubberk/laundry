# Persistent Device Session Stage A Traceability

Status: ACTIVE

- Blueprint: `project/blueprints/AUTHENTICATION-EXPERIENCE-BLUEPRINT-V1.md`.
- Backend path: auth routes → controller → service → repository → Prisma DeviceSession.
- Frontend path: Login remember-device choice → auth API/session bootstrap → one-retry authenticated transport → existing capability APIs.
- Authorization remains the existing bearer actor and workspace policy path.
