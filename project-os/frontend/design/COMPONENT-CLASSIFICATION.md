# COMPONENT-CLASSIFICATION.md

Status: Active
Owner: Frontend Architect

## Purpose

Classify frontend components before implementation so components keep clear responsibility.

## Component Types

| Type | Responsibility |
|---|---|
| Primitive UI | Basic visual element |
| Composite UI | Reusable UI composition |
| Business Component | Domain-specific display or control |
| Workflow Component | Step-oriented operational UI |
| Screen Component | Top-level screen composition |
| Layout Component | Navigation and responsive shell |

## Rules

- Primitive and Composite components should not contain domain workflow rules.
- Business components may use domain language but should not call APIs directly.
- Workflow components should delegate API/state work to hooks, stores, or view-models.
- Screen components compose workflow, state, route params, and layout.
- Shared components should not import module-specific stores or APIs.

## Shared Promotion Rule

A component may move to shared only when:

1. Used in at least two places
2. Behavior is identical
3. No domain workflow rule is embedded
4. Naming is domain-neutral
5. Frontend Architect approves promotion
