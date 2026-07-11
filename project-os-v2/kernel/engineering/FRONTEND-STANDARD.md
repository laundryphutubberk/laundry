# Frontend Engineering Standard

Status: DRAFT

## Purpose

Provide a framework-adaptable frontend baseline centered on business flows, accessibility, and explicit state ownership.

## Canonical Flow

```text
Screen or route
  -> runtime host/controller/view model
  -> policy and state boundary
  -> API client/adapter
  -> approved backend contract
  -> normalized projection
  -> presentation component
```

## Responsibility Boundaries

- Pages compose screens and route context.
- Controllers orchestrate load, commands, refresh, cancellation, and duplicate-submit protection.
- Policy decides allowed actions from trusted runtime context.
- Stores own only explicitly scoped state.
- API clients own transport and response normalization.
- Projections produce display-ready data and action models.
- Presentation components render and emit user intent; they do not call APIs or derive permissions.

## State Rules

Every server interaction should model loading, success, empty, error, retry, and request identity where relevant. Local preview or optimistic state must not be presented as durable success without an explicit reconciliation strategy.

## Adaptive and Accessible UI

- Preserve one business meaning across viewport sizes.
- Prefer one responsive component family over duplicated desktop/mobile business components.
- Define keyboard operation, focus behavior, labels, errors, and touch targets for interactive flows.
- Make destructive and irreversible actions explicit.
- Translate backend state into user-facing work instructions rather than exposing implementation enums directly.

## Security Boundary

Frontend policy improves UX but never replaces backend authorization. Do not store secrets in client code or log tokens, credentials, or sensitive records.

## Verification Minimum

- production build and type/static check;
- lint and architecture boundary check;
- controller/policy/state tests where supported;
- API contract mapping verification;
- critical route render and user-flow verification;
- keyboard, focus, responsive, and error-state review;
- console and sensitive-data review.
