# Sorting and Data Recording Verification Plan

Status: ACTIVE

## Required Evidence

- generic transitions cannot bypass type/color/data validation;
- Type confirmation rejects missing/inactive Item Type;
- Color confirmation rejects empty color;
- classification correction cannot change counted quantity or Bag linkage;
- recording derives dimensions and quantities from persisted Count Lines only;
- concurrent/repeated recording cannot duplicate Movements;
- Movement set, Inventory Summary, Work status, and audit log commit atomically;
- rollback leaves no partial Movements/Summary/status;
- Resort reads remain scoped and Resort mutation is denied;
- browser confirmation, correction, recording, and refresh persist;
- completed Intake/Counting, Issue, and Image regressions pass.

## Automated Evidence Status

- generic bypass rejection: `PASSED`;
- inactive Item Type and missing color rejection: `PASSED`;
- quantity/Bag immutability and full immutability after color confirmation: `PASSED`;
- server-derived aggregation with issue quantity kept separate: `PASSED`;
- Movement, Summary, audit, and Work status atomic publication: `PASSED`;
- concurrent/repeated recording no-duplication: `PASSED`;
- forced rollback leaves Work and Movements unchanged: `PASSED`;
- Resort mutation denial: `PASSED`;
- Backend runtime/policy and Issue/Image regressions: `PASSED`;
- Frontend lint and production build: `PASSED`;
- Frontend TypeScript compiler gate: `MISSING_CAPABILITY`;
- human browser workflow: `PENDING`.
