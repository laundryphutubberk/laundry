# Laundry Issue Validation

Store real run evidence here.

## Start Here

- `AUTOMATED-RUN-2026-07-10.md` — real service and HTTP verification evidence from the runnable checkout
- `MANUAL-UI-RUN.md` — browser validation for create, linkage, relink, unlink, cancel, resolve, summary sync, duplicate-submit, terminal UI, and permissions
- `RUN-COMMANDS.md` — repository commands for Prisma, backend verification, frontend build, lint, and runtime
- `CONTROLLED-RUN-CHECKLIST.md` — full completion-gate checklist
- `V2-COUNT-LINE-LINKAGE-RUN.md` — focused runtime sheet for valid linkage, invalid cross-bag protection, persistence, relink, and unlink
- `PRE-RUN-READINESS.md` — implementation readiness inspection; not runtime PASS evidence
- `AUTOMATED-VALIDATION.md` — automated coverage contract and command references
- `SCHEMA-ALIGNMENT-HANDOFF.md` — Prisma schema alignment background
- `SCHEMA-MIGRATION-DRIFT.md` — original verified schema/migration drift evidence
- `project-os/frontend/execution/fe-08-laundry-issue/FE-08-ISSUE-EXTENDED-VALIDATION.md` — source validation contract

## Required Evidence

- Commands executed
- Build/lint/typecheck results
- API status codes
- Runtime screenshots or log references
- Functional PASS/FAIL result
- Workspace and permission result
- Blocker and recovery evidence when applicable
- Related commit SHA

## Current Validation State

- Automated service verification: `PASS`
- Automated HTTP verification: `PASS`
- Manual browser validation: `PENDING_RUN`
- Prisma post-alignment verification: `PENDING_RUN`
- Frontend lint: `PENDING_RUN`
- Final handoff: `DRAFT_PENDING_MANUAL_UI_EVIDENCE`

## Completion Rule

Conversation confirmation or repository review alone is not completion evidence.

The Laundry Issue Task remains `AUTOMATED_VALIDATION_PASSED` until Prisma/frontend command evidence and controlled browser validation are recorded, the final handoff is completed, and `STATUS.md` plus `TASK-INDEX.md` are updated together.
