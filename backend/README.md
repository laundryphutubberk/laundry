# Laundry Backend Runtime

## Runtime commands

- `npm run dev` starts the backend with nodemon.
- `npm run start` starts the backend with node.
- `npm run verify:runtime` loads the backend runtime modules and checks runtime schema requirements.

## Required environment

Create `backend/.env` from `backend/.env.example`.

Required keys:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`

## Health endpoint

```text
GET /api/health
```

The health response includes runtime status, uptime, timestamp, request metadata, and database dependency status.

## BE-01 notes

This backend runtime baseline owns server startup, app bootstrap, config loading, Prisma client bootstrap, middleware order, response envelope, error handling, route mount, health check, and shutdown wiring.

Business logic and business rules are intentionally outside this runtime foundation.

Known remaining gap: `backend/prisma/schema.prisma` still needs direct generator and datasource alignment if the current file does not include `generator client` and `url = env("DATABASE_URL")`.
