# Laundry Issue Verification Commands

Status: READY_TO_RUN
Task Status: IMPLEMENTED_PENDING_RUN_EVIDENCE

## Purpose

Provide one repeatable command sequence for the remaining repository and runtime evidence gate.

This document does not claim PASS until command output and runtime evidence are recorded from a runnable checkout.

## Backend Repository Verification

```bash
cd backend
npm install
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate deploy
npm run verify:laundry-issue:all
```

The combined verifier executes:

```bash
npm run verify:laundry-issue
npm run verify:laundry-issue-http
```

## Existing Backend Quality Verification

```bash
npm run verify:runtime
npm run verify:policy
npm run verify:service-policy
npm run verify:http-policy
npm run verify:be07
```

## Frontend Verification

```bash
cd frontend
npm install
npm run build
npm run lint
npm run dev
```

## Runtime Controlled Run

Use:

- `CONTROLLED-RUN-CHECKLIST.md`
- `V2-COUNT-LINE-LINKAGE-RUN.md`
- `PRE-RUN-READINESS.md`

Record at minimum:

```text
Date/time:
Environment:
Commit SHA:
Command:
Exit code:
Output reference:
Frontend URL:
Backend URL:
Actor/workspace:
Work ID:
Bag ID(s):
Count Line ID(s):
Issue ID(s):
Request ID(s):
Screenshot/log reference:
Result: PASS | FAIL | BLOCKED
Recovery/notes:
```

## Completion Rule

Do not mark Laundry Issue `COMPLETED` from repository inspection alone.

Completion still requires:

1. Prisma format/validate/generate/deploy evidence after schema alignment.
2. Combined service and HTTP verifier PASS evidence.
3. Frontend build and lint evidence.
4. Controlled runtime evidence for V1–V10.
5. Final handoff and synchronized `STATUS.md` / `TASK-INDEX.md` update.
