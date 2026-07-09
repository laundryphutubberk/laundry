# FE-05 State Management Standard

Status: BASELINE
Owner: FE-05 State Domain
Scope: Frontend architecture document only

## Purpose

Define the frontend state management standard for the Laundry Operations & Linen Asset Management Platform.

This document governs state ownership, reset, persistence, store boundaries, and handoff rules before FE-06 Integration.

FE-05 does not implement stores, runtime behavior, API clients, or business workflow logic.

## Source of Truth

FE-05 must align with:

- FE-02 Architecture: layer model, domain boundaries, dependency direction, package structure, architecture decision records.
- FE-03: frontend foundation / shared baseline as established by prior execution tracks.
- FE-04 UI Composition: workspace shell rules, task-first layout, workspace isolation, and shared UI boundaries.
- Business Blueprint: workspace model, production flow, and workspace isolation principle.
- schema.prisma: User, WorkspaceType, UserRole, Resort, LaundryWork, LaundryBag, LaundryCountLine, LinenInventorySummary, IssueReport.
- UI Adaptive Guide: one component, multiple layouts; task-first screens.
- Development Standards: feature-first, state separated from view, no business logic in UI.

## State Taxonomy

Frontend state is divided into seven categories:

1. Client State
2. Server State
3. Form State
4. Runtime State
5. Draft State
6. Workspace State
7. Feature-local Stores

Each category must have a clear owner and reset boundary.

## Client State

Client State is browser-local UI state that does not represent server truth.

Examples:

- Sidebar open / collapsed state
- Drawer visibility
- Active tab
- Local filters that do not change server cache identity
- Selected UI panel
- Temporary sort preference

Rules:

- Client State may live in component state or feature-local stores.
- Client State must not become business workflow state.
- Client State must not be treated as source of truth for persisted domain records.
- Client State must reset when leaving its owning feature unless explicitly approved for persistence.

Owner:

- Component for small, isolated UI state.
- Feature-local store for shared UI state within one feature.

## Server State

Server State is data fetched from backend APIs and owned by the backend/database.

Examples:

- LaundryWork records
- LaundryBag records
- LaundryCountLine records
- LinenInventorySummary records
- IssueReport records
- Resort records
- Authenticated user / workspace scope returned by server

Rules:

- Server State is read from API responses only.
- Server State must not be manually duplicated into long-lived UI stores unless it is a normalized projection with a clear cache boundary.
- Server State must preserve workspace isolation.
- Resort Workspace Server State must be scoped by resortId.
- Server State mutation belongs to FE-06 Integration and backend API contracts, not FE-05.

Owner:

- API cache layer in FE-06.
- Feature projections derived from API responses.

## Form State

Form State is user input currently being edited before submit.

Examples:

- Create Laundry Work form
- Count Line input form
- Issue Report form
- Filter form
- Login form

Rules:

- Form State belongs to the form boundary.
- Form State should use form libraries or component-local state.
- Form State must not be stored globally unless the form is explicitly multi-step or resumable.
- Validation and submit mapping must be isolated from visual components.
- Form State must reset after successful submit unless the workflow explicitly requires continuing with previous values.

Owner:

- Form component / form controller.
- Draft State only when resumable or multi-step.

## Runtime State

Runtime State is short-lived operational state used while the app is executing a current task.

Examples:

- Current workflow screen mode
- Current selected work context
- Current active task panel
- Current scan/tap session state
- Temporary runtime error state
- In-progress interaction status

Rules:

- Runtime State must be scoped to a runtime host or feature runtime boundary.
- Runtime State must not be persisted by default.
- Runtime State must not own business rules.
- Runtime State may coordinate UI behavior but must not create domain truth.
- Runtime State must reset on logout, workspace switch, or domain exit.

Owner:

- Runtime host / feature runtime boundary.
- Feature-local store only when multiple components in the same feature require the same runtime view state.

## Draft State

Draft State is incomplete user-created data intended to survive navigation or interruption before submission.

Examples:

- Unsubmitted count lines during an active count session
- Unsaved issue report draft
- Multi-step work creation draft
- Offline-like temporary capture draft when explicitly approved

Rules:

- Draft State must be explicitly named as draft.
- Draft State is not Server State.
- Draft State must show whether it is saved, unsaved, dirty, or submitted.
- Draft State must have clear discard and reset behavior.
- Draft persistence requires explicit approval and a defined storage boundary.
- Draft State must never overwrite Server State without an API-confirmed mutation.

Owner:

- Feature-local draft store.
- Form controller for non-persistent drafts.

## Workspace State

Workspace State defines the active workspace identity and visibility boundary.

Examples:

- workspaceType: LAUNDRY or RESORT
- role: LAUNDRY_OWNER, LAUNDRY_MANAGER, LAUNDRY_STAFF, RESORT_OWNER, RESORT_STAFF
- resortId for Resort Workspace
- active workspace shell context
- allowed navigation scope

Rules:

- Workspace State is security-sensitive and must be derived from authenticated server/user context.
- Resort Workspace must never render server data without resortId scope.
- Workspace State may influence navigation, layout, and query scope.
- Workspace State must not be manually edited by feature components.
- Workspace State must reset on logout.
- Workspace switch must reset runtime, feature-local, form, and draft state unless explicitly preserved.

Owner:

- Auth/workspace boundary.
- Workspace shell may read Workspace State but must not mutate business state.

## Feature-local Stores

Feature-local Stores are stores owned by one feature domain.

Examples:

- dashboard.store.ts for dashboard UI state
- work-detail.store.ts for Work Detail runtime view state
- count-session.store.ts for Count & Sort runtime state
- issue-panel.store.ts for issue panel UI/runtime state

Rules:

- Feature-local stores must stay inside their feature package.
- Feature-local stores must not be imported by shared UI.
- Feature-local stores must not own backend truth.
- Feature-local stores may hold client, runtime, draft, and feature projection state.
- Feature-local stores must expose narrow selectors/actions.
- Feature-local stores must define reset behavior.

Owner:

- Owning feature only.

## Shared State Rules

Shared State is allowed only when multiple features require the same non-domain state.

Allowed shared state examples:

- Authenticated user context
- Workspace context
- Theme or layout preference
- Global app readiness / boot status

Forbidden shared state examples:

- LaundryWork workflow details
- Count Line editing state
- Feature-specific selected rows
- Form input values
- Business mutation state

Rules:

- Shared state must be minimal.
- Shared state must not become a dumping ground for feature state.
- Shared UI must not import feature stores.
- Feature stores may read shared state through approved selectors or props.
- Business domain state should remain feature-owned or server-cache-owned.

## Zustand Usage Rules

Zustand may be used for lightweight frontend state where component state is insufficient.

Allowed:

- Feature-local client state
- Runtime view state
- Draft state with explicit reset rules
- Workspace shell UI state
- Small shared app state

Forbidden:

- Replacing API cache with Zustand
- Storing backend truth as long-lived duplicated data
- Placing business workflow rules inside stores
- Importing feature stores from shared UI
- Creating global stores for every feature by default

Required Zustand standards:

- Use feature-first store location.
- Use explicit store naming.
- Use selector-based reads.
- Keep actions small and intention-revealing.
- Provide reset actions for feature-local stores.
- Persist only approved state.
- Avoid hidden cross-store side effects.
- Do not use stores to bypass API contracts.

## State Ownership Matrix

| State Type | Owner | Persistence | Reset Trigger | Notes |
|---|---|---|---|---|
| Client State | Component or feature-local store | No by default | Domain exit / component unmount | UI-only |
| Server State | API cache boundary | Cache policy in FE-06 | Invalidation / logout / workspace switch | Backend/database truth |
| Form State | Form controller | No by default | Submit / cancel / route exit | May handoff to Draft State |
| Runtime State | Runtime host / feature boundary | No | Logout / workspace switch / domain exit | Coordinates current task only |
| Draft State | Feature-local draft boundary | Explicit only | Submit / discard / logout / workspace switch | Not server truth |
| Workspace State | Auth/workspace boundary | Session-approved only | Logout / workspace switch | Security-sensitive |
| Feature-local Store | Owning feature | No unless approved | Feature reset / logout / workspace switch | Must not leak to shared UI |

## State Reset Rules

All state must have a known reset boundary.

Required resets:

- Logout resets workspace, runtime, draft, form, and feature-local state.
- Workspace switch resets runtime, draft, form, feature-local projections, and workspace-scoped cache.
- Domain exit resets runtime and non-persistent client state.
- Successful submit resets form state and submitted draft state.
- Cancel/discard resets draft state.
- API invalidation clears affected server cache only.

Forbidden reset behavior:

- Silent reset of unsaved draft without user-visible discard behavior.
- Resetting global workspace state from a feature component.
- Keeping Resort Workspace state after resortId changes.
- Carrying runtime state across unrelated work contexts.

## State Persistence Rules

Persistence is denied by default.

Allowed persistence examples:

- Auth/session token where approved by auth design.
- Theme/layout preference.
- Explicitly approved draft state.
- Last selected workspace only when security rules allow it.

Forbidden persistence examples:

- Server State copies.
- Sensitive workspace-scoped data without explicit approval.
- Count session data unless defined as Draft State.
- Feature runtime state.
- API mutation status.

Persistence requirements:

- State must declare why it persists.
- State must declare when it expires or resets.
- State must be scoped by workspace when workspace-specific.
- Persisted draft state must have discard and recovery behavior.

## API Cache Boundary

The API cache boundary belongs to FE-06 Integration.

FE-05 only defines rules:

- API cache owns Server State.
- Feature stores do not replace API cache.
- Feature stores may hold projections or selected identifiers.
- Cache keys must include workspace scope when required.
- Resort Workspace cache keys must include resortId or be server-enforced by authenticated context.
- Mutation invalidation is defined in FE-06.
- UI components should consume mapped projections rather than raw backend response shape when possible.

## Store Naming Standard

Store files:

```text
<feature>.store.ts
<feature>-draft.store.ts
<feature>-runtime.store.ts
<feature>-workspace.store.ts
```

Hook/function names:

```text
use<Feature>Store
use<Feature>DraftStore
use<Feature>RuntimeStore
use<Feature>WorkspaceStore
```

Action names:

```text
set<Thing>
select<Thing>
reset<Feature>
reset<Feature>Draft
clear<Thing>
mark<Thing>Dirty
```

Naming rules:

- Store name must reveal ownership.
- Draft stores must include `draft` in the name.
- Runtime stores must include `runtime` in the name.
- Shared stores must include `app`, `auth`, or `workspace` ownership in the name.
- Avoid generic names such as `globalStore`, `dataStore`, or `commonStore`.

## Dependency Rules

Allowed direction:

```text
Page / Feature UI
↓
Feature hooks / controllers
↓
Feature-local store or API projection
↓
Shared app/workspace/auth state only through approved boundary
```

Forbidden direction:

```text
Shared UI → Feature store
Feature A store → Feature B store
Store → Page component
Store → Business Blueprint logic
Store → API contract mutation without FE-06 boundary
```

## Handoff to FE-06 Integration

FE-06 Integration must define:

- API client boundary
- Server State cache mechanism
- Query key standards
- Mutation and invalidation rules
- API response mapping
- Error/loading contract
- Workspace-scoped cache policy
- Handoff from form/draft state to API mutation
- Runtime refresh after mutation

FE-05 handoff output:

- State categories are defined.
- State ownership is defined.
- Reset rules are defined.
- Persistence rules are defined.
- Store naming standard is defined.
- API cache boundary is reserved for FE-06.

## Acceptance Checklist

- [x] Client State defined.
- [x] Server State defined.
- [x] Form State defined.
- [x] Runtime State defined.
- [x] Draft State defined.
- [x] Workspace State defined.
- [x] Feature-local Stores defined.
- [x] Shared State Rules defined.
- [x] Zustand Usage Rules defined.
- [x] State Ownership defined.
- [x] State Reset Rules defined.
- [x] State Persistence Rules defined.
- [x] API Cache Boundary defined.
- [x] Store Naming Standard defined.
- [x] Handoff to FE-06 Integration defined.

## Non-goals

- No store implementation.
- No runtime changes.
- No API integration.
- No business logic addition.
- No schema changes.
