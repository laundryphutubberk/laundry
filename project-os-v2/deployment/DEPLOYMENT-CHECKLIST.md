# Deployment Checklist

Status: APPROVED

## Repository structure change

- [ ] Component directories, manifests, and lockfiles align.
- [ ] Vercel Root Directory is `frontend`; Render Root Directory is `backend`.
- [ ] Frontend build and backend start commands are verified.
- [ ] Render is connected through the GitHub App to `laundryphutubberk/laundry`, branch `main`.
- [ ] Render Auto-Deploy is `On Commit`; Build Filters are empty because Root Directory provides monorepo filtering.

## Frontend Preview

- [ ] Correct branch/commit selected; Vite build and `dist` output observed.
- [ ] Preview API URL targets a compatible backend.
- [ ] Google client ID and OAuth Preview origin are configured.
- [ ] SPA direct-route refresh succeeds.

## Backend Preview

- [ ] Separate Preview service exists and uses the correct branch/commit.
- [ ] `npm install`, Prisma generate, and migration status succeed.
- [ ] Environment validates; exact Preview CORS origin is present.
- [ ] Session refresh endpoint is reachable.

## Production promotion

- [ ] Tested commits are merged to `main`; frontend/backend contracts match.
- [ ] Backend-changing commits auto-deploy on Render; frontend-only commits do not.
- [ ] Vercel and Render deployment metadata match the same `main` SHA when both surfaces change.
- [ ] Production registration mode is `DISABLED`.
- [ ] Production database/environment and rollback targets are confirmed.

## Environment, OAuth, and CORS changes

- [ ] Variable name/scope/environment are correct; no secret is logged.
- [ ] Vite variables trigger rebuild; backend variables trigger restart.
- [ ] OAuth origins and `CORS_ORIGINS` exactly match intended frontend origins.
- [ ] Credentialed preflight returns a specific origin, never `*`.

## Database migration

- [ ] Migration reviewed and backed up/forward-fix plan approved.
- [ ] Run `npx prisma migrate deploy` from `backend` through the approved mechanism.
- [ ] Confirm migration status before application promotion.

## Rollback and post-deployment

- [ ] Restore compatible Vercel and Render deployments; assess DB separately.
- [ ] Verify deployed branch/commit, API base URL, CORS, cookies, refresh, Google flow, `/onboarding`, mobile width, and representative operational APIs.
- [ ] After a specific-commit deploy or rollback, explicitly restore Render Auto-Deploy to `On Commit`.
