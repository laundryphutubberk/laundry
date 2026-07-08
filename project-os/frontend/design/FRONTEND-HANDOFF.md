# FRONTEND-HANDOFF.md

Status: Active
Owner: Frontend Architect

## Purpose

Handoff package from Frontend Design to Frontend Execution.

FE-01 should read this before implementation.

## Required Inputs

| Item | File | Status |
|---|---|---|
| UI Guide | `project-os/05-ui-guide/UI-ADAPTIVE-GUIDE.md` | Required |
| FE Execution README | `project-os/frontend/execution/README.md` | Required |
| Structure Blueprint | `project-os/frontend/design/FRONTEND-STRUCTURE-BLUEPRINT.md` | Ready |
| Screen Classification | `project-os/frontend/design/SCREEN-CLASSIFICATION.md` | Ready |
| Component Classification | `project-os/frontend/design/COMPONENT-CLASSIFICATION.md` | Ready |
| API Consumption Map | `project-os/frontend/design/API-CONSUMPTION-MAP.md` | Ready |
| Capability Matrix | `project-os/frontend/design/FRONTEND-CAPABILITY-MATRIX.md` | Ready |
| UI Flow Map | `project-os/frontend/design/UI-FLOW-MAP.md` | Ready |

## FE Execution Start Condition

FE-01 may start when:

```text
Frontend structure is defined
Screens are classified
API usage is mapped
Capability matrix exists
UI flow is mapped
Stop conditions are known
```

## Stop Conditions

Pause and ask Chief Architect if frontend work requires:

```text
Business workflow change
API contract change
Workspace boundary change
New backend endpoint
Schema/domain change
Separate mobile/desktop business implementation
```

## Next Step

Recommended next step:

```text
Open FE-01 Foundation
Mode: IMPLEMENTATION GATE
```

## Maintenance Rule

Update this file when frontend design or FE execution start criteria change.
