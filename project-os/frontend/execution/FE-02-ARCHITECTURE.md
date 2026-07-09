# FE-02 Architecture

Status: BASELINE_DRAFT
Owner: FE-02 Architecture
Scope: Route / Layout / Screen / Component Boundary

## 1. Purpose

FE-02 defines the frontend architecture map for the whole system before runtime and UI implementation.

This document follows the FE-01 Scanner Architecture baseline:

- Feature-first
- Runtime-first
- Responsibility-first
- Workspace-aware
- Contract-driven

FE-02 does not create UI, business logic, runtime code, or implementation changes.

## 2. Source References

Only these reference files were used for this task:

- `project-os/frontend/architecture/FE-ARCHITECTURE.md`
- `project-os/frontend/architecture/FEATURE-STANDARD.md`
- `project-os/frontend/architecture/IMPORT-RULES.md`
- `frontend/src/ARCHITECTURE.md`
- `frontend/src/features/README.md`

## 3. Architecture Baseline

Frontend source layout remains:

```text
frontend/src/
  app/
  routes/
  layouts/
  features/
  shared/
```

Feature packages follow Scanner Architecture:

```text
feature-name/
  FEATURE.md
  api/
  components/
  config/
  engines/
  hooks/
  mappers/
  models/
  pages/
  policies/
  projections/
  runtime/
  stores/
```

## 4. Route Map

Route ownership belongs to `frontend/src/routes/`.

Routes should map users into workspace-aware screens and feature-owned pages.

```text
/
  -> workspace entry / redirect by authenticated workspace

/laundry
  -> Laundry Workspace dashboard

/laundry/works
  -> Laundry Work list / task queue

/laundry/works/new
  -> Create Laundry Work

/laundry/works/:workId
  -> Work Detail

/laundry/works/:workId/bags
  -> Laundry Bag workflow inside a work

/laundry/issues
  -> Issue management

/laundry/inventory
  -> Laundry-side inventory visibility

/laundry/resorts
  -> Resort management

/laundry/reports
  -> Laundry reports

/resort
  -> Resort Workspace dashboard

/resort/inventory
  -> Resort inventory visibility

/resort/history
  -> Resort laundry work history

/resort/issues
  -> Resort issue visibility
```

Route definitions must not own business workflow logic.

## 5. Layout Map

Layout ownership belongs to `frontend/src/layouts/`.

```text
layouts/
  RootLayout
  AuthLayout
  LaundryWorkspaceLayout
  ResortWorkspaceLayout
  WorkDetailLayout
```

### RootLayout

Global application frame and provider-safe layout boundary.

### AuthLayout

Authentication-related layout boundary.

### LaundryWorkspaceLayout

Layout for laundry owner, manager, and staff operations.

Shows laundry task entry, navigation, and workspace shell.

### ResortWorkspaceLayout

Layout for resort owner and resort staff views.

Must present only resort-scoped views.

### WorkDetailLayout

Focused operational layout for Laundry Work detail.

This layout supports the main workflow screen without owning business logic.

## 6. Workspace Boundary

Workspace boundary is architectural, not only visual.

```text
Laundry Workspace
  -> laundry-wide operational views
  -> may see many resorts when role allows

Resort Workspace
  -> resort-scoped views only
  -> must preserve resort ownership boundary
```

Workspace boundary must be reflected in:

- routes
- layouts
- feature page entry
- state ownership
- API contract usage
- screen visibility

## 7. Feature Ownership

Current feature ownership follows `frontend/src/features/README.md`.

| Feature | Ownership |
|---|---|
| `workspace` | workspace boundary, workspace runtime, workspace-aware entry |
| `dashboard` | task-oriented dashboards |
| `laundry-works` | operational center for Laundry Work |
| `laundry-bags` | bag intake and bag-level workflow |
| `issues` | explicit issue reporting and management |
| `inventory` | calculated inventory visibility |
| `resorts` | resort management and resort-scoped views |

Each feature owns its own:

- domain-facing logic
- UI composition inside the feature
- runtime rules
- projections
- policies
- mappers
- hooks
- stores
- API boundary for the feature

## 8. Screen Inventory

### Workspace Screens

| Screen | Route | Owning Feature | Layout |
|---|---|---|---|
| Workspace Entry | `/` | `workspace` | `RootLayout` |
| Laundry Dashboard | `/laundry` | `dashboard` | `LaundryWorkspaceLayout` |
| Resort Dashboard | `/resort` | `dashboard` | `ResortWorkspaceLayout` |

### Laundry Work Screens

| Screen | Route | Owning Feature | Layout |
|---|---|---|---|
| Work List / Task Queue | `/laundry/works` | `laundry-works` | `LaundryWorkspaceLayout` |
| Create Laundry Work | `/laundry/works/new` | `laundry-works` | `LaundryWorkspaceLayout` |
| Work Detail | `/laundry/works/:workId` | `laundry-works` | `WorkDetailLayout` |
| Bag Workflow | `/laundry/works/:workId/bags` | `laundry-bags` | `WorkDetailLayout` |

### Issue Screens

| Screen | Route | Owning Feature | Layout |
|---|---|---|---|
| Laundry Issue Management | `/laundry/issues` | `issues` | `LaundryWorkspaceLayout` |
| Resort Issue Visibility | `/resort/issues` | `issues` | `ResortWorkspaceLayout` |

### Inventory Screens

| Screen | Route | Owning Feature | Layout |
|---|---|---|---|
| Laundry Inventory Visibility | `/laundry/inventory` | `inventory` | `LaundryWorkspaceLayout` |
| Resort Inventory Visibility | `/resort/inventory` | `inventory` | `ResortWorkspaceLayout` |

### Resort Screens

| Screen | Route | Owning Feature | Layout |
|---|---|---|---|
| Resort Management | `/laundry/resorts` | `resorts` | `LaundryWorkspaceLayout` |
| Resort Work History | `/resort/history` | `resorts` | `ResortWorkspaceLayout` |

### Report Screens

| Screen | Route | Owning Feature | Layout |
|---|---|---|---|
| Laundry Reports | `/laundry/reports` | `dashboard` | `LaundryWorkspaceLayout` |

## 9. Component Boundary

Components must be separated by responsibility.

```text
layout components
  -> workspace shell, navigation, responsive frame

page components
  -> screen composition and task-first ordering

feature components
  -> feature-owned UI composition

shared UI components
  -> business-neutral reusable UI only
```

### Rules

- Business logic does not live inside UI components.
- Components must not import API clients directly.
- UI components must not import stores directly unless explicitly designed as container components.
- Shared UI must never depend on features.
- Domain-specific components stay inside the owning feature.

## 10. Page-to-Feature Mapping

| Page Area | Owning Feature | Notes |
|---|---|---|
| Workspace entry | `workspace` | resolves workspace-aware entry |
| Laundry dashboard | `dashboard` | task-oriented dashboard |
| Resort dashboard | `dashboard` | resort-scoped dashboard |
| Work list | `laundry-works` | operational task queue |
| Work detail | `laundry-works` | main operation screen |
| Bag flow | `laundry-bags` | bag-level workflow inside work context |
| Issue management | `issues` | explicit issue handling |
| Inventory visibility | `inventory` | calculated inventory view |
| Resort management | `resorts` | laundry-side resort administration |
| Resort history | `resorts` | resort-scoped work history |
| Reports | `dashboard` | dashboard/report composition until report feature is separated by ADR |

## 11. Cross-feature Import Rules

Direct cross-feature imports are forbidden by default.

Allowed import direction:

```text
app / routes / layouts
  -> features
  -> shared
```

Feature packages may import from:

- their own feature package
- `shared/api`
- `shared/auth`
- `shared/ui`
- `shared/hooks`
- `shared/utils`
- `shared/constants`
- `shared/types`

Forbidden imports:

- feature A importing internal files from feature B
- shared importing from any feature
- pages importing backend transport directly
- components importing API clients directly
- generic UI components importing stores directly

If a feature needs another feature capability:

1. promote the shared part to `shared/` only if business-neutral
2. define a public boundary in the owning feature
3. create an ADR for intentional long-lived dependency

## 12. Feature Cell Work Map

Feature Cells translate the route/layout/screen architecture into execution ownership units.

Each cell owns its own Scanner Architecture package and must keep domain-facing work inside the cell unless a public boundary or ADR allows otherwise.

### 12.1 Feature Cell Summary

| Feature Cell | Primary Role | Workspace Scope | Primary Layouts |
|---|---|---|---|
| `workspace` | Workspace entry, workspace boundary, workspace-aware routing support | Laundry + Resort | `RootLayout`, `LaundryWorkspaceLayout`, `ResortWorkspaceLayout` |
| `dashboard` | Task-oriented dashboard and summary entry screens | Laundry + Resort | `LaundryWorkspaceLayout`, `ResortWorkspaceLayout` |
| `laundry-works` | Operational center for Laundry Work | Laundry | `LaundryWorkspaceLayout`, `WorkDetailLayout` |
| `laundry-bags` | Bag intake and bag-level workflow | Laundry | `WorkDetailLayout` |
| `issues` | Explicit issue reporting and issue visibility | Laundry + Resort | `LaundryWorkspaceLayout`, `ResortWorkspaceLayout`, `WorkDetailLayout` |
| `inventory` | Calculated inventory visibility | Laundry + Resort | `LaundryWorkspaceLayout`, `ResortWorkspaceLayout` |

### 12.2 `workspace` Cell

Owner: `frontend/src/features/workspace/`

Purpose:

- Own workspace boundary behavior.
- Own workspace-aware entry and navigation context.
- Keep Laundry Workspace and Resort Workspace separated.

Route ownership:

| Route | Screen | Layout | Ownership |
|---|---|---|---|
| `/` | Workspace Entry | `RootLayout` | resolve workspace entry without feature business logic |
| `/laundry` | Laundry Workspace Entry | `LaundryWorkspaceLayout` | workspace shell boundary only |
| `/resort` | Resort Workspace Entry | `ResortWorkspaceLayout` | resort-scoped shell boundary only |

Screen ownership:

- Workspace Entry
- Laundry Workspace Shell Entry
- Resort Workspace Shell Entry

Boundary:

- Does not own dashboard widgets.
- Does not own Laundry Work workflow.
- Does not own inventory or issue business rules.

### 12.3 `dashboard` Cell

Owner: `frontend/src/features/dashboard/`

Purpose:

- Own task-oriented dashboard screens.
- Surface current work, pending work, issue summaries, and inventory summaries through feature-safe inputs.

Route ownership:

| Route | Screen | Layout | Ownership |
|---|---|---|---|
| `/laundry` | Laundry Dashboard | `LaundryWorkspaceLayout` | laundry-wide task dashboard |
| `/resort` | Resort Dashboard | `ResortWorkspaceLayout` | resort-scoped dashboard |
| `/laundry/reports` | Laundry Reports | `LaundryWorkspaceLayout` | baseline report composition until a dedicated reports cell exists |

Screen ownership:

- Laundry Dashboard
- Resort Dashboard
- Laundry Reports baseline screen

Boundary:

- Reads prepared summaries through feature boundaries or shared contracts.
- Does not mutate operational workflow state.
- Does not import internal files from `laundry-works`, `issues`, or `inventory`.

### 12.4 `laundry-works` Cell

Owner: `frontend/src/features/laundry-works/`

Purpose:

- Own the main Laundry Work operation flow.
- Own Work List, Create Laundry Work, and Work Detail screens.
- Treat Work Detail as the main operational screen.

Route ownership:

| Route | Screen | Layout | Ownership |
|---|---|---|---|
| `/laundry/works` | Work List / Task Queue | `LaundryWorkspaceLayout` | laundry work queue and task entry |
| `/laundry/works/new` | Create Laundry Work | `LaundryWorkspaceLayout` | create work screen ownership |
| `/laundry/works/:workId` | Work Detail | `WorkDetailLayout` | main work operation screen |

Screen ownership:

- Work List / Task Queue
- Create Laundry Work
- Work Detail

Boundary:

- Owns Laundry Work workflow-facing pages, runtime, policies, projections, mappers, hooks, stores, and API boundary.
- May expose public boundary inputs for `laundry-bags`, `issues`, and `dashboard` if needed.
- Must not import internal files from `laundry-bags`, `issues`, or `inventory`.

### 12.5 `laundry-bags` Cell

Owner: `frontend/src/features/laundry-bags/`

Purpose:

- Own bag intake and bag-level workflow inside a Laundry Work context.
- Keep bag behavior separate from overall Laundry Work orchestration.

Route ownership:

| Route | Screen | Layout | Ownership |
|---|---|---|---|
| `/laundry/works/:workId/bags` | Bag Workflow | `WorkDetailLayout` | bag intake and bag-level workflow |

Screen ownership:

- Bag Workflow
- Bag list within work context
- Bag open/count support surfaces when assigned by FE-04

Boundary:

- Operates inside a `workId` context.
- Does not own the full Work Detail screen.
- Does not own inventory calculation or issue resolution.
- Uses public boundaries or contracts when interacting with `laundry-works`.

### 12.6 `issues` Cell

Owner: `frontend/src/features/issues/`

Purpose:

- Own explicit issue reporting and issue management.
- Support damaged, missing, count mismatch, return mismatch, and other issue visibility.

Route ownership:

| Route | Screen | Layout | Ownership |
|---|---|---|---|
| `/laundry/issues` | Laundry Issue Management | `LaundryWorkspaceLayout` | laundry-wide issue management |
| `/resort/issues` | Resort Issue Visibility | `ResortWorkspaceLayout` | resort-scoped issue visibility |
| `/laundry/works/:workId` | Work Detail Issue Panel | `WorkDetailLayout` | feature-owned panel only, not page ownership |

Screen ownership:

- Laundry Issue Management
- Resort Issue Visibility
- Work Detail issue panel or section when composed by FE-04

Boundary:

- Owns issue runtime, policies, projections, mappers, hooks, stores, and API boundary.
- Does not own Work Detail page shell.
- Does not mutate Laundry Work status except through approved runtime/contract boundary.
- Resort issue screens must remain resort-scoped.

### 12.7 `inventory` Cell

Owner: `frontend/src/features/inventory/`

Purpose:

- Own calculated inventory visibility.
- Present inventory derived from work and movement history.

Route ownership:

| Route | Screen | Layout | Ownership |
|---|---|---|---|
| `/laundry/inventory` | Laundry Inventory Visibility | `LaundryWorkspaceLayout` | laundry-side inventory visibility |
| `/resort/inventory` | Resort Inventory Visibility | `ResortWorkspaceLayout` | resort-scoped inventory visibility |

Screen ownership:

- Laundry Inventory Visibility
- Resort Inventory Visibility
- Inventory summary sections when composed by dashboard

Boundary:

- Inventory is visibility over calculated state.
- Does not own manual operational work mutation.
- Does not directly import internal movement/work logic from other features.
- Dashboard may consume inventory summaries only through a public boundary or shared contract.

### 12.8 Cell Import Boundary

Default direction remains:

```text
app / routes / layouts
  -> features
  -> shared
```

Feature cell to feature cell internal imports are forbidden by default.

Allowed collaboration patterns:

1. Shared business-neutral utilities move to `shared/`.
2. Owning feature defines a public boundary.
3. Long-lived cross-cell dependency requires ADR.

## 13. FE-03 Runtime Handoff

FE-03 should define runtime behavior without changing this architecture boundary.

Handoff inputs for FE-03:

- workspace runtime entry
- route guard runtime
- work status lifecycle runtime
- feature runtime ownership
- policy boundary per feature
- projection and mapper responsibility
- state ownership rules
- Feature Cell Work Map

FE-03 must preserve:

- Scanner feature package structure
- workspace-aware runtime
- no business logic inside UI components
- no direct cross-feature imports
- feature cell ownership boundaries

## 14. FE-04 UI Composition Handoff

FE-04 should design UI composition inside the boundaries defined here.

Handoff inputs for FE-04:

- layout map
- screen inventory
- page-to-feature mapping
- component responsibility boundary
- task-oriented UI requirement
- adaptive workspace requirement
- Feature Cell Work Map

FE-04 must preserve:

- one codebase
- one business logic model
- adaptive layout instead of separate desktop/mobile component families
- shared UI as business-neutral only
- feature-owned UI composition inside feature packages
- page ownership and feature cell ownership boundaries

## 15. Non-goals

FE-02 does not:

- create UI
- create business logic
- create runtime code
- modify existing implementation
- change API contracts
- change schema
- change existing feature skeleton

## 16. Done State

FE-02 is ready for review when:

- route map is defined
- layout map is defined
- workspace boundary is defined
- feature ownership is defined
- screen inventory is defined
- component boundary is defined
- page-to-feature mapping is defined
- cross-feature import rules are defined
- Feature Cell Work Map is defined
- FE-03 handoff is defined
- FE-04 handoff is defined
