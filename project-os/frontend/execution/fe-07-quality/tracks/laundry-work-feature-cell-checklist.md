# FE-07 Quality — Laundry Work Feature Cell Checklist

Status: BASELINE
Owner: FE-07 Quality
Scope: Laundry Work Feature Cell
Use Before: Merge / Release

---

## 1. Purpose

This checklist is the quality gate for the first Feature Cell: Laundry Work.

It is used before merge or release to confirm that Laundry Work frontend work preserves architecture, runtime behavior, UI quality, integration safety, and workspace isolation.

This document is a checklist only. It does not implement tests, modify runtime, or modify UI.

---

## 2. Feature Cell Scope

Laundry Work Feature Cell covers frontend surfaces and behavior related to:

- Create Laundry Work
- Receive Bags
- Factory Receive
- Open Bag
- Count Items
- Sort Type
- Sort Color
- Record Data
- Return Work
- Close Work
- Work Detail composition
- Laundry Work status visibility
- Laundry Work issue visibility when relevant

---

## 3. Merge / Release Gate Rule

Laundry Work frontend changes should not merge or release until this checklist is reviewed.

Checklist result must be one of:

```text
PASS
PASS_WITH_NOTES
BLOCKED
```

Use `BLOCKED` when the change creates business ambiguity, workspace isolation risk, contract mismatch, runtime ownership conflict, or unreviewed regression risk.

---

## 4. Laundry Work QA Checklist

### 4.1 Business Rule Checks

- [ ] Laundry Work remains the operational center of the workflow.
- [ ] Bag remains the intake unit and is not treated as inventory.
- [ ] Count Line remains the source of real counted item data.
- [ ] Linen Inventory is not manually treated as source data from Laundry Work UI.
- [ ] Laundry Work status flow follows approved workflow states.
- [ ] Issue states are explicit and not hidden inside generic notes.
- [ ] UI does not introduce a new business workflow without approval.
- [ ] UI does not add fields that create duplicate data capture.

### 4.2 Feature Boundary Checks

- [ ] Laundry Work logic stays inside the Laundry Work feature owner boundary.
- [ ] Page components compose Laundry Work modules but do not own deep workflow logic.
- [ ] Shared UI remains business-neutral.
- [ ] Dashboard or Report surfaces do not mutate Laundry Work status.
- [ ] Inventory views do not override Laundry Work-derived movement or summary data.

---

## 5. Runtime Checks

### 5.1 State Consistency

- [ ] Laundry Work state is separated from view components.
- [ ] Runtime state does not contradict actor, role, workspaceType, or resortId context.
- [ ] Derived view state is not stored as source of truth unless explicitly approved.
- [ ] Loading, empty, error, and success states produce consistent view models.

### 5.2 Projection Consistency

- [ ] Projection logic prepares Work Detail and list view data consistently.
- [ ] Projection does not mutate source data.
- [ ] Status labels, next actions, and task prompts derive from the same runtime meaning.
- [ ] Empty/error projections do not leak data from another workspace or resort.

### 5.3 Policy Consistency

- [ ] Allowed actions are controlled by policy/runtime modules, not duplicated in UI components.
- [ ] Status transition permissions are consistent across page, feature, and service layers.
- [ ] Resort Workspace policies prevent cross-resort action visibility.
- [ ] Laundry Workspace policies allow cross-resort operation only when the role/contract allows it.

### 5.4 Runtime Flow Validation

- [ ] Receive Bag flow cannot skip required work context.
- [ ] Open Bag flow cannot operate on the wrong work or resort scope.
- [ ] Count Item flow writes/reads count intent only through approved runtime path.
- [ ] Record Data flow does not bypass counted item validation.
- [ ] Return Work flow does not bypass issue or discrepancy visibility.
- [ ] Close Work flow does not hide unresolved blocking conditions.
- [ ] Resume/continue action returns the user to the correct Work Detail or current operational step.

---

## 6. UI Checks

### 6.1 Layout Consistency

- [ ] Laundry Work screens use the approved workspace shell.
- [ ] Work Detail remains the main operational screen for laundry staff.
- [ ] Primary task appears before secondary navigation where applicable.
- [ ] Similar Laundry Work states use consistent spacing, grouping, and hierarchy.

### 6.2 Responsive Behavior

- [ ] One component adapts across desktop, tablet, and mobile.
- [ ] No separate desktop/mobile business implementation exists.
- [ ] Mobile supports one-task-at-a-time operation.
- [ ] Tablet supports staff operational workflow.
- [ ] Desktop supports broader work visibility without changing business meaning.

### 6.3 Empty State

- [ ] Empty Laundry Work list explains that no work is available.
- [ ] Empty Work Detail state gives a safe next action or recovery path.
- [ ] Empty bag/count/issue state does not imply completed work unless true.
- [ ] Resort Workspace empty states do not reveal other resort data.

### 6.4 Loading State

- [ ] Loading state appears while actor/workspace/work data is unresolved.
- [ ] Unsafe actions are disabled while required context is loading.
- [ ] Loading state preserves layout stability.
- [ ] Loading state does not show stale work details as current truth.

### 6.5 Error State

- [ ] Authorization error is distinct from generic server or network failure.
- [ ] Not-found work state is handled safely.
- [ ] Validation errors are visible near the relevant task/action.
- [ ] Error state gives a clear recovery path where appropriate.

### 6.6 Accessibility Basics

- [ ] Primary Laundry Work actions have clear labels.
- [ ] Touch targets are appropriate for tablet/mobile operation.
- [ ] Keyboard/focus flow is not blocked by modal, drawer, or shell composition.
- [ ] Error and empty messages are readable.

---

## 7. Integration Checks

### 7.1 API Contract Compliance

- [ ] Frontend does not assume fields outside approved backend contracts/schema.
- [ ] Request payloads match approved Laundry Work contract expectations.
- [ ] Response handling maps backend state into frontend view models through approved mapper/projection path.
- [ ] Contract gaps are recorded as blockers or handoff notes.

### 7.2 Response Handling

- [ ] Success response updates only the intended feature state.
- [ ] Empty response is handled without crashing UI.
- [ ] Validation error response maps to actionable UI feedback.
- [ ] Authorization error response preserves workspace isolation.
- [ ] Not-found response does not show stale Laundry Work data.
- [ ] Server/network errors provide safe retry or recovery guidance where appropriate.

### 7.3 Validation Mapping

- [ ] Required work context is validated before mutation requests.
- [ ] Required bag context is validated before bag actions.
- [ ] Required count line context is validated before count-related actions.
- [ ] Field-level validation does not contradict backend validation.
- [ ] Status transition validation is consistent with runtime policy.

---

## 8. Workspace Isolation Checks

### 8.1 Route and Guard Scope

- [ ] Laundry Workspace routes do not expose unauthorized operations.
- [ ] Resort Workspace routes require resort-scoped context.
- [ ] Route guards resolve actor, role, workspaceType, and resortId before scoped data access.

### 8.2 Data Scope

- [ ] Resort Workspace requests always preserve current user's resortId scope.
- [ ] Resort Workspace cannot read Laundry Work belonging to another resort.
- [ ] Laundry Workspace cross-resort access is limited to allowed role/contract behavior.
- [ ] Shared modules do not create hidden cross-workspace data access.

### 8.3 UI Scope

- [ ] Resort Workspace UI never displays another resort's work, bags, count lines, inventory, or issues.
- [ ] Dashboard widgets do not bypass workspace isolation.
- [ ] Search/filter controls cannot reveal cross-resort data in Resort Workspace.
- [ ] Empty/error states do not leak cross-resort existence signals.

---

## 9. Regression Risk Checks

- [ ] Change does not alter approved business workflow.
- [ ] Change does not alter API contract expectation without approval.
- [ ] Change does not alter workspace boundary.
- [ ] Change does not move feature logic into shared UI.
- [ ] Change does not duplicate runtime policy in components.
- [ ] Change does not create separate mobile/desktop business paths.
- [ ] Change does not bypass mapper/projection/state ownership.
- [ ] Change does not hide loading, empty, or error states.

---

## 10. Pre-Merge / Pre-Release Decision

Reviewer decision:

```text
Result: PASS | PASS_WITH_NOTES | BLOCKED
Reviewer:
Date:
Notes:
Blockers:
Follow-up Owner:
```

---

## 11. Done Criteria

This checklist is ready for use when:

- Laundry Work QA checklist exists.
- Runtime checks are defined.
- UI checks are defined.
- Integration checks are defined.
- Workspace isolation checks are defined.
- Checklist can be used before merge/release.
