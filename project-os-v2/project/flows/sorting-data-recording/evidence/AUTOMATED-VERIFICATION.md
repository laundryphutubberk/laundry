# Sorting and Data Recording Automated Verification

Status: ACTIVE
Working Tree: UNCOMMITTED
Date: 2026-07-11

## Database Integration

Command: `npm run verify:sorting-data-recording-db`
Result: PASS

Evidence proves:

- generic status bypass rejected;
- inactive Item Type and missing color rejected;
- classification-only mutation window enforced;
- persisted Count Lines aggregated across Bags by Item Type and normalized color;
- issue quantity did not reduce physical counted quantity;
- one `COUNTED_AT_LAUNDRY` Movement and matching Inventory Summary quantity were created;
- Work reached `DATA_RECORDED` with authenticated audit identity;
- two concurrent recording attempts produced exactly one success and one rejection;
- forced Summary failure rolled back Movement creation and retained `COLOR_SORTED`.

## HTTP Integration

Command: `npm run verify:sorting-data-recording-http`
Result: PASS

Evidence proves explicit command routes, generic bypass rejection, Resort mutation denial, and replay rejection against a real database.

## Regression and Static Checks

- `npm run verify:runtime`: PASS
- `npm run verify:service-policy`: PASS
- `npm run verify:http-policy`: PASS
- `npm run verify:laundry-issue:all`: PASS
- `npm run verify:laundry-image:all`: PASS
- `npx prisma validate`: PASS; schema unchanged by this flow
- Frontend `npm run lint`: PASS
- Frontend `npm run build`: PASS
- TypeScript compiler/type-check: MISSING_CAPABILITY

## Pending

Human browser confirmation, missing-color blocker, classification correction, data recording, and refresh persistence.
