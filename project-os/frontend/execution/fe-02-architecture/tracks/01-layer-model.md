# FE-02 Track 01 — Layer Model

Status: DRAFT
Owner: FE-02 Architecture

## Purpose

Define the frontend layer model so every screen, route, component, state module, and API boundary has a clear responsibility.

## Layer Order

```text
App Shell
  -> Workspace Shell
  -> Route Layer
  -> Page Layer
  -> Feature Module Layer
  -> Shared UI Layer
  -> State / Service Layer
  -> API Contract Boundary
```

## Responsibilities

### App Shell

Owns global providers, router mounting, global layout boot, and application-wide error boundaries.

Must not contain laundry business workflow logic.

### Workspace Shell

Owns workspace separation between Laundry Workspace and Resort Workspace.

Laundry Workspace may access laundry-wide operational views.

Resort Workspace must only access data scoped by `resortId`.

### Route Layer

Owns URL structure and route guards.

Routes must express workspace and task entry clearly.

### Page Layer

Owns page composition and task-first ordering.

Pages compose features; pages must avoid deep business logic.

### Feature Module Layer

Owns domain-specific frontend behavior for one feature area such as Laundry Work, Resort, Inventory, Issue, or Reports.

### Shared UI Layer

Owns reusable UI primitives and layout-neutral components.

Shared UI must not import feature-specific business state.

### State / Service Layer

Owns client-side state, API calls, loading/error state, and view model preparation.

State must be separated from view.

### API Contract Boundary

Owns typed request/response expectations between frontend and backend.

Frontend must not assume fields not supported by schema/contracts.

## Rules

- One codebase.
- One business logic path.
- One component adapted by layout.
- No Desktop/Mobile duplicate component families.
- Workspace isolation starts at route and continues through state and API calls.
- Work Detail remains the main operation screen for laundry staff.

## Output

This track defines the baseline layer model for FE-02 Architecture.
