# LW-Q-003 — Count Line Runtime QA Result

Status: PASS_WITH_NOTES
Owner: FE-07 Quality
Scope: Laundry Work Count Line Runtime + Integration Boundary
Review Date: 2026-07-10

---

## 1. Gate Result

```text
PASS_WITH_NOTES
```

Laundry Work Count Line runtime is wired through the approved boundary path and is ready for manual runtime verification in the app.

This is not a full build/CI pass. Build and browser verification still need to be run outside this document.

---

## 2. Verified Runtime Path

```text
LaundryWorkDetailPage
→ LaundryWorkRuntimeHost
→ useLaundryWorkRuntime
→ useLaundryWorkController
→ laundryWork.policy
→ laundryWorkProjection
→ laundryWork.store
→ laundryWorkApi
→ backend /api/laundry count-line endpoints
```

---

## 3. Files Reviewed

- `frontend/src/features/laundry-works/pages/LaundryWorkDetailPage.tsx`
- `frontend/src/features/laundry-works/runtime/LaundryWorkRuntimeHost.tsx`
- `frontend/src/features/laundry-works/hooks/useLaundryWorkRuntime.ts`
- `frontend/src/features/laundry-works/controllers/useLaundryWorkController.ts`
- `frontend/src/features/laundry-works/api/laundryWorkApi.ts`
- `frontend/src/features/laundry-works/policies/laundryWork.policy.ts`
- `frontend/src/features/laundry-works/projections/laundryWorkProjection.ts`
- `frontend/src/features/laundry-works/stores/laundryWork.store.ts`
- `frontend/src/features/laundry-works/components/CountEntryPanel.tsx`
- `frontend/src/features/laundry-works/components/CountTable.tsx`

---

## 4. Verification Results

### 4.1 API Boundary

Result: PASS

Verified:

- `createLaundryCountLine` exists.
- `listLaundryCountLines` exists.
- `updateLaundryCountLine` exists.
- `deleteLaundryCountLine` exists.
- Count Line DTO is normalized inside `laundryWorkApi.ts`.
- Backend response envelope is mapped before reaching controller/UI.

### 4.2 Controller Orchestration

Result: PASS

Verified:

- `createCountLine` calls `laundryWorkApi.createLaundryCountLine`.
- `updateCountLine` calls `laundryWorkApi.updateLaundryCountLine`.
- `deleteCountLine` calls `laundryWorkApi.deleteLaundryCountLine`.
- All mutation actions create request metadata.
- All mutation actions update requestId.
- All mutation actions reload detail after success.
- Mutation loading flags are protected by `try/finally`.

### 4.3 Policy

Result: PASS

Verified:

- Count Line creation is exposed through `countLine.createCountLine` policy.
- Policy requires valid work detail.
- Policy requires non-terminal work.
- Policy requires Laundry workspace for mutation.
- Policy requires backend count-line capability.
- Policy allows Count Line work only when current status is ready for counting.

### 4.4 Projection Consumption

Result: PASS

Verified:

- Count Lines are projected into `countRows`.
- Count summary is projected into `countSummaryItems`.
- UI consumes projected rows and summary, not backend DTO directly.
- Count Table remains presentation-only.

### 4.5 UI Boundary

Result: PASS

Verified:

- `LaundryWorkDetailPage` consumes runtime output from `LaundryWorkRuntimeHost`.
- `CountEntryPanel` receives `action={actions.countLine.createCountLine}`.
- `CountEntryPanel` does not import API or store.
- `CountTable` does not import API or store.
- Visual components do not call backend directly.

---

## 5. Runtime Behavior Expected

Manual QA scenario:

1. Login as `LAUNDRY_MANAGER`.
2. Create Resort.
3. Create Laundry Work with intake bags.
4. Continue status to `FACTORY_RECEIVED`.
5. Continue status to `BAG_OPENED`.
6. Add Count Line:
   - bag: ถุงที่ 1
   - itemTypeName: ผ้าเช็ดตัว
   - colorGroup: ขาว
   - quantity: 25
7. Confirm Count Table updates.
8. Confirm summary total updates.
9. Refresh page.
10. Confirm persisted Count Line remains.

---

## 6. Issues Found

None requiring code changes in this QA pass.

Previous runtime hardening already applied:

- Mutation loading flags protected with `try/finally`.
- Count Line API boundary completed for list/create/update/delete.
- Count Line update/delete runtime actions exposed through controller only.

---

## 7. Remaining Blockers / Notes

- Build/CI has not been run in this environment.
- Browser manual QA has not been executed in this environment.
- Update/Delete Count Line actions are available in runtime boundary but not exposed as visual buttons yet.
- Issue Report remains disabled by backend capability.
- Image Upload remains disabled by backend capability.
- Inventory/Movement is not part of this FE-07 pass.

---

## 8. Handoff Recommendation

Proceed to browser/manual QA for the Count Line flow.

If manual QA passes, the next FE round may safely expose edit/delete UI affordances for Count Lines or proceed to the next feature area according to project priority.
