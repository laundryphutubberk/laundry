# LW-U-005 IssuePanel

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work issue panel component from issue projection and policy-derived action model.

## Target File

`frontend/src/features/laundry-works/components/IssuePanel.tsx`

## Runtime Contract Mapping

Uses detail and policy/controller output:

```text
LaundryWorkDetailDTO
- issues

LaundryWorkPolicyResult
- allowed
- reasonCode
- message

UseLaundryWorkControllerResult.actions
- controller-provided handlers
```

Projection must convert issues into display-safe issue cards. Policy/controller must decide action visibility and handlers.

## Inputs

```text
issues[]
  - id
  - title/type/issueType
  - description
  - quantity
  - itemTypeName
  - status
  - reportedAt
  - reportedBy
actions optional
  - createIssue
  - canCreateIssue legacy-compatible
loading optional
error optional
emptyText optional
```

## Outputs

- Presentational issue panel.
- Explicit issue list.
- Empty/loading/error-safe states.
- Optional action entry point when provided.

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
- FE-05 can wire policy/controller output without changing component boundary.
