# Render Configuration Contract

Status: APPROVED

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm install && npx prisma generate` |
| Start Command | `npm start` (`node index.js`) |
| Migration command | `npx prisma migrate deploy` through an approved deployment job |
| Production Branch | `main` |
| Preview Branch | Explicit feature branch on a separate Preview service |

Production must not be temporarily replaced by an unreviewed feature branch. When backend contracts differ, Preview frontend uses a Preview backend. No Preview Render service is claimed to exist.

`CORS_ORIGINS` lists exact frontend origins; `credentials=true` cannot be combined with `Access-Control-Allow-Origin: *`. Dynamic Preview URLs require a managed/stable origin strategy or deliberate allowlist updates. Environment changes require restart/redeploy. A 404 at `GET /` is not failure because no root route exists; use the configured API/health behavior. Free-tier cold starts may delay initial requests.

No `render.yaml` is added: dashboard services already exist, and a blueprint could duplicate or unexpectedly alter production resources.
