# Frontend AI Task Return Contract Template

## 1. Task Identification

- Task ID:
- Target FE phase/module:
- Execution token:
- Base commit:
- Result commit:

## 2. Inputs

- Approved screen/workflow contract:
- API contract:
- Structure blueprint:
- Capability matrix row:
- Relevant backend readiness:

## 3. Allowed Scope

- Files allowed:
- Behaviors allowed:
- Shared components allowed:
- Explicitly forbidden:

## 4. Success Criteria

- [ ] Requested workflow implemented without unapproved API changes.
- [ ] State ownership follows the frontend structure blueprint.
- [ ] Production build passes.
- [ ] Lint/type checks pass where available.
- [ ] Relevant route/screen smoke verification passes.
- [ ] Accessibility contracts affected by this task pass.
- [ ] No sensitive data is exposed in browser logs or persisted storage.

## 5. Failure Contract

Frontend must consume the approved backend error payload and map it without parsing raw error text.

```json
{
  "success": false,
  "error": {
    "code": "ERR_MODULE_ACTION_SPECIFIC",
    "message": "Safe human-readable message",
    "requestId": "REQ-ID",
    "timestamp": "ISO-8601",
    "details": {}
  }
}
```

Expected UI destination:

- Mutation feedback banner:
- Field error:
- Dialog alert:
- Retry action:
- Request ID visibility:

## 6. Verification Evidence

Paste exact outputs for commands that actually exist:

```text
lint/type check:
build:
tests:
route/screen smoke:
keyboard verification:
focus verification:
```

Missing commands must be reported as `MISSING_CAPABILITY`, not PASS.

## 7. Return State

- Files changed:
- Contracts preserved:
- Behavior changed:
- Known gaps:
- Blocked by:
- Next recommended task:
