# Claim Pass B Handoff

Pass A: IMPLEMENTED_AND_VERIFIED
Pass B: NOT_STARTED
Human Browser Test: NOT_EXECUTED
Gate: READY_FOR_PASS_B

## API

- `GET /api/laundry/works/:workId/claims`
- `GET /api/laundry/claims/:claimId`
- `POST /api/laundry/issues/:issueId/claim` with `claimReason`
- `POST /api/laundry/claims/:claimId/start-review` with optional `reviewNote`
- `POST /api/laundry/claims/:claimId/approve` with optional `reviewNote`
- `POST /api/laundry/claims/:claimId/reject` with required `reviewNote`
- `POST /api/laundry/claims/:claimId/resolve` with required `resolutionNote`

All endpoints use existing response envelopes and Laundry actor/workspace policy. There is no generic Claim status endpoint.
