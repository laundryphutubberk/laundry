# Google Linking UX Traceability

Status: ACTIVE

- Blueprint: `project/blueprints/AUTHENTICATION-EXPERIENCE-BLUEPRINT-V1.md`.
- Backend dependency: Stage B3 explicit identity linking/unlinking commands.
- Frontend: workspace user menu → identity management page → controller hook → identity API → Google Identity client.
- Security: provider credential, password and step-up grant remain transient in memory and never enter browser storage.
