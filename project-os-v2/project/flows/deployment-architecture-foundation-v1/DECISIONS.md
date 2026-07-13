# Decisions

- Vercel Root Directory is `frontend`; Render Root Directory is `backend`; Project OS is not deployed.
- Preview and Production are separate branch/environment contracts. Preview cannot silently use an incompatible Production backend.
- Dashboard controls Root Directory, branches, domains, environment values, and services.
- Repository controls component commands and `frontend/vercel.json` SPA fallback.
- `render.yaml` is deferred to avoid duplicating or changing existing services.
- Preview registration is public for milestone testing; Production registration stays disabled.
- Migrations run explicitly with `npx prisma migrate deploy`, never implicitly on startup.
