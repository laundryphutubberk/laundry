# Laundry Issue Automated Validation

Status: READY_TO_RUN
Task Status: IMPLEMENTED_PENDING_RUN_EVIDENCE

## Command

```bash
cd backend
npm run verify:laundry-issue
```

## Automated Coverage

The verifier now covers:

1. Resort Workspace mutation denial.
2. Terminal Laundry Work mutation denial.
3. Invalid Bag / Count Line pair rejection.
4. Count Line linkage derivation of item type and color.
5. Issue summary synchronization after create.
6. Unlinking Bag and Count Line back to Work-level Issue.
7. Issue summary synchronization after cancellation.
8. Editing a cancelled Issue is rejected.
9. Resolving a cancelled Issue is rejected.

## Evidence Rule

Do not mark this file as PASS until the command is executed in the target repository checkout and the actual console output, date/time, environment, and commit SHA are recorded.

## Result Record

```text
Date/time:
Environment:
Commit SHA:
Command: npm run verify:laundry-issue
Exit code:
Console output:
Result: PENDING_RUN | PASS | FAIL | BLOCKED
Notes:
```

## Manual Evidence Still Required

Automated service-contract verification does not replace the controlled browser/API run for:

- Persisted linkage after refresh.
- Real HTTP status and requestId evidence.
- UI summary refresh.
- UI action availability after cancel/resolve.
- Duplicate-submit behavior under real in-flight latency.
- Cross-workspace and foreign-data behavior against the real database.
- Business log references from the running backend.
- Frontend build, lint, and development runtime startup.
