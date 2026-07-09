# LW-Q-002 — BE Connected Regression Gate

Status: BLOCKED
Owner: FE-07 Quality
Scope: Laundry Work Detail Runtime + Integration verification after backend connection
Review Date: 2026-07-09

---

## 1. Gate Result

```text
BLOCKED
```

Reason:

Laundry Work Detail has moved beyond mock-only behavior and now calls backend through the `laundryWorkApi` boundary, but the BE-connected gate cannot pass yet because workspace / actor context is still fixed in the controller and backend route implementation could not be confirmed from repository search during this review.

This is not a UI blocker for continuing frontend List / Dashboard composition, but it is a blocker for claiming backend-connected regression readiness.

---

## 2. Reviewed Standards

- `project-os/frontend/execution/fe-07-quality/tracks/laundry-work-feature-cell-checklist.md`
- `project-os/frontend/execution/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`
- `project-os/frontend/execution/FE-05-LAUNDRY-WORK-STATE-CONTRACT.md`
- `project-os/frontend/execution/FE-06-LAUNDRY-WORK-API-MAPPING.md`

---

## 3. Reviewed Files

- `frontend/src/features/laundry-works/pages/LaundryWorkDetailPage.tsx`
- `frontend/src/features/laundry-works/runtime/LaundryWorkRuntimeHost.tsx`
- `frontend/src/features/laundry-works/controllers/useLaundryWorkController.ts`
- `frontend/src/features/laundry-works/api/laundryWorkApi.ts`
- `frontend/src/features/laundry-works/policies/laundryWork.policy.ts`
- `frontend/src/features/laundry-works/projections/laundryWorkProjection.ts`
- `frontend/src/features/laundry-works/stores/laundryWork.store.ts`
- `frontend/src/features/laundry-works/components/*.tsx`

---

## 4. Endpoint Verification

### 4.1 `GET /api/laundry/works`

Result: PASS_WITH_NOTES

Finding:

- Frontend boundary maps `listLaundryWorks` to `/laundry/works`, which resolves to `/api/laundry/works` through `API_BASE_URL`.
- Response is normalized before leaving the API boundary.

Note:

- Backend route implementation was not confirmed by repository search in this review.

### 4.2 `GET /api/laundry/works/:workId`

Result: PASS_WITH_NOTES

Finding:

- Frontend boundary maps `getLaundryWorkDetail` to `/laundry/works/:workId`, which resolves to `/api/laundry/works/:workId` through `API_BASE_URL`.
- Missing `workId` is blocked client-side before request dispatch.
- Response is normalized into `LaundryWorkDetailDTO` before projection.

Note:

- Backend route implementation was not confirmed by repository search in this review.

### 4.3 `PATCH /api/laundry/works/:workId/status`

Result: PASS_WITH_NOTES

Finding:

- Frontend boundary maps `updateLaundryWorkStatus` to `/laundry/works/:workId/status`, which resolves to `/api/laundry/works/:workId/status` through `API_BASE_URL`.
- Missing `workId` and missing `toStatus` are blocked client-side.
- Continue action calls this boundary only through controller.

Note:

- Backend route implementation was not confirmed by repository search in this review.

---

## 5. Runtime + Integration Verification

### 5.1 Loading

Result: PASS

Finding:

- Controller owns async loading state.
- Page renders loading state through runtime output.
- Components receive loading props and do not fetch independently.

### 5.2 Empty

Result: PASS

Finding:

- Projection exposes `empty` when no detail work is available.
- Page renders safe not-found / no-data UI.

### 5.3 Error

Result: PASS

Finding:

- API boundary normalizes errors with code, message, status, fieldErrors, requestId, and retryable.
- Page displays safe error and requestId when present.

### 5.4 Permission

Result: PASS_WITH_NOTES

Finding:

- API boundary requires a bearer token before backend dispatch.
- Policy disables actions while detail is not ready or when terminal work blocks mutation.

Note:

- Permission currently depends on token availability and fixed controller role metadata. Authenticated actor/role source must be connected before final BE-connected pass.

### 5.5 Workspace Isolation

Result: BLOCKED

Finding:

- API boundary enforces `resortId` requirement when `workspaceType = RESORT`.
- Policy denies missing Resort Workspace scope.
- However, `useLaundryWorkController` currently creates a fixed `LAUNDRY` workspace context instead of reading authenticated workspace / actor context.

Blocker:

- Resort Workspace isolation cannot be fully verified until controller receives real workspaceType, role, and resortId from the auth/workspace boundary.

### 5.6 Projection Normalization

Result: PASS

Finding:

- API boundary normalizes backend responses into DTOs.
- Projection converts DTOs into UI-ready view models.
- Page/components do not render backend DTO directly.

---

## 6. Action Verification

### 6.1 Continue Action

Result: PASS_WITH_NOTES

Finding:

- Eligibility comes from policy/controller.
- Controller maps current status to next backend status and calls `updateLaundryWorkStatus` only through API boundary.
- UI receives an action model and does not decide transition eligibility.

Note:

- Backend route implementation and real transition authority must be verified by runtime execution before production pass.

### 6.2 Issue Action

Result: PASS_WITH_NOTES

Finding:

- Issue action eligibility comes from policy/controller.
- `capability.issue.create = false`, so action is disabled with `BACKEND_CONTRACT_REQUIRED`.

### 6.3 Image Action

Result: PASS_WITH_NOTES

Finding:

- Image action eligibility comes from policy/controller.
- `capability.image.upload = false`, so action is disabled with `BACKEND_CONTRACT_REQUIRED`.

### 6.4 Save Draft Action

Result: PASS_WITH_NOTES

Finding:

- Save Draft action is disabled with `BACKEND_CONTRACT_REQUIRED` until a backend draft contract exists.

---

## 7. Boundary Verification

### 7.1 No Component Calls API Directly

Result: PASS

Finding:

- Page and presentation components do not import `laundryWorkApi`.
- Backend access is isolated in `useLaundryWorkController` through `laundryWorkApi`.

### 7.2 No Store Access Inside UI

Result: PASS

Finding:

- Store access is isolated in `useLaundryWorkController`.
- `LaundryWorkDetailPage` and components consume runtime output only.

### 7.3 No JSX Business Logic

Result: PASS_WITH_NOTES

Finding:

- JSX contains rendering branches for loading / empty / error only.
- Workflow and action eligibility are not calculated in JSX.

Note:

- `LaundryWorkDetailContent` currently uses `any` props. This is not business logic, but should be typed in a later quality hardening pass.

### 7.4 No Backend DTO Leaks

Result: PASS

Finding:

- DTOs are normalized in API boundary and projected before page rendering.
- Components receive UI-friendly props, not raw backend envelope responses.

### 7.5 No Cross-Feature Import Violation

Result: PASS

Finding:

- Reviewed Laundry Work Detail path imports local feature modules, React, React Router, and Zustand only.
- No unrelated feature imports were observed.

---

## 8. Issues Found

1. `useLaundryWorkController` uses fixed `LAUNDRY` workspace context.
   - Severity: BLOCKER for BE-connected workspace isolation.
   - Required resolution: connect authenticated workspace / actor context and pass `workspaceType`, `role`, `resortId`, and token into request metadata.

2. Backend route implementation for the target endpoints was not confirmed by repository search.
   - Severity: BLOCKER for BE-connected regression pass.
   - Required resolution: verify actual backend routes or CI/runtime evidence for:
     - `GET /api/laundry/works`
     - `GET /api/laundry/works/:workId`
     - `PATCH /api/laundry/works/:workId/status`

3. Issue, Image, and Save Draft actions are disabled by backend capability / missing contracts.
   - Severity: PASS_WITH_NOTES for current scope.
   - Required resolution: add backend contracts before enabling these actions.

---

## 9. Fixes Applied

None.

Reason:

The blocking issues require authenticated workspace context and backend route/runtime evidence. Applying a code patch without those contracts would violate the `No Mock`, `No Placeholder`, and `Minimal Patch Only` rules.

---

## 10. Remaining Blockers

- Auth/workspace context must be connected to controller metadata.
- Backend endpoint implementation or runtime evidence must be verified.
- Issue creation endpoint is not available in current capability contract.
- Image upload endpoint is not available in current capability contract.
- Save Draft backend contract does not exist yet.

---

## 11. Final Gate Decision

```text
BLOCKED
```

Laundry Work Detail is structurally wired for backend integration, but it is not yet BE-connected regression ready.

Next recommended domain:

```text
BE endpoint verification / auth-workspace context bridge before re-running LW-Q-002.
```
