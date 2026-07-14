# Deployment Runbook

Status: APPROVED

Dashboard actions below are operator procedures; this mission performed none.

## One-time Production backend automation

1. Open Render service `laundry-backend` and select **Settings > Build & Deploy**.
2. Confirm the repository is the connected GitHub repository `laundryphutubberk/laundry`, the branch is `main`, and Root Directory is `backend`.
3. Confirm Build Command is `npm install && npx prisma generate` and Start Command is `npm start`.
4. Set **Auto-Deploy** to **On Commit**. Do not use **After CI Checks Pass** because this repository currently exposes no qualifying GitHub check run for Render to wait on.
5. Leave Build Filters empty. Root Directory `backend` already prevents frontend-only and governance-only commits from triggering Render.
6. Save the setting. Do not use **Deploy a specific commit** for the validation run because that action disables Auto-Deploy again.
7. Push an approved backend-only marker or the next verified backend change to `main`; observe a new automatic Event without dashboard interaction.
8. Confirm the Event source branch is `main`, its commit SHA equals `origin/main`, health/database health pass, and explicit credentialed CORS remains unchanged.

If the GitHub repository or branch cannot be selected, reconnect/authorize the Render GitHub App for `laundryphutubberk/laundry`; do not replace it with a public Git URL because public-URL services cannot auto-deploy.

1. In Vercel, create/reconfigure the frontend project: repository, Root Directory `frontend`, Vite, `npm install`, `npm run build`, output `dist`, Production branch `main`.
2. In Render, create a separate Preview Web Service only when authorized: Root Directory `backend`, selected feature branch, build `npm install && npx prisma generate`, start `npm start`.
3. Configure Preview variables from the matrix. Set `AUTH_GOOGLE_REGISTRATION_MODE=PUBLIC_LAUNDRY_ONBOARDING`, exact Preview `CORS_ORIGINS`, and a Preview-compatible `VITE_API_BASE_URL`.
4. Configure Production separately and keep `AUTH_GOOGLE_REGISTRATION_MODE=DISABLED`.
5. Redeploy without cache from the dashboard when dependency/root/env drift is suspected; verify the selected commit in deployment metadata.
6. Confirm logs show Vite executing from `frontend` and emitting `dist/`.
7. Confirm Render metadata/logs show the expected branch/commit, Prisma generation, and `npm start` from `backend`.
8. Test CORS preflight in PowerShell:

   ```powershell
   Invoke-WebRequest -Method Options -Uri 'https://BACKEND/api/auth/session/refresh' -Headers @{ Origin='https://FRONTEND'; 'Access-Control-Request-Method'='POST' }
   ```

   Confirm the allow-origin value is the exact frontend origin and credentials are allowed.
9. Test session refresh using browser DevTools because the device credential is HttpOnly; confirm cookies are sent and no wildcard CORS appears.
10. In Preview only, register a new Google account, confirm `/onboarding`, workspace blocking, and both remember-device modes.
11. Promote only tested compatible commits through review/merge to `main`; allow each production service to deploy its mapped commit.
12. Roll back Vercel to a previously verified deployment and confirm its backend contract.
13. Roll back Render to a compatible previous deployment; treat database rollback as a separate approved operation.
14. Blank page: inspect browser console/assets, confirm `dist`, SPA rewrite, build-time API URL, and direct-route refresh.
15. Stale commit: compare dashboard commit SHA with `git rev-parse HEAD`; prefer **Deploy latest commit** for recovery. If a specific-commit recovery is unavoidable, restore Auto-Deploy to **On Commit** afterward.
16. Wrong Root Directory: build logs showing root install or missing Vite indicate drift; correct to `frontend`/`backend` and redeploy.
17. Preview calling Production: inspect compiled network URL, correct Preview `VITE_API_BASE_URL`, rebuild Vercel Preview, and verify backend SHA/CORS.

Local verification commands:

```powershell
Set-Location D:\laundry\frontend
npm install
npm run lint
npm run build
Set-Location D:\laundry\backend
npm install
npx prisma validate
npx prisma generate
npx prisma migrate status
```
