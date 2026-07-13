# Vercel Configuration Contract

Status: APPROVED

Recommended project: `laundry-frontend` (or intentionally aligned current project).

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Production Branch | `main` |
| Preview | Non-production branches unless restricted |

Preview `VITE_API_BASE_URL` must target a contract-compatible Preview backend and `VITE_GOOGLE_CLIENT_ID` must be present. Production variables target Production services. `VITE_*` values are injected at build time, so changes require redeployment.

Preview URLs differ from the Production/custom domain; a custom Production domain does not follow a feature branch. Google Authorized JavaScript Origins must include every intended Preview or stable test origin. `frontend/vercel.json` provides React Router history fallback after the dashboard Root Directory is set to `frontend`; it does not configure Root Directory or dashboard environments.

No Vercel dashboard change was performed or verified by this mission.
