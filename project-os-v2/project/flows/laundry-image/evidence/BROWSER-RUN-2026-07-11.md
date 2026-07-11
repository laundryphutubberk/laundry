# Laundry Image Browser Verification Evidence

Status: ACTIVE

## Environment

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:3000`
- Browser: Google Chrome
- Seed run: `20260710173557`
- Mutable Work: 7
- Terminal Work: 8
- Actor evidence: disposable Laundry staff account; credentials are intentionally omitted from this artifact

## Human-observed Results

Confirmed by the Project Owner on 2026-07-11 Asia/Bangkok.

| Scenario | Result | Observation |
|---|---|---|
| BR-LI-001 load and reload | PASS | Work Detail and persisted active images rendered after the API normalization fixes |
| BR-LI-002 register metadata | PASS | URL metadata registration succeeded and remained after refresh |
| BR-LI-003 caption | PASS | Caption mutation remained after refresh |
| BR-LI-004 cover | PASS | Cover changed and one cover remained after refresh |
| BR-LI-005 soft delete | PASS | Removed image remained absent after refresh |
| BR-LI-007 terminal Work | PASS | Terminal Work remained readable without mutation actions |

## Runtime Defects Found and Resolved During Run

1. Laundry Work controller called compatibility method names removed from the API object. Compatibility aliases were restored.
2. Work list response was not normalized from backend array/pagination into `{ items, pagination }`.
3. Work detail raw response was not normalized into the frontend detail DTO.
4. Soft-delete repository returned `null` after filtering the newly deleted row; deleted-record retrieval was corrected.
5. Frontend soft-delete response typing was aligned to the existing backend image-record response.

## Remaining Browser Evidence

- BR-LI-006 duplicate-submit protection: PASS based on the accepted browser run and request-log review showing one completed cover command per interaction with one persisted cover.
- BR-LI-008 Resort read-only and browser isolation: APPROVED_EXCEPTION. A separate human-observed Resort browser run was not returned; backend cross-resort/read-mutation evidence and frontend policy/static evidence passed.

The Project Owner accepted the Laundry Image metadata flow as complete on 2026-07-11. The exception remains visible rather than being converted into PASS.
