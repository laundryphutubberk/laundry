# LW-U-008 BottomActionBar

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `project-os/frontend/execution/fe-03-runtime-contract/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work bottom action bar from `ActionBarProjection` and controller handlers.

## Target File

`frontend/src/features/laundry-works/components/BottomActionBar.tsx`

## Runtime Contract Mapping

Uses `actionBar` from `LaundryWorkDetailProjection`:

```ts
type ActionBarProjection = {
  primaryAction?: RuntimeActionProjection
  secondaryActions: RuntimeActionProjection[]
  backAction: RuntimeActionProjection
  destructiveAction?: RuntimeActionProjection
}

type RuntimeActionProjection = {
  key: string
  label: string
  disabled: boolean
  loading?: boolean
  reasonCode?: PolicyDenyReason
  message?: string
  command?: LaundryWorkCommandType
}
```

Controller supplies handlers for projected actions. Policy decides eligibility before action descriptors reach UI.

## Inputs

```text
actionBar
  - primaryAction
  - secondaryActions[]
  - backAction
  - destructiveAction
handlers from controller by action key
loading optional
error optional
```

## Outputs

- Presentational bottom action bar.
- Primary/secondary/navigation/destructive action placement.
- Disabled/loading/error-safe display.

## Rules

- No CTA eligibility logic in component.
- No direct status mutation.
- No API calls.
- No store access.
- No navigation decision beyond calling provided handlers.
- All mutation actions must already have passed controller/policy boundaries.
- Component must not know backend command names as business rules.

## Acceptance Criteria

- Primary action is visually clear.
- Disabled/loading states are safe.
- Mobile action bar remains reachable.
- Error message can display without blocking layout.
- Action eligibility comes from `ActionBarProjection` / controller only.
- FE-05 can pass action descriptors without changing component boundary.
