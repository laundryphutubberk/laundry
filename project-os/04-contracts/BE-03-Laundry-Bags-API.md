# BE-03.02 Contract — Laundry Bags REST API

Status: ACTIVE
Mode: Documentation / Contract Only
Owner: Backend Architecture
Project: laundryphutubberk/laundry

## Purpose

This contract documents the current Laundry Bags REST API surface.

Laundry Bag is the intake unit under Laundry Work.

This contract freezes the current behavior only. It does not approve runtime behavior changes.

## Parent Resource

Laundry Bags are nested under Laundry Work:

```text
/api/laundry/works/:workId/bags
```

## Response Envelope

Successful responses use the shared response envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

Failed responses use the shared error envelope:

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

### List Laundry Bags

```text
GET /api/laundry/works/:workId/bags
```

Path parameters:

| Name | Type | Required | Notes |
|---|---|---:|---|
| workId | integer-like path param | Yes | Parent Laundry Work id |

Query parameters:

| Name | Type | Required | Notes |
|---|---|---:|---|
| workspaceType | LAUNDRY or RESORT | No | When RESORT, resortId is required by service behavior |
| resortId | positive integer string | Required for Resort Workspace | Used for workspace filtering |
| status | RECEIVED, OPENED, COUNTED, CLOSED | No | Filters bag status |
| skip | positive integer string | No | Pagination offset |
| take | positive integer string | No | Pagination limit |

Response data:

```json
[
  {
    "id": 1,
    "workId": 1,
    "resortId": 1,
    "bagNo": "BAG-001",
    "status": "RECEIVED",
    "receivedAt": "...",
    "openedAt": null,
    "note": null,
    "work": {
      "id": 1,
      "workNo": "LW-...",
      "currentStatus": "DRAFT"
    },
    "resort": {
      "id": 1,
      "name": "Resort Name"
    },
    "_count": {
      "countLines": 0
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

### Get Laundry Bag Detail

```text
GET /api/laundry/works/:workId/bags/:bagId
```

Path parameters:

| Name | Type | Required | Notes |
|---|---|---:|---|
| workId | integer-like path param | Yes | Parent Laundry Work id |
| bagId | integer-like path param | Yes | Laundry Bag id |

Query parameters:

| Name | Type | Required | Notes |
|---|---|---:|---|
| workspaceType | LAUNDRY or RESORT | No | When RESORT, resortId is required by service behavior |
| resortId | positive integer string | Required for Resort Workspace | Used for workspace filtering |

Response data includes:

- Laundry Bag
- Parent Laundry Work summary
- Resort summary
- Count Line count summary

### Create Laundry Bag

```text
POST /api/laundry/works/:workId/bags
```

Path parameters:

| Name | Type | Required | Notes |
|---|---|---:|---|
| workId | integer-like path param | Yes | Parent Laundry Work id |

Body:

| Name | Type | Required | Notes |
|---|---|---:|---|
| bagNo | string | Yes | Human-facing bag number |
| receivedAt | ISO datetime string | No | Defaults in service when omitted |
| note | string | No | Optional note |

Returns status 201 on success.

Current service behavior:

- Creates a Laundry Bag under the parent Laundry Work.
- Uses the parent work resortId.
- Increments parent Laundry Work bagCount.
- If parent work status is DRAFT, changes it to BAG_RECEIVED.
- If status changes from DRAFT to BAG_RECEIVED, creates a WorkStatusLog entry.

## BagStatus Enum

```text
RECEIVED
OPENED
COUNTED
CLOSED
```

## Current Non-Mounted Behavior

The service currently contains an updateLaundryBagStatus function, but the current route map does not mount a PATCH endpoint for bag status.

Therefore this contract does not freeze a public PATCH Laundry Bag status endpoint.

## Workspace Boundary Note

Current behavior supports explicit query-based workspace filtering through workspaceType and resortId.

This is not a production authorization boundary.

Auth-derived workspace boundary is deferred to:

```text
BE-07 Policy and Domain Rules
```

## Out of Scope

- Runtime route changes
- Auth middleware
- Authorization redesign
- API version changes
- Controller split
- Error code standard
- schema.prisma changes
- Frontend changes
