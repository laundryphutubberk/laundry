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
- Projection boundary
- Policy boundary
- Controller boundary

## Governance Scope

FE-09 applies to all frontend Feature Cells, shared modules, routes, stores, API clients, components, utilities, projections, policies, controllers, and cross-feature dependencies.

Every new or modified frontend feature must pass FE-09 review before it is considered architecture-compliant.

## 1. Naming Governance

Naming must communicate domain ownership and responsibility clearly.

Required rules:

- Feature folders use stable domain-oriented names.
- Components use PascalCase.
- Hooks use the `use` prefix.
- Stores use a clear feature or domain suffix such as `Store`.
- API modules use a clear feature or domain suffix such as `Api`.
- Projection modules use a clear feature or domain suffix such as `Projection`.
- Policy modules use a clear feature or domain suffix such as `Policy`.
- Controller modules use a clear feature or domain suffix such as `Controller`.
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
- UI components must not import API clients directly.
- UI components must not import stores directly when a controller or feature facade is the approved boundary.
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
Feature Controllers
    ↓
Feature Policies / Projections / State / Services
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
- Feature-specific projections belong to the owning Feature Cell.
- Feature-specific policies belong to the owning Feature Cell.
- Feature-specific controllers belong to the owning Feature Cell.
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
- API calls placed directly inside UI components.
- Store ownership or store access placed directly inside UI components when a controller or facade boundary is required.
- State ownership duplicated across Feature Cells.
- Shared modules importing feature code.
- Route logic bypassing feature public APIs.
- Projection rules bypassed or mixed into UI rendering.
- Policy decisions bypassed or duplicated inside components.
- Controller orchestration bypassed by direct API/store usage.
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

## 6. Projection Boundary Governance

Projection transforms source data into view-ready or workflow-ready read models.

Projection boundary rules:

- Projection must not perform API calls.
- Projection must not mutate backend state.
- Projection must not own user interaction flow.
- Projection must not contain permission decisions.
- Projection must not contain controller orchestration.
- Projection may derive display-ready fields from approved feature data.
- Projection may normalize backend response shape for frontend consumption.
- Projection must remain deterministic from its inputs.
- Projection must remain inside the owning Feature Cell unless approved as shared.

Projection boundary violations include:

- UI components directly rebuilding complex read models repeatedly.
- Policy checks embedded inside projection logic.
- API calls made from projection modules.
- Projection modules importing controllers.
- Projection modules mutating store or remote state.

Required review questions:

- Is this logic only transforming data for reading or display?
- Does it avoid side effects?
- Does it avoid permission decisions?
- Does it belong to the current Feature Cell?

## 7. Policy Boundary Governance

Policy defines whether an action, route, state transition, or workspace access is allowed.

Policy boundary rules:

- Policy must not perform API calls.
- Policy must not render UI.
- Policy must not mutate backend state.
- Policy must not own component state.
- Policy must not directly orchestrate user interactions.
- Policy may evaluate roles, workspace type, resortId scope, status, and business preconditions.
- Policy decisions must be explicit and testable.
- Workspace isolation decisions must be represented as policy or an approved access contract.
- Policy must remain inside the owning Feature Cell unless approved as shared.

Policy boundary violations include:

- Permission checks duplicated inside many components.
- Resort workspace access decided by menu visibility only.
- Work status transition rules embedded directly in buttons or forms.
- Policy importing UI components.
- Policy mutating store or remote state.

Required review questions:

- Is this logic deciding whether something is allowed?
- Is the decision reusable by route, component, and controller layers?
- Does it preserve workspace isolation?
- Does it avoid rendering and side effects?

## 8. Controller Boundary Governance

Controller coordinates user intent, policy checks, projections, state, and API/service calls for a Feature Cell.

Controller boundary rules:

- Controller may orchestrate API calls through approved feature services or API clients.
- Controller may read or update feature-owned state through approved state interfaces.
- Controller may call policy modules before executing restricted actions.
- Controller may call projection modules to prepare view or workflow data.
- Controller must not render UI.
- Controller must not contain presentational formatting that belongs in UI or projection.
- Controller must not bypass workspace isolation policy.
- Controller must not import another feature's internal controller, policy, projection, store, or API directly.
- Controller must expose a stable feature-facing interface when used by components.

Controller boundary violations include:

- UI components calling API clients directly instead of using the approved controller or feature facade.
- UI components importing stores directly when controller mediation is required.
- Controller importing another feature's internal files.
- Controller duplicating policy decisions instead of using policy modules.
- Controller embedding display projection logic instead of using projection modules.

Required review questions:

- Is this code coordinating a user action or workflow?
- Does it call policy before restricted actions?
- Does it preserve workspace boundaries?
- Does it avoid rendering concerns?
- Does it keep API/store access behind the approved feature boundary?

## 9. Feature Cell Compliance Checklist

Every Feature Cell must confirm:

- Ownership is explicit.
- Folder placement matches ownership.
- Naming follows project conventions.
- Imports respect dependency direction.
- No other feature imports internal files directly.
- No cross-feature internal import exists.
- Shared dependencies are approved and domain-neutral.
- Business logic remains outside presentational UI where required.
- API access is not placed directly inside UI components.
- Store access is not placed directly inside UI components when the controller/facade boundary is required.
- Projection boundary is respected.
- Policy boundary is respected.
- Controller boundary is respected.
- State is separated from view responsibilities.
- Workspace isolation rules are preserved.
- Adaptive UI rules are preserved.
- No unapproved architecture exception exists.

## 10. Governance Review Gate

A feature is architecture-compliant only when:

- Naming review passes.
- Import review passes.
- Ownership review passes.
- Shared usage review passes.
- Architecture drift review passes.
- Projection boundary review passes.
- Policy boundary review passes.
- Controller boundary review passes.

Review outcomes:

```text
FE_BASELINE_COMPLIANT
FE_BASELINE_COMPLIANT_WITH_ACCEPTED_EXCEPTION
FE_BASELINE_BLOCKED
```

`FE_BASELINE_BLOCKED` must be used when a change violates a critical boundary or silently alters the architecture.

## 11. Governance Review Decision

A Governance Review must end with one of two decisions:

```text
APPROVE
REQUEST_CHANGE
```

Use `APPROVE` only when all required governance checks pass or when all exceptions are explicitly accepted.

Use `REQUEST_CHANGE` when any of the following are found:

- Architecture drift.
- Cross-feature internal import.
- Business logic in UI.
- API inside component.
- Store inside component where controller/facade boundary is required.
- Projection boundary violation.
- Policy boundary violation.
- Controller boundary violation.
- Shared misuse.
- Unapproved architecture exception.

## 12. Exception Process

An exception may be accepted only when:

- The reason is explicit.
- The affected baseline rule is identified.
- The architectural consequence is understood.
- The exception owner is identified.
- A correction or review condition is defined when temporary.
- A major architecture change is recorded through the project ADR process.

Convenience alone is not sufficient justification for an exception.

## 13. Definition of Done

FE-09 Governance is satisfied when:

- Every Feature Cell follows the Frontend Architecture Baseline.
- Naming is consistent and ownership-aware.
- Imports preserve feature boundaries.
- Feature ownership is explicit.
- Shared misuse is prevented or corrected.
- Architecture drift is detected before acceptance.
- Projection boundary is respected.
- Policy boundary is respected.
- Controller boundary is respected.
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
