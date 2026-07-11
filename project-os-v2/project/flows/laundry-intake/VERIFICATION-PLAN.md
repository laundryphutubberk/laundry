# Laundry Intake Verification Plan

Status: APPROVED

The permission and atomicity decisions are approved. Automated verification is active.

## Required Areas

- active and inactive Resort creation rules;
- generated and custom Work-number uniqueness;
- concurrent Work-number behavior;
- atomic or recoverable initial bag intake;
- Work bag-count consistency;
- authenticated actor and Workspace policy;
- status transition matrix;
- audit identity integrity;
- Draft delete versus active Work cancellation;
- list/detail normalization and pagination;
- browser create/list/detail/refresh flow;
- Resort visibility and prohibited actions;
- regression for downstream Issue and Image hosts.

## Current State

- Backend runtime verification: `PASSED`
- Backend service and HTTP policy regressions: `PASSED`
- Resort generic operational transition denial: `PASSED`
- Frontend lint and production build: `PASSED`
- Atomic intake service test: `PASSED`
- Database atomicity, rollback, cleanup, and generated-number concurrency: `PASSED`
- Browser create/list/detail/refresh with two initial Bags: `PASSED` (user-observed, 2026-07-11)
