# FE-02 Track 03 — Dependency Direction

Status: DRAFT
Owner: FE-02 Architecture

## Purpose

Define allowed frontend dependency direction to keep architecture stable, testable, and safe for parallel execution.

## Dependency Direction

```text
App Shell
  imports Workspace Shell
Workspace Shell
  imports Routes, Shared UI, Workspace State
Routes
  import Pages and Guards
Pages
  import Feature Modules and Shared UI
Feature Modules
  import Feature State, Feature Services, Shared UI, API Client
Feature State / Services
  import API Client and Types
Shared UI
  imports only UI primitives, styling utilities, and generic helpers
API Client
  imports contract/types only
```

## Allowed Dependencies

- Page -> Feature Module
- Page -> Shared UI
- Feature Module -> Feature State
- Feature Module -> Feature Service
- Feature Module -> Shared UI
- Feature State -> API Client
- Feature Service -> API Client
- API Client -> Contract Types
- Shared UI -> Generic Utilities

## Forbidden Dependencies

- Shared UI -> Feature Module
- Shared UI -> Feature Store
- API Client -> Page
- API Client -> Component
- Feature Module -> App Shell
- Resort Workspace -> Laundry-only operational state unless explicitly allowed by a read-only resort-scoped contract
- Report Domain -> Operational mutation service

## State Rule

State is separated from view.

Components may consume prepared view state, but business transitions must live in feature state/service modules.

## Workspace Isolation Rule

Every Resort Workspace dependency path must preserve `resortId` scoping.

```text
Resort Route
  -> Resort Page
  -> Resort Feature Module
  -> Resort-scoped State/Service
  -> API request with resort scope
```

## Output

This track defines frontend dependency direction and forbidden import relationships for FE-02 Architecture.
