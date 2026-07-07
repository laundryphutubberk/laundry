# BE-03.01 Route Inventory Freeze

Status: FROZEN
Mode: Documentation / Contract Only
Owner: Backend Architecture
Project: laundryphutubberk/laundry

## Approval Scope

Approved scope:

- Freeze the current REST route map.
- Document current route grouping.
- Document known gaps for BE-03.03+.

Not approved in this phase:

- Runtime route behavior changes
- Controller split
- API version migration
- Authentication middleware
- Authorization redesign
- Error code standard
- schema.prisma changes
- Frontend changes

## Current Route Mount Root

All backend API routes are mounted under:

```text
/api
```

## Frozen Route Map

| Method | Path | Route Module | Notes |
|---|---|---|---|
| GET | /api/health | backend/src/routes/index.js | Runtime health endpoint |
| GET | /api/laundry/works | backend/src/routes/laundryWorks.routes.js | List Laundry Works |
| GET | /api/laundry/works/:workId | backend/src/routes/laundryWorks.routes.js | Get Laundry Work detail |
| POST | /api/laundry/works | backend/src/routes/laundryWorks.routes.js | Create Laundry Work |
| PATCH | /api/laundry/works/:workId/status | backend/src/routes/laundryWorks.routes.js | Update Laundry Work status |
| GET | /api/laundry/works/:workId/bags | backend/src/routes/laundryBags.routes.js | List bags under a work |
| GET | /api/laundry/works/:workId/bags/:bagId | backend/src/routes/laundryBags.routes.js | Get bag detail under a work |
| POST | /api/laundry/works/:workId/bags | backend/src/routes/laundryBags.routes.js | Create bag under a work |

## Route Grouping

```text
backend/src/routes/index.js
  GET /health
  USE /laundry/works -> laundryWorks.routes.js
  USE /laundry/works/:workId/bags -> laundryBags.routes.js
```

## Controller Structure

No separate controller layer is frozen in this phase.

Current route modules act as thin controllers by:

- parsing request query / params / body
- calling service functions
- returning the shared response envelope
- forwarding errors to the error middleware

## API Version Strategy

No API version prefix is frozen in this phase.

Current strategy remains:

```text
/api
```

Changing to `/api/v1` is not approved in BE-03.01 or BE-03.02.

## Authentication and Authorization Boundary

No authentication middleware or authorization boundary is frozen in this phase.

Auth and workspace boundary redesign is explicitly deferred to:

```text
BE-07 Policy and Domain Rules
```

## Gap List for BE-03.03+

- Controller layer is not separated.
- API version strategy is not defined.
- Authentication middleware is not part of the current route boundary.
- Authorization still needs BE-07 policy design.
- Error code standard is not defined.
- More API contracts are needed for future domain resources.
