# Mutation Feedback Contract

Status: Active
Owner: Frontend Architect / Backend Architect

## Purpose

Define how frontend mutation failures and successes are presented without leaking internal implementation details or relying on raw error text.

## Backend Error Input

Frontend expects the approved error envelope:

```json
{
  "success": false,
  "error": {
    "code": "WORK_STATUS_TRANSITION_DENIED",
    "message": "Safe human-readable message",
    "requestId": "REQ-ID",
    "timestamp": "ISO-8601",
    "details": {}
  }
}
```

## Mapping Rules

| Error Type | Primary UI |
|---|---|
| Field validation | Field error and error summary |
| Workflow/business rejection | MutationFeedbackBanner or dialog alert |
| Permission/policy rejection | Banner with safe explanation |
| Conflict/idempotency | Banner with refresh/retry guidance |
| Network/transient failure | Retry-capable banner |
| Unexpected server error | Generic safe message plus requestId |

## Core Rules

- Never parse behavior from the error message string.
- Use `error.code` for deterministic UI mapping.
- Show `requestId` for support/debugging when available.
- Never show stack traces, SQL, tokens, headers, or raw provider payloads.
- Preserve user-entered form data after recoverable failure.
- Prevent duplicate submission while mutation is pending.
- Retry must be explicit and safe for the operation.
- Success feedback must not hide important resulting state.

## Contract Template

```text
Mutation:
Success state:
Known error codes:
Banner mapping:
Field mapping:
Retry allowed:
Request ID shown:
Focus target on failure:
State preserved:
Duplicate-submit prevention:
```

## Verification

- Known error codes map to intended UI.
- Unknown errors use safe fallback.
- Request ID is displayed where appropriate.
- Pending state prevents duplicate submission.
- Failure restores focus according to Focus Management Contract.
- Browser console contains no sensitive mutation payload.
