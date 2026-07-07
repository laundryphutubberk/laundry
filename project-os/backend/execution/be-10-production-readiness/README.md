# BE-10 — Production Readiness

Status: Standard
Scope: Backend Production Readiness
Owner: Backend Architecture
Execution Package: `BE-10-production-readiness.md`

## Purpose

BE-10 is the Backend Production Readiness phase.

Its purpose is to prepare backend changes for safe production delivery under BE-OS standards.

This README is the phase entry point. The detailed execution package remains in `BE-10-production-readiness.md`.

## Scope

BE-10 covers production readiness work, including:

- production checklist
- deployment checklist
- readiness seal
- smoke checks
- rollback planning
- migration risk review
- release notes

## BE-10 Authority

BE-10 is currently in early development.

Within the BE-10 responsibility boundary, the Backend Steward may create, edit, rename, consolidate, or delete BE-10 files when doing so improves the production readiness package.

This authority applies only to BE-10-owned documentation and package structure unless a change outside BE-10 is explicitly required and approved.

## Canonical Documentation Rule

BE-10 uses two primary documents:

- `README.md` is the phase entry point and navigation document.
- `BE-10-production-readiness.md` is the canonical execution specification.

Important BE-10 decisions, structural changes, and responsibility rules must be reflected in both files when relevant.

Milestone files such as `BE-10.01-production-checklist.md` and `BE-10.02-deployment-checklist.md` hold atomic execution details for their specific milestones.

## Prerequisites

The target module or release scope must pass the previous relevant BE phases before entering BE-10.

## Dependencies

BE-10 depends on BE-01 through BE-09 for the target release scope.

## Execution Package

Read the execution package before starting BE-10 work:

- `BE-10-production-readiness.md`

## Current Documents

- `README.md` — phase entry point and navigation
- `BE-10-production-readiness.md` — canonical BE-10 execution package
- `BE-10.01-production-checklist.md` — production readiness checklist
- `BE-10.02-deployment-checklist.md` — deployment checklist

## Allowed Files

BE-10 work may touch:

- production readiness docs
- deployment notes
- release checklist files
- smoke verification docs
- approved configuration docs
- BE-10 milestone documents
- BE-10 package navigation documents

## Forbidden Files

BE-10 work must not include:

- unreviewed feature changes
- unapproved schema changes
- unrelated module refactors
- frontend files unless release coordination explicitly requires notes
- BE-01 through BE-09 package changes unless explicitly approved

## Milestones

- BE-10.01 Production Checklist
- BE-10.02 Deployment Checklist
- BE-10.03 Smoke Verification
- BE-10.04 Rollback Review
- BE-10.05 Readiness Seal

## Atomic Commit Rule

Use one commit per readiness responsibility.

## Definition of Done

```text
□ architecture checklist passes
□ contract checklist passes
□ safety checklist passes
□ observability checklist passes
□ smoke check is defined or completed
□ rollback plan is known when needed
□ readiness seal is declared
```

## Merge Contract

Return:

- commit list
- files changed
- readiness checklist
- verification result
- review result
- known exceptions
- ready-for-merge status

## Freeze Criteria

Freeze BE-10 when the production readiness seal is one of:

- READY
- READY_WITH_NOTES

## Next Phase

After BE-10, continue to production delivery or the next BE-OS roadmap cycle.
