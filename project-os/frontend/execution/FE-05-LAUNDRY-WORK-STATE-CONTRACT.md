# FE-05 Laundry Work State Contract

Status: BASELINE
Owner: FE-05 State Domain
Scope: Frontend architecture document only

## Purpose

Define the State Contract for the Laundry Work frontend domain.

This document determines which Laundry Work state belongs to which store boundary, how each state resets, and whether each state may persist.

This contract does not implement stores, runtime behavior, API integration, or business workflow logic.

## Source of Truth

This contract extends:

- `project-os/frontend/execution/FE-05-STATE-MANAGEMENT.md`
- FE-02 Architecture boundaries
- FE-03 frontend foundation baseline
- FE-04 Workspace Layout rules
- Business Blueprint production flow
- `schema.prisma` models: LaundryWork, LaundryBag, LaundryCountLine, IssueReport, LinenInventorySummary, Resort, User

## Domain Boundary

Laundry Work frontend state covers UI and interaction state around:

- Laundry Work list / queue
- Laundry Work detail
- Laundry Bag selection
- Laundry Count Line drafting
- Issue visibility / selection
- Filters and workspace-scoped navigation
- Runtime context for current work interaction

Laundry Work state does not own backend truth.

Backend truth remains Server State and belongs to FE-06 API cache boundary.

## Store Ownership Summary

| Store Boundary | Owns | Does Not Own |
|---|---|---|
| `laundry-work.store.ts` | Client state, filter state, selected IDs | Server truth, API mutation, business workflow rules |
| `laundry-work-runtime.store.ts` | Current runtime mode and transient interaction state | Persisted drafts, server records |
| `laundry-work-draft.store.ts` | Unsaved count/issue/work drafts | Confirmed server records |
| Workspace/Auth boundary | workspaceType, role, resortId | Feature-specific selected work/bag/issue |
| FE-06 API cache | LaundryWork, LaundryBag, CountLine, IssueReport server records | Client-only UI state |

## Client State

Client State is UI-only state for Laundry Work screens.

Examples:

- Active panel in Work Detail
- Expanded/collapsed bag sections
- Active tab: overview, bags, count, issues, history
- Local list density / view mode
- Drawer or side panel visibility
- Temporary sort display preference

Store owner:

- `laundry-work.store.ts` when shared across the Laundry Work feature.
- Component state when isolated to one component.

Reset:

- Reset on Laundry Work domain exit.
- Reset on logout.
- Reset on workspace switch.
- Component-local state resets on unmount.

Persistence:

- No persistence by default.
- View preference may persist only if explicitly approved and not workspace-sensitive.

Rules:

- Client State must never determine WorkStatus.
- Client State must never mutate CountLine, Bag, or Issue server truth.
- Client State must not be shared through global stores.

## Draft State

Draft State is incomplete Laundry Work user input before server confirmation.

Examples:

- New Laundry Work draft before create submit
- Unsaved bag note draft
- Unsaved count line draft
- Unsaved issue report draft
- Multi-step count session draft if explicitly approved

Store owner:

- `laundry-work-draft.store.ts`
- Form controller for short-lived non-resumable forms

Reset:

- Reset on successful submit.
- Reset on explicit discard/cancel.
- Reset on logout.
- Reset on workspace switch.
- Reset when changing selected work if the draft belongs to the previous work, unless user explicitly saves/discards first.

Persistence:

- No persistence by default.
- Persistence allowed only for explicitly approved resumable drafts.
- Persisted draft must be scoped by workspace and selected workId when applicable.

Rules:

- Draft State is not Server State.
- Draft State must expose dirty/submitted/discarded status conceptually.
- Draft State must not overwrite API cache until FE-06 mutation confirms success.
- Draft State must not infer business workflow transitions.

## Runtime State

Runtime State is transient interaction state while operating on Laundry Work.

Examples:

- Current Work Detail mode: viewing, counting, issue-review, return-prep
- Current active task panel
- Current scan/tap interaction session
- Current optimistic interaction marker before FE-06 resolves API behavior
- Temporary runtime error or warning display
- Current step focus inside a screen

Store owner:

- `laundry-work-runtime.store.ts`
- Runtime host if the runtime state spans multiple Laundry Work components

Reset:

- Reset on domain exit.
- Reset on logout.
- Reset on workspace switch.
- Reset when selected work changes.
- Reset after confirmed submit/transition when FE-06 defines mutation refresh.

Persistence:

- Never persist by default.

Rules:

- Runtime State may coordinate UI but must not own business rules.
- Runtime State must not be used as backend truth.
- Runtime State must not survive unrelated work contexts.

## Filter State

Filter State controls Laundry Work list/query views.

Examples:

- Work status filter
- Resort filter in Laundry Workspace
- Date range filter
- Issue-only filter
- Return-ready filter
- Search text
- Sort mode

Store owner:

- `laundry-work.store.ts` for feature-level filter state.
- URL/search params may own shareable filters when FE-06/route contract approves.

Reset:

- Reset on logout.
- Reset on workspace switch.
- Reset when leaving Laundry Work domain unless explicitly preserved as a user preference.
- Reset invalid resort filter when workspaceType changes to RESORT.

Persistence:

- No persistence by default.
- URL persistence is allowed for shareable filter state.
- Local persistence requires explicit approval and must be workspace-scoped.

Rules:

- Resort Workspace filter state must not allow arbitrary resortId selection.
- Laundry Workspace may filter by resort only if role permits.
- Filter State defines query intent, not cached server result ownership.
- API cache query keys are FE-06 responsibility.

## Selected Work / Bag / Issue State

Selected State stores identifiers for the current UI focus.

Examples:

- selectedWorkId
- selectedBagId
- selectedIssueId
- selectedCountLineId
- activePanelId

Store owner:

- `laundry-work.store.ts` for selected IDs used across the feature.
- Component state for local-only selection.

Reset:

- Reset selectedBagId, selectedIssueId, and selectedCountLineId when selectedWorkId changes.
- Reset all selected IDs on domain exit.
- Reset all selected IDs on logout.
- Reset all selected IDs on workspace switch.
- Reset invalid selection when FE-06 server cache no longer contains the selected record.

Persistence:

- No persistence by default.
- Deep-link route params may represent selectedWorkId when route contract exists.
- Do not persist selectedBagId or selectedIssueId unless explicitly approved.

Rules:

- Selected State stores IDs only, not full server records.
- Selected State must be validated against workspace scope.
- Resort Workspace must not select work outside authenticated resortId.
- Selected State must not trigger business mutation by itself.

## Server State Boundary

Laundry Work server records include:

- LaundryWork
- LaundryBag
- LaundryCountLine
- IssueReport
- LinenInventorySummary
- WorkStatusLog
- Resort references

Owner:

- FE-06 API cache boundary.

Rules:

- Feature stores may hold selected IDs and view projections only.
- Feature stores must not duplicate full server records as source of truth.
- Mutations, invalidation, loading, and error contract belong to FE-06.
- Cache keys must preserve workspace scope.

## Store Contract

### `laundry-work.store.ts`

Owns:

- Client state shared inside Laundry Work feature
- Filter state
- Selected IDs
- Lightweight view preferences if approved

Does not own:

- Server records
- Draft payloads
- Runtime interaction sessions
- API mutation status
- Business workflow rules

Reset:

- `resetLaundryWork()` on domain exit/logout/workspace switch
- `resetLaundryWorkSelection()` when selected work changes or invalidates
- `resetLaundryWorkFilters()` when workspace changes or user clears filters

Persistence:

- None by default

### `laundry-work-runtime.store.ts`

Owns:

- Active runtime mode
- Active task panel
- Transient interaction state
- Temporary runtime warnings/errors

Does not own:

- Draft payloads
- Server records
- Workspace identity

Reset:

- `resetLaundryWorkRuntime()` on domain exit/logout/workspace switch/selected work change

Persistence:

- Never persist by default

### `laundry-work-draft.store.ts`

Owns:

- Unsaved Laundry Work draft
- Unsaved bag note draft
- Unsaved count line draft
- Unsaved issue report draft
- Dirty/discard/submitted conceptual flags

Does not own:

- Confirmed server records
- API cache
- Workspace identity

Reset:

- `resetLaundryWorkDraft()` after submit/discard/logout/workspace switch
- Draft must be cleared or confirmed before changing selected work when the draft is work-scoped

Persistence:

- None by default
- Explicit approval required for resumable drafts

## State Ownership Matrix

| State | Store / Boundary | Reset | Persist |
|---|---|---|---|
| Active tab/panel | `laundry-work.store.ts` or component | Domain exit / logout / workspace switch | No |
| Expanded bag sections | `laundry-work.store.ts` or component | Selected work change / domain exit | No |
| Work list filters | `laundry-work.store.ts` or URL params | Clear filters / workspace switch / logout | URL only if approved |
| selectedWorkId | `laundry-work.store.ts` or route param | Domain exit / logout / workspace switch / invalid selection | Route only if approved |
| selectedBagId | `laundry-work.store.ts` | selectedWorkId change / domain exit | No |
| selectedIssueId | `laundry-work.store.ts` | selectedWorkId change / domain exit | No |
| selectedCountLineId | `laundry-work.store.ts` | selectedWorkId change / domain exit | No |
| Runtime mode | `laundry-work-runtime.store.ts` | selectedWorkId change / domain exit / logout | No |
| Scan/tap session | `laundry-work-runtime.store.ts` | submit / cancel / selectedWorkId change | No |
| Count line draft | `laundry-work-draft.store.ts` or form | submit / discard / selectedWorkId change | Explicit only |
| Issue report draft | `laundry-work-draft.store.ts` or form | submit / discard / selectedWorkId change | Explicit only |
| LaundryWork record | FE-06 API cache | invalidation / logout / workspace switch | Cache only |
| LaundryBag record | FE-06 API cache | invalidation / logout / workspace switch | Cache only |
| IssueReport record | FE-06 API cache | invalidation / logout / workspace switch | Cache only |
| workspaceType / role / resortId | Auth/workspace boundary | logout / workspace switch | Session-approved only |

## Reset Scenarios

### Logout

Must reset:

- `laundry-work.store.ts`
- `laundry-work-runtime.store.ts`
- `laundry-work-draft.store.ts`
- Workspace-scoped FE-06 API cache

### Workspace Switch

Must reset:

- selectedWorkId
- selectedBagId
- selectedIssueId
- selectedCountLineId
- runtime mode
- active task panel
- drafts unless explicitly recovered under new workspace scope
- filters that are invalid for the new workspace

### Selected Work Change

Must reset:

- selectedBagId
- selectedIssueId
- selectedCountLineId
- runtime mode
- work-scoped draft state unless user confirms save/discard
- expanded bag sections from previous work

### Domain Exit

Must reset:

- client state
- runtime state
- selected IDs
- non-persistent filters if not URL-owned

### Successful Submit

Must reset:

- submitted form state
- submitted draft state
- transient runtime submit state

FE-06 will define API invalidation and refresh behavior.

## Persistence Contract

Default:

- Do not persist Laundry Work feature state.

Allowed only with explicit approval:

- URL-owned selectedWorkId
- URL-owned filters
- Resumable count/issue draft with workspace and work scope

Forbidden:

- Persisting server records in Zustand
- Persisting runtime mode
- Persisting selectedBagId/selectedIssueId by default
- Persisting sensitive workspace-scoped data without scope and expiry

## Handoff to FE-06 Integration

FE-06 must define:

- Laundry Work query keys
- Workspace-scoped server cache
- API response mapping into projections
- Mutation contracts for work, bag, count line, and issue actions
- Cache invalidation after submit
- Error/loading contract
- How selected IDs react to deleted/closed/inaccessible records
- How draft submit maps to API mutation

FE-05 provides only ownership, reset, and persistence boundaries.

## Acceptance Checklist

- [x] Client state defined.
- [x] Draft state defined.
- [x] Runtime state defined.
- [x] Filter state defined.
- [x] Selected work/bag/issue state defined.
- [x] Store ownership defined.
- [x] Reset rules defined.
- [x] Persistence rules defined.
- [x] Handoff to FE-06 Integration defined.

## Non-goals

- No store implementation.
- No runtime changes.
- No API integration.
- No business logic addition.
- No schema changes.
