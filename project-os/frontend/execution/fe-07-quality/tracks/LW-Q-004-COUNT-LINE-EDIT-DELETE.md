# LW-Q-004 — Count Line Edit/Delete QA Result

Status: PASS_WITH_NOTES
Owner: FE-07 Quality
Scope: Count Line edit/delete UI affordance through runtime boundary
Review Date: 2026-07-10

---

## 1. Gate Result

```text
PASS_WITH_NOTES
```

Count Line edit/delete affordances are now exposed through the existing runtime/controller/API boundary.

This is not a full browser or CI verification pass. Build and browser QA still need to be executed outside this document.

---

## 2. Files Reviewed / Changed

- `frontend/src/features/laundry-works/components/CountTable.tsx`
- `frontend/src/features/laundry-works/pages/LaundryWorkDetailPage.tsx`
- `frontend/src/features/laundry-works/controllers/useLaundryWorkController.ts`
- `frontend/src/features/laundry-works/api/laundryWorkApi.ts`
- `frontend/src/features/laundry-works/policies/laundryWork.policy.ts`

---

## 3. Verified Boundary Path

```text
CountTable
→ rowActions.onUpdate / rowActions.onDelete
→ LaundryWorkDetailPage handlers
→ actions.countLine.updateCountLine / deleteCountLine
→ useLaundryWorkController
→ laundryWorkApi.updateLaundryCountLine / deleteLaundryCountLine
→ backend count-line endpoints
```

---

## 4. Verification Results

### 4.1 Component Boundary

Result: PASS

Findings:

- `CountTable` remains presentation-only.
- `CountTable` does not import API, store, policy, or controller.
- Inline edit state is local UI state only.
- Save/Delete calls are delegated through `rowActions`.

### 4.2 Page Wiring

Result: PASS

Findings:

- `LaundryWorkDetailPage` passes runtime actions to `CountTable` through `rowActions`.
- Page handlers call `actions.countLine.updateCountLine` and `actions.countLine.deleteCountLine` only.
- No direct API/store imports were added to the page.

### 4.3 Update Payload Guard

Result: PASS

Findings:

- Inline update blocks invalid or non-positive quantity before calling runtime action.
- `itemTypeName` and `colorGroup` are trimmed before update.
- Update payload stays inside Count Line contract shape.

### 4.4 Delete Boundary

Result: PASS

Findings:

- Delete action passes only the selected line id through runtime action.
- Controller owns request metadata, API call, error state, loading state, and reload.

### 4.5 Loading / Busy State

Result: PASS_WITH_NOTES

Findings:

- Runtime exposes `isUpdatingCountLine` and `isDeletingCountLine`.
- `CountTable` disables row actions during update/delete.

Note:

- Row-level loading is currently global for all rows, not per-row. This is acceptable for the current minimal pass.

---

## 5. Manual QA Scenario

1. Login as `LAUNDRY_MANAGER`.
2. Open an existing Laundry Work in `BAG_OPENED` or later status.
3. Add a Count Line.
4. Click `แก้ไข` on the Count Line.
5. Change quantity.
6. Click `บันทึก`.
7. Confirm table reloads with updated value.
8. Refresh page.
9. Confirm updated value persists.
10. Click `ลบ`.
11. Confirm row is removed after reload.
12. Refresh page.
13. Confirm deleted row does not return.

---

## 6. Issues Found

No blocker found in code review.

One small risk remains:

- Delete currently has no confirmation dialog. This is acceptable for minimal runtime wiring but should be reconsidered before production UX freeze.

---

## 7. Remaining Blockers / Notes

- Build/CI has not been run in this environment.
- Browser manual QA has not been executed in this environment.
- Delete confirmation is not implemented yet.
- Row-level busy state is global, not per-row.

---

## 8. Handoff Recommendation

Proceed to browser manual QA for create/update/delete Count Line.

If manual QA passes, FE-07 Count Line runtime can be treated as ready for the next feature layer: Issue / Report / Inventory preparation, depending on project priority.
