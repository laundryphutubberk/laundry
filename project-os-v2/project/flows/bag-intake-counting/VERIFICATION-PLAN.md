# Bag Intake and Counting Verification Plan

Status: ACTIVE

## Required Evidence

- Laundry-only mutation and Resort-scoped reads;
- atomic Bag opening and Work status;
- OPENED same-Work Bag required for Count Lines;
- inactive/foreign Item Type rejection;
- duplicate and rapid-submit protection;
- quantity invariants on create/update;
- incomplete completion rejection;
- atomic Bag `COUNTED` plus Work `ITEM_COUNTED` completion;
- downstream-state mutation rejection;
- browser create/edit/delete/refresh;
- downstream Issue and Image host regressions.

## Current Evidence

- backend runtime, service policy, and HTTP policy regressions: `PASSED`;
- real database Bag open, incomplete-completion rejection, Count Line writes, atomic completion, and audit identity: `PASSED`;
- concurrent duplicate dimensional submission: exactly one accepted and one rejected: `PASSED`;
- Prisma schema validation without schema change: `PASSED`;
- Laundry Issue and Laundry Image host regressions: `PASSED`;
- frontend lint and production build: `PASSED`;
- human browser open, create, edit, delete, completion, refresh, and post-completion prevention: `PASSED` (user-observed, 2026-07-11);
- post-completion Backend PATCH/DELETE rejection with unchanged persisted data: `PASSED`.

## Tooling Gap Found During Browser Verification

The Frontend package does not currently include the TypeScript compiler or a type-check script. Vite transpilation and ESLint passed while an undefined runtime identifier remained in an event handler. Adding an authoritative type-check gate is deferred to a Project OS/tooling decision rather than silently changing dependencies inside this flow.
