# Focus Management Contract

Status: Active
Owner: Frontend Architect

## Purpose

Define predictable focus behavior for screens, dialogs, sheets, popovers, forms, and route transitions.

## Required Fields Per Interactive Surface

```text
surface name
initial focus target
focus trap behavior
escape behavior
close behavior
focus return target
validation-error focus target
route-change focus target
loading-state behavior
disabled-state behavior
```

## Core Rules

- Opening a modal surface must move focus to a meaningful element.
- Modal focus must remain inside the active surface until it closes.
- Closing must restore focus to the element that opened it, when that element still exists.
- Validation failure must move or announce focus to the first actionable error according to the screen contract.
- Route transitions must place focus on the new screen heading or approved landmark.
- Focus must never be lost to the document body without an explicit reason.
- Hidden, disabled, or unmounted elements cannot be focus targets.
- Loading overlays must not create focus traps that cannot be escaped.

## Contract Template

```text
Surface:
Trigger:
Initial focus:
Trap focus: YES / NO
Escape closes: YES / NO
Focus return:
Validation error target:
Route change target:
Screen-reader announcement:
Exceptions:
```

## Verification

- Keyboard-only navigation completed.
- Focus order matches visual and workflow order.
- Escape behavior verified.
- Focus restoration verified.
- Validation-error focus verified.
- Screen-reader announcement verified where applicable.

## Stop Condition

Pause if correct focus behavior requires changing business workflow, route structure, or shared component contract outside the approved task.
