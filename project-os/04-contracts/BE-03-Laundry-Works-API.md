# BE-03 Contract — Laundry Works REST API

Status: ACTIVE
Owner: Backend Architecture
Domain: REST API Layer

## Purpose

This contract defines the initial REST API surface for Laundry Work.

Laundry Work is the operational center of the Laundry production flow.

## Response Envelope

All successful responses use:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

All failed responses use:

```json
{
  "success": false,
  "error": {
    "message": "...",
    "statusCode": 400
  },
  "meta": {
    "requestId": "..."
  }
}
```

Validation errors may include:

```json
{
  "meta": {
    "details": {}
  }
}
```

## Endpoints

### List Laundry Works

```text
GET /api/laundry/works
```

Query parameters:

| Name | Type | Required | Notes |
|---|---|---:|---|
| workspaceType | `LAUNDRY` or `RESORT` | No | When `RESORT`, `resortId` is required |
| resortId | positive integer string | Required for Resort Workspace | Used for workspace isolation |
| status | WorkStatus enum | No | Filters by current status |
| skip | positive integer string | No | Pagination offset |
| take | positive integer string | No | Pagination limit |

Response data:

```json
[
  {
    "id": 1,
    "workNo": "LW-...",
    "resortId": 1,
    "currentStatus": "DRAFT",
    "bagCount": 0,
    "resort": {
      "id": 1,
      "name": "Resort Name"
    },
    "_count": {
      "bags": 0,
      "countLines": 0,
      "issues": 0,
      "movements": 0
    }
  }
]
```

Response meta includes pagination:

```json
{
  "pagination": {
    "total": 0,
    "skip": 0,
    "take": 50
  }
}
```

### Get Laundry Work Detail

```text
GET /api/laundry/works/:workId
```

Query parameters:

| Name | Type | Required | Notes |
|---|---|---:|---|
| workspaceType | `LAUNDRY` or `RESORT` | No | When `RESORT`, `resortId` is required |
| resortId | positive integer string | Required for Resort Workspace | Used for workspace isolation |

Response data includes:

- Laundry Work
- Resort summary
- Bags
- Count Lines
- Issues
- Movements
- Status Logs
- Count summaries

### Create Laundry Work

```text
POST /api/laundry/works
```

Body:

| Name | Type | Required | Notes |
|---|---|---:|---|
| resortId | positive integer | Yes | Resort owner of the work |
| workNo | string | No | Auto-generated when omitted |
| bagCount | integer >= 0 | No | Defaults to 0 |
| receivedDate | ISO datetime string | No | Optional received date |
| note | string | No | Optional note |
| currentStatus | WorkStatus enum | No | Defaults to `DRAFT` |

Returns status `201` on success.

### Update Laundry Work Status

```text
PATCH /api/laundry/works/:workId/status
```

Body:

| Name | Type | Required | Notes |
|---|---|---:|---|
| toStatus | WorkStatus enum | Yes | New work status |
| changedById | positive integer | No | Actor user id |
| changedByName | string | No | Actor display name |
| note | string | No | Optional status note |

Behavior:

- Updates `LaundryWork.currentStatus`.
- Creates `WorkStatusLog`.
- Does not yet enforce status transition policy.

## WorkStatus Enum

```text
DRAFT
BAG_RECEIVED
FACTORY_RECEIVED
BAG_OPENED
ITEM_COUNTED
TYPE_SORTED
COLOR_SORTED
DATA_RECORDED
RETURNED
CLOSED
CANCELLED
```

## Workspace Isolation

Current BE-03 foundation supports explicit query-based isolation:

```text
workspaceType=RESORT&resortId=<id>
```

Auth-derived workspace scope is not implemented yet and must be added before production authorization is considered complete.

## Out of Scope

- Schema changes
- Business flow changes
- Auth policy
- Status transition policy
- Inventory movement calculation
- Runtime test execution through GitHub Connector
