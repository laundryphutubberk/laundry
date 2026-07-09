# FE-08-PERFORMANCE

Status: BASELINE
Execution Domain: Frontend
Document Type: Performance Architecture Standard

## Purpose

This document defines the frontend performance and optimization standard for the Laundry platform.

It is an architecture document only. It defines performance expectations, review standards, and handoff boundaries for future frontend execution.

## Scope

This standard applies to all frontend work across Laundry Workspace and Resort Workspace.

It covers:

- Page loading performance
- Bundle and routing performance
- Render behavior
- State update behavior
- API loading behavior
- Caching behavior
- Asset behavior
- Responsive performance
- Runtime performance
- Dashboard and table/list performance
- Review checklist before FE-09

## Non-Scope

This document does not implement performance changes.

The following are explicitly out of scope:

- Runtime code changes
- UI changes
- Component refactors
- API changes
- Store changes
- Route implementation
- Build configuration changes
- Library replacement

---

## 1. Performance Budget

Frontend features must be designed with a clear performance budget before implementation.

### Budget Principles

- Initial page load must stay lightweight.
- Workspace entry should not load unrelated domains.
- Route-specific logic should load only when the route is entered.
- Heavy dashboards, tables, charts, and reports must not block basic navigation.
- Performance cost must be reviewed before adding new dependencies.

### Budget Categories

Every frontend feature should be evaluated against:

- Initial load cost
- Route entry cost
- Interaction cost
- Render cost
- API waiting cost
- Asset loading cost
- Memory/runtime cost

### Budget Rule

If a feature increases load, render, or runtime cost, the feature must justify that cost through real user value.

---

## 2. Bundle Strategy

The bundle strategy must keep the application modular and domain-aware.

### Rules

- Shared shell code may be loaded early.
- Workspace-specific code should not be included in unrelated workspace entry paths.
- Large feature modules should not be bundled into the initial application shell.
- Rarely used screens should be separated from frequently used screens.
- Dependency additions must be reviewed for size, runtime impact, and overlap with existing utilities.

### Bundle Boundaries

Recommended bundle boundaries:

- App shell
- Authentication / entry routes
- Laundry Workspace routes
- Resort Workspace routes
- Dashboard modules
- Report modules
- Table-heavy modules
- Asset-heavy modules

---

## 3. Route-level Lazy Loading

Routes should be treated as natural loading boundaries.

### Standard

- Major route groups should be lazy-load candidates.
- Workspace-specific routes should load only after workspace entry.
- Report and analytics routes should not affect normal operational route loading.
- Error, loading, and fallback states must be planned at route boundaries.

### Route Review Questions

Before adding a route, answer:

- Is this route used frequently?
- Does it belong to Laundry Workspace or Resort Workspace?
- Does it require heavy data, charts, tables, or assets?
- Can it be loaded after user intent is clear?
- Does it need a route-level fallback state?

---

## 4. Feature-level Code Splitting

Feature-level code splitting must separate heavy or optional functionality from core workflow paths.

### Split Candidates

Code splitting should be considered for:

- Dashboards
- Reports
- Charts
- Export tools
- Import tools
- Advanced filters
- Large forms
- Table utilities
- Image-heavy views
- Admin-only tools

### Rule

Core operational paths must stay fast. Optional or heavy feature logic should load only when needed.

---

## 5. Render Optimization

Rendering must be intentional and bounded.

### Principles

- Avoid unnecessary re-render chains.
- Keep component responsibility small and clear.
- Avoid passing unstable objects, arrays, or callbacks through broad component trees unless justified.
- Avoid rendering hidden heavy sections when they are not needed.
- Separate shell layout rendering from data-heavy content rendering.

### Review Focus

Render review should check:

- Re-render frequency
- Parent-child render coupling
- Large list rendering
- Conditional heavy sections
- Derived calculation cost
- Layout shift risk

---

## 6. State Update Optimization

State updates must be scoped to the smallest practical surface.

### Rules

- Do not store derived values unless persistence or cross-surface reuse is required.
- Avoid broad store subscriptions for narrow UI needs.
- Avoid global state for local-only interaction state.
- Avoid repeated state writes during render cycles.
- Avoid state updates that trigger full workspace-level re-renders.

### Store Review Questions

Before adding or changing state, answer:

- Is this state local, feature-level, workspace-level, or app-level?
- Is this source state or derived state?
- Which components actually need updates when this changes?
- Can this be computed from existing source of truth?
- Could this create unnecessary re-render loops?

---

## 7. API Loading Strategy

API loading must follow user intent and workflow priority.

### Principles

- Load only the data needed for the current decision or action.
- Avoid loading all workspace data by default.
- Avoid blocking route entry on non-critical data.
- Separate critical operational data from secondary dashboard/report data.
- Use explicit loading, empty, error, and retry states.

### Loading Priority

Recommended priority order:

1. Route/access validation data
2. Current workflow data
3. User decision data
4. Secondary summary data
5. Reports, charts, and historical data

---

## 8. Caching Strategy

Caching must protect performance without hiding stale business truth.

### Rules

- Cache only data where stale tolerance is understood.
- Operational status data must be treated as freshness-sensitive.
- Dashboard summaries may use controlled refresh behavior.
- Static reference data may be cached more aggressively.
- Cache invalidation must be planned before implementation.

### Cache Categories

- Static reference data
- Workspace session data
- Route data
- Dashboard summary data
- Table/list query data
- Asset data

### Freshness Rule

Business-critical workflow state must favor correctness over perceived speed.

---

## 9. Image / Asset Strategy

Images and assets must not block core workflow usage.

### Standards

- Use optimized formats where appropriate.
- Avoid loading large images before user intent is clear.
- Prefer responsive asset sizing.
- Defer non-critical assets.
- Avoid embedding large assets into core bundles.
- Review icon, image, and illustration usage for size and relevance.

### Asset Review Questions

- Is this asset needed for operation or only decoration?
- Can it be lazy-loaded?
- Does it affect route entry speed?
- Is the displayed size appropriate for the downloaded size?
- Does it create layout shift?

---

## 10. Responsive Performance

Responsive design must remain performant across desktop, tablet, and mobile contexts.

### Principles

- Avoid duplicate heavy DOM structures for responsive layouts.
- Avoid rendering both mobile and desktop heavy surfaces at the same time.
- Keep touch workflows lightweight.
- Avoid layout patterns that cause repeated recalculation.
- Maintain readable loading states on small screens.

### Review Focus

- Mobile route entry speed
- Table/list behavior on small screens
- Dashboard widget density
- Asset sizing
- Interaction latency
- Layout stability

---

## 11. Runtime Performance

Runtime performance covers behavior after the page has loaded.

### Standards

- Interactions should feel immediate for common workflow actions.
- Expensive calculations should not run repeatedly during normal rendering.
- Polling, refresh, and realtime-like behavior must be justified.
- Long-running UI work must not block critical interactions.
- Runtime memory growth must be considered for long workspace sessions.

### Risk Areas

- Dashboards left open for long periods
- Large tables
- Repeated filters/searches
- Frequent status refreshes
- Workspace switching
- Upload or asset-heavy screens

---

## 12. Dashboard Performance

Dashboards must summarize reality without becoming a performance bottleneck.

### Rules

- Dashboard widgets should load independently when possible.
- Critical summary cards should be prioritized over secondary analytics.
- Heavy charts should not block dashboard entry.
- Dashboard data should be scoped by workspace.
- Resort Workspace dashboards must never load data outside their own resort scope.

### Dashboard Review Questions

- Which dashboard data is critical at first paint?
- Which data can load after the shell appears?
- Which widgets are expensive?
- Which widgets depend on fresh operational state?
- Which summaries can tolerate cached data?

---

## 13. Table/List Performance

Tables and lists are high-risk performance surfaces.

### Standards

- Avoid loading unbounded lists.
- Use pagination, filtering, or progressive loading for large datasets.
- Search and filter behavior must avoid unnecessary full reloads.
- Table rows should render only necessary information.
- Heavy row actions should not load until needed.
- Empty, loading, and error states must be clear.

### Review Focus

- Dataset size
- Query scope
- Workspace isolation
- Sorting cost
- Filtering cost
- Row render cost
- Action menu cost
- Mobile table behavior

---

## 14. Performance Review Checklist

Before frontend implementation moves forward, review the following:

### Architecture

- [ ] Does the feature respect workspace boundaries?
- [ ] Is the performance cost justified by user value?
- [ ] Is the feature in the correct route or module boundary?
- [ ] Is heavy logic separated from core workflow paths?

### Loading

- [ ] Is route-level loading planned?
- [ ] Is feature-level code splitting considered?
- [ ] Is API loading scoped to current user intent?
- [ ] Are loading, empty, error, and retry states defined?

### Rendering

- [ ] Are unnecessary re-renders avoided?
- [ ] Are large lists/tables bounded?
- [ ] Are derived calculations controlled?
- [ ] Are hidden heavy sections avoided?

### State

- [ ] Is state scoped correctly?
- [ ] Are broad subscriptions avoided?
- [ ] Is derived state avoided unless necessary?
- [ ] Are update loops prevented?

### Assets

- [ ] Are images/assets optimized?
- [ ] Are non-critical assets deferred?
- [ ] Is responsive asset sizing considered?
- [ ] Is layout shift risk reviewed?

### Runtime

- [ ] Is long-session behavior considered?
- [ ] Are polling or refresh behaviors justified?
- [ ] Is dashboard runtime cost reviewed?
- [ ] Is table/list runtime cost reviewed?

---

## 15. Handoff to FE-09

FE-09 should use this document as the frontend performance standard when planning implementation.

### Handoff Requirements

Before FE-09 implementation begins, FE-09 should confirm:

- Which routes require lazy loading
- Which features require code splitting
- Which APIs are critical versus secondary
- Which data can be cached and which must remain fresh
- Which dashboards or tables need special performance treatment
- Which assets require optimization
- Which review checklist items apply to the target feature

### Handoff Boundary

FE-08 defines standards only.

FE-09 may translate these standards into implementation tasks, but implementation details must be decided in the FE-09 execution scope.

---

## Completion Status

FE-08 Performance Architecture Document is ready for FE-09 handoff.
