# FE-07 Quality — Frontend Quality Assurance Standard

Status: BASELINE
Owner: FE-07 Quality
Scope: Frontend Quality Assurance and Engineering Quality Standard
Handoff Target: FE-08 Delivery

---

## 1. Purpose

FE-07 defines the quality standard for frontend architecture, runtime behavior, UI behavior, integration safety, and review readiness across the system.

This document is a Quality Architecture Document only.

It does not implement tests, change runtime behavior, or modify UI.

---

## 2. Scope

FE-07 applies to all frontend work across:

- App Shell
- Workspace Shell
- Routes
- Pages
- Feature Modules
- Shared UI
- State / Services
- API Contract Boundary

The goal is to make quality review repeatable before work moves to FE-08 Delivery.

---

## 3. Non-Goals

FE-07 must not:

- Write test implementation.
- Modify runtime logic.
- Modify UI components.
- Change API contracts.
- Change backend endpoints.
- Change schema or domain model.
- Approve business workflow changes.

---

## 4. Architecture Review Standard

Architecture review checks whether frontend work follows the approved architecture boundaries.

### 4.1 Feature Boundary

Every feature must have a clear owner and responsibility.

Quality checks:

- Feature logic belongs inside the owning feature module.
- Pages compose features but do not become feature owners.
- Shared UI stays business-neutral.
- Reports consume domain outputs and do not mutate operational state.
- Inventory screens do not manually override calculated inventory unless an explicit adjustment flow exists.

### 4.2 Import Rules

Imports must follow approved dependency direction.

Quality checks:

- App Shell may import Workspace Shell.
- Workspace Shell may import Routes, Shared UI, and Workspace State.
- Routes may import Pages and Guards.
- Pages may import Feature Modules and Shared UI.
- Feature Modules may import Feature State, Feature Services, Shared UI, and API Client.
- Feature State / Services may import API Client and Types.
- Shared UI may import only UI primitives, styling utilities, and generic helpers.
- API Client may import contract/types only.

Forbidden:

- Shared UI importing feature modules.
- Shared UI importing feature stores.
- API Client importing pages or components.
- Feature Modules importing App Shell.
- Report domain calling operational mutation services.

### 4.3 Ownership Rules

Each file should have one clear ownership layer.

Quality checks:

- Feature files are owned by their feature domain.
- Shared files are owned by shared architecture and must remain generic.
- Workspace files own shell, workspace-level navigation, and workspace-level guards only.
- Runtime files own runtime flow, policy, projection, mapper, and state orchestration for their domain.
- Contract files own request and response expectations only.

### 4.4 Runtime Boundary

Runtime review checks whether workflow and state behavior stay in the correct layer.

Quality checks:

- Business transitions do not live inside UI components.
- Runtime policies are not duplicated in pages.
- Projection logic is not mixed into presentational UI.
- Mappers are used for transforming API/domain data into view-ready shapes.
- Workspace isolation is preserved through route, state, service, and API request paths.

---

## 5. Code Quality Standard

Code quality checks maintainability, readability, and safe evolution.

### 5.1 Naming

Quality checks:

- Names clearly describe responsibility.
- Feature names match project glossary and domain language.
- Runtime, policy, projection, mapper, store, service, and API files use consistent names.
- Avoid vague names such as `helper`, `misc`, `common`, or `utils` when ownership is domain-specific.

### 5.2 Folder Structure

Quality checks:

- Feature-first structure is preserved.
- Domain-specific logic does not leak into shared folders.
- Shared folders contain only business-neutral utilities or primitives.
- Test artifacts, review artifacts, and handoff artifacts belong in the appropriate execution package locations.

### 5.3 Complexity

Quality checks:

- Components remain small and focused.
- Pages compose rather than implement deep logic.
- Runtime decisions are isolated into policy/runtime modules.
- Complex transformations are moved into mappers or projections.
- Complex conditionals are named and extracted when they represent business or runtime rules.

### 5.4 Duplication

Quality checks:

- Business logic is not duplicated across desktop/mobile layouts.
- Policy rules are not duplicated across components.
- API response mapping is not duplicated across pages.
- UI duplication is acceptable only for presentational composition, not for business behavior.

### 5.5 Readability

Quality checks:

- Files reveal intent quickly.
- Component props are understandable.
- State transitions are traceable.
- Error and loading paths are visible and reviewable.
- Reviewers can identify ownership without reading unrelated files.

---

## 6. UI Quality Standard

UI quality checks whether user-facing screens are consistent, adaptive, and operationally safe.

### 6.1 Layout Consistency

Quality checks:

- Screens follow the approved workspace shell.
- Task-oriented content appears before secondary navigation where applicable.
- Spacing, grouping, and hierarchy are consistent across similar screens.
- Desktop, tablet, and mobile layouts preserve the same business meaning.

### 6.2 Responsive Behavior

Quality checks:

- One component adapts across layouts.
- No separate desktop/mobile business implementation exists.
- Mobile prioritizes one task at a time.
- Tablet supports operational staff workflows.
- Desktop supports dashboard, report, and multi-panel work.

### 6.3 Accessibility

Quality checks:

- Primary actions are reachable and understandable.
- Interactive elements have clear labels.
- Touch targets are appropriate for mobile/tablet use.
- Keyboard and focus behavior are not blocked by layout composition.
- Error and empty states are readable.

### 6.4 Empty State

Quality checks:

- Empty states explain what is missing.
- Empty states guide the next allowed action.
- Empty states do not imply data exists when none is available.
- Resort Workspace empty states do not reveal other resort data.

### 6.5 Loading State

Quality checks:

- Loading states do not break layout stability.
- Loading state is visible for async data.
- Loading state does not allow unsafe actions before required context is ready.
- Workspace and actor context loading is handled before scoped data access.

### 6.6 Error State

Quality checks:

- Errors are visible and actionable.
- API errors do not expose sensitive internal details.
- Workspace authorization errors are separated from general failures.
- Retry or recovery path is clear when appropriate.

---

## 7. Runtime Quality Standard

Runtime quality checks whether frontend runtime behavior remains consistent, predictable, and safe.

### 7.1 State Consistency

Quality checks:

- State is separated from view.
- State transitions are owned by the correct feature state/service layer.
- Runtime state does not contradict actor or workspace context.
- Derived state is not stored as source of truth unless explicitly approved.

### 7.2 Projection Consistency

Quality checks:

- Projection logic produces stable view models.
- Projection does not mutate source data.
- Projection names match the screen or feature intent.
- Projection is consistent across loading, empty, error, and success states.

### 7.3 Policy Consistency

Quality checks:

- Policy decisions are centralized in policy modules when they represent reusable rules.
- UI components consume policy outcomes rather than reimplementing policies.
- Workspace permission and scope policies are consistent across route, page, and feature layers.

### 7.4 Runtime Flow Validation

Quality checks:

- Runtime flow follows the business workflow.
- Illegal state transitions are blocked or clearly represented.
- Work Detail remains the primary operational screen for laundry staff.
- Resume/continuity behavior does not bypass workspace scope or feature ownership.

---

## 8. Integration Quality Standard

Integration quality checks whether frontend communication with backend and contracts is safe.

### 8.1 API Contract Compliance

Quality checks:

- Frontend does not assume fields not present in contracts/schema.
- Request and response types match the approved contract.
- Contract changes are not introduced from FE-07.
- Contract gaps are recorded as blockers or handoff notes.

### 8.2 Response Handling

Quality checks:

- Success, empty, validation error, authorization error, not found, and server error paths are handled.
- Response mapping is centralized where appropriate.
- UI does not depend directly on raw backend shape when a mapper/projection is needed.

### 8.3 Validation Mapping

Quality checks:

- Backend validation errors map to understandable UI states.
- Field-level errors are shown near the relevant action or input.
- Form validation does not contradict backend rules.
- Required workspace or actor context is validated before requests.

### 8.4 Workspace Isolation

Quality checks:

- Resort Workspace requests preserve `resortId` scoping.
- Laundry Workspace cross-resort access is allowed only by authenticated role and approved contract.
- Dashboard widgets do not bypass workspace isolation.
- Shared modules do not create hidden cross-workspace data access paths.

---

## 9. Testing Strategy Standard

FE-07 defines testing strategy only. It does not implement tests.

### 9.1 Unit Testing

Purpose:

- Validate pure logic, mappers, projections, policies, and utility behavior.

Quality expectation:

- Unit tests should focus on deterministic logic and edge cases.

### 9.2 Component Testing

Purpose:

- Validate component rendering behavior, states, and user interactions.

Quality expectation:

- Component tests should cover loading, empty, error, and success states where applicable.

### 9.3 Integration Testing

Purpose:

- Validate feature flow across state, service, API boundary, and UI composition.

Quality expectation:

- Integration tests should verify contract usage and workspace-scoped behavior.

### 9.4 E2E Testing

Purpose:

- Validate critical user workflows across the application.

Quality expectation:

- E2E coverage should prioritize operational flows such as receive bag, open bag, count items, record data, return work, and resort visibility.

### 9.5 Visual Regression Testing

Purpose:

- Detect unintended UI/layout changes.

Quality expectation:

- Visual regression should focus on core workspace shells, dashboards, Work Detail, responsive layouts, and key state screens.

---

## 10. Review Checklist

### 10.1 Architecture

- [ ] Feature boundary is clear.
- [ ] Import direction is valid.
- [ ] Ownership is clear.
- [ ] Shared modules are business-neutral.
- [ ] Runtime boundary is preserved.

### 10.2 Runtime

- [ ] State is separated from view.
- [ ] Policies are not duplicated in UI.
- [ ] Projections are consistent.
- [ ] Runtime flow follows business workflow.
- [ ] Workspace isolation is preserved through runtime paths.

### 10.3 UI

- [ ] Layout is consistent.
- [ ] Responsive behavior uses one business logic path.
- [ ] Empty state is defined.
- [ ] Loading state is defined.
- [ ] Error state is defined.
- [ ] Accessibility basics are covered.

### 10.4 State

- [ ] Source state and derived state are separated.
- [ ] State transitions are traceable.
- [ ] Feature state does not leak across domains.
- [ ] Workspace and actor context are respected.

### 10.5 Integration

- [ ] API contract is followed.
- [ ] Response handling covers expected states.
- [ ] Validation mapping is clear.
- [ ] Resort scoping is preserved.
- [ ] Contract gaps are recorded.

---

## 11. Definition of Done

FE-07 is done when:

- Quality standard is documented.
- Architecture review standard is defined.
- Code quality standard is defined.
- UI quality standard is defined.
- Runtime quality standard is defined.
- Integration quality standard is defined.
- Testing strategy is defined without implementation.
- Review checklist is defined.
- Handoff guidance to FE-08 is defined.
- No runtime, UI, or test implementation is changed by this document.

---

## 12. Handoff to FE-08

FE-08 Delivery should use this document as the frontend quality gate before packaging, release preparation, or delivery review.

FE-08 should verify:

- Quality checklist completion.
- Blocker list status.
- Contract gap status.
- Workspace isolation risk status.
- Regression risk status.
- Delivery readiness against the Definition of Done.

If FE-08 finds a quality gap, the issue should be routed back to the owning FE package or recorded as a delivery blocker.

---

## 13. Blocker Policy

Record a blocker when quality review finds:

- Business workflow ambiguity.
- API contract gap.
- Workspace boundary uncertainty.
- Schema/domain mismatch.
- Runtime ownership conflict.
- Shared module containing domain-specific logic.
- UI requiring separate desktop/mobile business implementation.

Blockers must be resolved or explicitly accepted before FE-08 delivery readiness.
