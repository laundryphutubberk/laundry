# FE-09 Governance

Status: BASELINE
Execution Version: v2

## Purpose

FE-09 Governance controls frontend development so that every Feature Cell remains aligned with the approved Frontend Architecture Baseline.

This domain defines governance rules only. It does not implement features, modify runtime behavior, or change UI behavior.

## Mission

Prevent Feature Development from drifting away from the established frontend architecture through explicit review rules for:

- Naming
- Imports
- Feature ownership
- Shared module usage
- Architecture drift

## Governance Scope

FE-09 applies to all frontend Feature Cells, shared modules, routes, stores, API clients, components, utilities, and cross-feature dependencies.

Every new or modified frontend feature must pass FE-09 review before it is considered architecture-compliant.

## 1. Naming Governance

Naming must communicate domain ownership and responsibility clearly.

Required rules:

- Feature folders use stable domain-oriented names.
- Components use PascalCase.
- Hooks use the `use` prefix.
- Stores use a clear feature or domain suffix such as `Store`.
- API modules use a clear feature or domain suffix such as `Api`.
- Utility names describe one responsibility.
- Shared names must remain domain-neutral.
- Avoid generic names such as `helper`, `common`, `misc`, `data`, or `utils2` when responsibility is unclear.
- Do not create duplicate names for the same domain concept.
- New business terms must align with the Project Glossary.

Naming review questions:

- Does the name reveal the owning feature or domain?
- Does the name match the responsibility of the file?
- Is the term already defined elsewhere under a different name?
- Would another developer know where this code belongs from its name alone?

## 2. Import Rules

Imports must preserve feature boundaries and dependency direction.

Required rules:

- A Feature Cell may import from its own internal modules.
- A Feature Cell may import approved shared modules.
- A Feature Cell must not import another feature's internal files directly.
- Cross-feature access must use an explicit public entry point or approved contract.
- Shared modules must not import feature-owned modules.
- UI components must not import database, server, or backend-only code.
- View layers must not become the owner of business rules.
- Circular dependencies are prohibited.
- Deep relative imports that bypass a feature boundary are prohibited.
- Import aliases must follow the approved project structure.

Dependency direction:

```text
App / Routes
    ↓
Feature Public API
    ↓
Feature Components / State / Services
    ↓
Approved Shared Modules
```

Prohibited direction:

```text
Shared Module
    ↓
Feature Internal Module
```

## 3. Feature Ownership

Every frontend artifact must have one clear owner.

Required rules:

- Feature-specific components belong to the owning Feature Cell.
- Feature-specific state belongs to the owning Feature Cell.
- Feature-specific API access belongs to the owning Feature Cell.
- Feature-specific validation and domain mapping belong to the owning Feature Cell.
- Routes must point to feature-owned public surfaces.
- Shared ownership is not assumed merely because two features use similar code.
- Ownership transfer requires an explicit architecture decision.

Ownership review questions:

- Which Feature Cell owns this responsibility?
- Is the file stored inside that owner's boundary?
- Is another feature reaching into internal implementation?
- Has duplicated logic appeared because ownership is unclear?

## 4. Shared Module Governance

Shared is a controlled architectural layer, not a default destination.

A module may become shared only when:

- It is used by more than one Feature Cell.
- Its responsibility is domain-neutral or intentionally cross-domain.
- It has a stable API.
- It does not depend on feature internals.
- Its ownership and maintenance responsibility are clear.

Shared misuse includes:

- Moving code to shared before real reuse exists.
- Placing feature business logic in shared.
- Creating a large catch-all shared folder.
- Using shared to bypass feature boundaries.
- Adding feature-specific conditions to a shared component.
- Allowing shared modules to become hidden global state owners.

Required action when shared misuse is found:

- Return the artifact to the correct Feature Cell, or
- Define a stable cross-feature contract, or
- Record an approved architecture exception.

## 5. Architecture Drift Control

Architecture drift is any change that causes implementation structure or dependency behavior to diverge from the Frontend Architecture Baseline.

Drift indicators:

- New folder patterns that conflict with the approved structure.
- Direct imports across feature internals.
- Business logic moved into UI components.
- State ownership duplicated across Feature Cells.
- Shared modules importing feature code.
- Route logic bypassing feature public APIs.
- New global state without explicit approval.
- Duplicate domain concepts or naming.
- Desktop and mobile implementations split into separate business components.
- Workspace isolation handled inconsistently across features.

Drift review must determine:

- Whether the change is accidental drift.
- Whether the baseline is still correct.
- Whether an architecture decision is required.
- Whether implementation must be corrected before merge.

Implementation must not redefine the architecture silently.

## 6. Feature Cell Compliance Checklist

Every Feature Cell must confirm:

- Ownership is explicit.
- Folder placement matches ownership.
- Naming follows project conventions.
- Imports respect dependency direction.
- No other feature imports internal files directly.
- Shared dependencies are approved and domain-neutral.
- Business logic remains outside presentational UI where required.
- State is separated from view responsibilities.
- Workspace isolation rules are preserved.
- Adaptive UI rules are preserved.
- No unapproved architecture exception exists.

## 7. Governance Review Gate

A feature is architecture-compliant only when:

- Naming review passes.
- Import review passes.
- Ownership review passes.
- Shared usage review passes.
- Architecture drift review passes.

Review outcomes:

```text
FE_BASELINE_COMPLIANT
FE_BASELINE_COMPLIANT_WITH_ACCEPTED_EXCEPTION
FE_BASELINE_BLOCKED
```

`FE_BASELINE_BLOCKED` must be used when a change violates a critical boundary or silently alters the architecture.

## 8. Exception Process

An exception may be accepted only when:

- The reason is explicit.
- The affected baseline rule is identified.
- The architectural consequence is understood.
- The exception owner is identified.
- A correction or review condition is defined when temporary.
- A major architecture change is recorded through the project ADR process.

Convenience alone is not sufficient justification for an exception.

## 9. Definition of Done

FE-09 Governance is satisfied when:

- Every Feature Cell follows the Frontend Architecture Baseline.
- Naming is consistent and ownership-aware.
- Imports preserve feature boundaries.
- Feature ownership is explicit.
- Shared misuse is prevented or corrected.
- Architecture drift is detected before acceptance.
- Exceptions are explicit and governed.

Final governance state:

```text
ALL_FEATURE_CELLS_FOLLOW_FE_BASELINE
```

## Structure

```text
README.md
TASK.md
STATUS.md
DECISIONS.md
EXECUTION-KERNEL.md
tracks/
reviews/
handoff/
artifacts/
```
