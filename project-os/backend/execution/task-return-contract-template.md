# AI Task Return Contract Template

## 1. Task Identification and Context

- **Task ID:** `[e.g. TSK-BE-05-001]`
- **Target Module:** `[e.g. be-05-business-layer/laundry-issue]`
- **Execution Token:** `[active token from EXECUTION-STATE-LOCK.json]`
- **Base Commit Hash:** `[insert Git commit SHA]`
- **Approved Gate:** `[discovery / implementation / verification / freeze]`

## 2. Execution Deliverables

- [ ] Code implements the approved design without changing existing signatures unless explicitly authorized.
- [ ] Relevant verification scripts pass.
- [ ] Runtime and smoke checks pass where applicable.
- [ ] Lint, test, and build commands were executed when those scripts exist.
- [ ] No protected file or contract was changed outside the approved gate.

> Do not report a missing test/build script as a passing test. Record it as `NOT AVAILABLE` with evidence.

## 3. Failure Contract Specification

Any exception returned through the HTTP/API boundary must conform to the approved global error envelope:

```json
{
  "success": false,
  "error": {
    "code": "ERR_MODULE_ACTION_SPECIFIC",
    "message": "Human-readable message suitable for MutationFeedbackBanner",
    "requestId": "REQ-HEX-TIMESTAMP",
    "timestamp": "2026-07-10T20:00:00Z",
    "details": {}
  }
}
```

### Rules

- Domain and service errors must be mapped into the approved error contract before the response leaves the API boundary.
- Database, network, and provider errors must not leak sensitive implementation details.
- `requestId` must correlate the returned error with runtime logs.
- Error `code` must be stable and machine-readable.
- `message` must remain safe for end-user feedback.
- Validation details belong in `details` only when the API contract permits them.
- Do not change the existing response envelope without Contract Gate approval.

## 4. State and Dependency Return

Report:

```text
Previous execution state:
New execution state:
Dependencies satisfied:
New blockers:
Stop condition triggered:
Recommended next token:
```

When execution state changes, update:

```text
project-os/backend/execution/EXECUTION-STATE-LOCK.json
```

The state update must reflect verified repository/runtime evidence, not intended architecture.

## 5. Verification Logs

Paste exact terminal output, including failures and unavailable scripts:

```bash
npm run test
npm run build
npm run verify:runtime
```

Use only commands that exist in the current package scripts. Record skipped or unavailable commands explicitly.

## 6. Required Return Report

```text
Files changed:
Commits:
Behavior changed:
API contract changed:
Schema/migration changed:
Workspace boundary changed:
Verification evidence:
Remaining blockers:
Freeze recommendation:
```
