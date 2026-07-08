# FRONTEND-STRUCTURE-BLUEPRINT.md

Status: Active  
Owner: Frontend Architect  
Project: `laundryphutubberk/laundry`

## Purpose

Defines the target frontend structure before FE-01 implementation starts.

Frontend execution should not start from React components directly. It should start from screens, workflows, API contracts, and capability coverage.

## Core Principle

```text
Business Screen
  -> Workflow
  -> Route
  -> ViewModel / State
  -> Components
  -> API Client
```

Do not make Route the primary design unit. Route is delivery. Screen and workflow are product units.

## Target Structure

```text
frontend/src/
  app/
    router/
    providers/
    layouts/
  modules/
    <domain>/
      screens/
      components/
      widgets/
      dialogs/
      stores/
      hooks/
      api/
      view-models/
      validation/
      constants/
      index.js
  shared/
    components/
    ui/
    hooks/
    api/
    state/
    utils/
    errors/
```

## Layer Rules

- Screen owns user workflow composition.
- ViewModel owns screen state shaping.
- Store owns durable client state.
- API client owns HTTP calls.
- Component owns presentation only.
- Shared components must not contain business rules.
- Business workflow logic must not be hidden inside generic UI components.

## Adaptive UI Rule

One component and one business logic path should support desktop, tablet, and mobile layouts.

Use layout adaptation, not separate business implementations.

## Maintenance Rule

Update this blueprint when frontend architecture, module structure, or FE execution rules change.
