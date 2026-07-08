# FE-02 Track 04 — Package Structure

Status: DRAFT
Owner: FE-02 Architecture

## Purpose

Define the target frontend package and folder structure for implementation planning.

## Target Structure

```text
frontend/
  src/
    app/
      providers/
      router/
      shell/
    workspaces/
      laundry/
        routes/
        pages/
        shell/
      resort/
        routes/
        pages/
        shell/
    features/
      auth/
      laundry-work/
      resort/
      linen-inventory/
      issue/
      reports/
    shared/
      ui/
      layout/
      lib/
      types/
    services/
      api/
      contracts/
```

## Package Ownership

### `app/`

Application boot, providers, router mounting, and global shell composition.

### `workspaces/`

Workspace shells, workspace routes, workspace navigation, and workspace-level page entry.

### `features/`

Business-facing frontend modules grouped by domain.

Each feature may contain components, state, services, hooks, and feature-specific types.

### `shared/`

Reusable UI primitives, common layout utilities, generic helpers, and shared types.

Shared must not depend on feature packages.

### `services/api/`

API client and transport-level utilities.

### `services/contracts/`

Frontend-facing API/domain contracts.

Contracts must align with backend and schema truth.

## Naming Rule

Use domain language from Project Glossary and Business Blueprint.

Do not invent new names for existing business concepts.

## Routing Shape

```text
/
/laundry
/laundry/works
/laundry/works/:workId
/laundry/resorts
/laundry/inventory
/laundry/issues
/laundry/reports
/resort
/resort/inventory
/resort/history
/resort/issues
```

Route names are baseline architecture outputs and may be refined by later FE runtime/UI tasks.

## Output

This track defines the baseline frontend package structure for FE-02 Architecture.
