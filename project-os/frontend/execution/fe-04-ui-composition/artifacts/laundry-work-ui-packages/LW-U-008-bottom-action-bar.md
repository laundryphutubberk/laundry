# LW-U-008 BottomActionBar

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work bottom action bar from policy-derived action model and controller handlers.

## Target File

`frontend/src/features/laundry-works/components/BottomActionBar.tsx`

## Runtime Contract Mapping

Uses controller and policy output:

```text
UseLaundryWorkControllerResult.actions
- receiveBags(workId, input)
- markFactoryReceived(workId)
- openBag(workId, bagId)
- recordCountLines(workId, input)
- markTypeSorted(workId)
- markColorSorted(workId)
- recordWorkData(workId)
- returnWork(workId)
- closeWork(workId)
- cancelWork(workId, reason)
- refresh()

LaundryWorkPolicyResult
- allowed
- reasonCode optional
- message optional

LaundryWorkViewModel.actions
- primaryAction
- secondaryActions[]
- disabledReasonsByAction
```

Projection/controller must create UI-ready action descriptors before passing them to this component.

## Inputs

```text
actions
  - back
  - saveDraft
  - continue
  - secondary[]
  - destructive optional
legacy-compatible action props optional
state
  - isBusy
  - isSavingDraft
  - isContinuing
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
- Action eligibility comes from policy/controller only.
- FE-05 can pass action descriptors without changing component boundary.
