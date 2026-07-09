# LW-U-005 IssuePanel

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `project-os/frontend/execution/fe-03-runtime-contract/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work issue panel component from `IssuePanelProjection` and policy/controller action descriptors.

## Target File

`frontend/src/features/laundry-works/components/IssuePanel.tsx`

## Runtime Contract Mapping

Uses `issuePanel` from `LaundryWorkDetailProjection`:

```ts
type IssuePanelProjection = {
  issues: Array<{
    id: string | number
    title: string
    description?: string
    quantity?: number
    statusLabel: string
    reportedAtLabel?: string
  }>
  canCreateIssue: boolean
  emptyText: string
}
```

Issue action requests map to controller/policy only. The component does not decide whether `REPORT_ISSUE` is allowed.

## Inputs

```text
issuePanel
  - issues[]
  - canCreateIssue
  - emptyText
actions optional
  - createIssue handler/descriptor from controller
loading optional
error optional
```

## Outputs

- Presentational issue panel.
- Explicit issue list.
- Empty/loading/error-safe states.
- Optional action entry point when provided by policy/controller output.

## Rules

- No issue workflow logic.
- No direct issue API calls.
- No issue status mutation.
- No hidden issue state inside component.
- No policy checks inside JSX.
- Action visibility comes from policy/controller output only.

## Acceptance Criteria

- Issues are explicit and visible.
- Empty issue state is clear.
- Loading/error states render safely.
- Action entry point appears only when provided by policy/controller props.
- Component does not own issue domain logic.
- FE-05 can pass `IssuePanelProjection` without changing component boundary.
