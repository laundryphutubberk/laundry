# Deployment Architecture

Status: APPROVED

## Repository and ownership

| Path | Component | Runtime owner |
| --- | --- | --- |
| `frontend/` | React/Vite SPA | Vercel; Root Directory `frontend` |
| `backend/` | Express/Prisma API | Render; Root Directory `backend` |
| `project-os-v2/` | Governance and evidence | Not deployed |
| Supabase PostgreSQL | Persistent data | Supabase dashboard/platform |

There is no repository-root Node package. Package manifests and lockfiles are component-local and must be installed from their respective Root Directories.

## Topology and branch contract

GitHub is the source repository. Preview maps a feature branch to a Vercel Preview frontend and a branch-compatible Render Preview backend (or an explicitly approved compatible backend), using the development database. Production maps `main` to Vercel Production and Render Production, using production-configured environment/database state. A Preview frontend must never silently call an incompatible Production backend.

Frontend calls the backend URL compiled into `VITE_API_BASE_URL`; the backend connects to Supabase through `DATABASE_URL`. `project-os-v2` is never a runtime artifact.

## Trust boundaries

- CORS: backend `CORS_ORIGINS` is an exact comma-separated allowlist. Credentialed requests prohibit wildcard origins.
- Cookies: the backend issues an HttpOnly, SameSite=Lax device-session cookie scoped to `/api/auth`; HTTPS/`NODE_ENV=production` is required for Secure delivery.
- OAuth: Google Authorized JavaScript Origins must list each intended frontend origin exactly. Backend and frontend use the same OAuth Web client identity, without exposing a client secret.
- Migrations: an approved operator/deployment job runs `npx prisma migrate deploy` from `backend/`; application startup does not silently migrate.

## Control ownership

Repository-controlled: component manifests/lockfiles, Vite build, backend start command, Prisma schema/migrations, `frontend/vercel.json` SPA fallback, and these contracts.

Dashboard-controlled: Vercel/Render Root Directory, branch mapping, domains, environment values, deployment cache/redeploy, service creation, health checks, and Supabase credentials. No dashboard change is claimed by this mission.

## Rollback boundary

Vercel and Render roll back independently to previously verified deployments. Database migrations require an explicit forward-fix or separately approved rollback; never assume an application rollback reverses schema changes. Contract-compatible frontend/backend pairs must be restored together.

## Drift and incident evidence

Deployment drift means deployed branch, commit, Root Directory, build command, environment, or cross-runtime contract differs from this source of truth.

Observed incident: Vercel Production built `main` at `ba9d740` from repository root, installed approximately 39 root-level packages, and frontend build exited `127`; correct source is under `frontend/`. Google Registration exists on feature commit `d3a0518`, and its Vercel Preview built successfully, but called an older Production Render backend. That backend returned wildcard CORS to a credentialed request, which the browser rejected. Current `src/app.js` uses an exact allowlist. Root cause is deployment drift, not Google Registration logic.
