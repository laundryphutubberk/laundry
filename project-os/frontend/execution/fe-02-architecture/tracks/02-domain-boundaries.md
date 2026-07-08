# FE-02 Track 02 — Domain Boundaries

Status: DRAFT
Owner: FE-02 Architecture

## Purpose

Define frontend domain boundaries so teams and AI agents can work without crossing ownership accidentally.

## Primary Workspaces

```text
Laundry Workspace
Resort Workspace
```

## Boundary Rule

Workspace boundary is not only UI layout. It is a data access and responsibility boundary.

Laundry Workspace may operate across resorts when the authenticated role allows it.

Resort Workspace must always scope data by the current user's `resortId`.

## Frontend Domains

### Auth Domain

Owns login/session state, role, workspace type, and access boot.

Does not own laundry work execution UI.

### Workspace Domain

Owns workspace selection, workspace shell, navigation model, and workspace-level guards.

Does not own feature business rules.

### Laundry Work Domain

Owns create work, receive bags, open bag, count items, sort type, sort color, record data, return work, close work, and Work Detail composition.

This is the operational center.

### Resort Domain

Owns resort profile, resort listing for laundry users, and resort-scoped dashboard entry for resort users.

### Linen Inventory Domain

Owns inventory summary views derived from movement/work history.

Inventory must not be treated as manually-entered source data.

### Issue Domain

Owns explicit issue reporting and issue management for damaged, missing, count mismatch, return mismatch, or other problems.

### Report Domain

Owns summary/report surfaces. Reports read from domain outputs and must not mutate operational state.

### Shared Domain

Owns reusable layout, UI primitives, formatting helpers, and common utilities.

Shared domain must stay business-light and must not depend on feature domains.

## Forbidden Boundary Crossings

- Resort Workspace reading another resort's data.
- Shared UI importing feature stores.
- Page components becoming API/service owners.
- Report domain mutating Laundry Work status.
- Inventory screen manually overriding calculated inventory without an explicit adjustment flow.

## Output

This track defines the domain boundary map for FE-02 Architecture.
