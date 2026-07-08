# Capability Gates

Status: Active
Owner: Chief Architect
Project: laundryphutubberk/laundry

## Purpose

Defines readiness gates for Project OS execution.

A phase is considered ready when its capability gates pass, not only when a checklist is completed.

## Core Gates

| Gate | Pass Condition |
|---|---|
| Runtime Gate | System boots and health/runtime check passes |
| Structure Gate | File, module, and layer structure match the active blueprint |
| Contract Gate | API, UI, or domain contracts are documented and stable |
| Capability Gate | Required domain or screen capability exists in the capability matrix |
| Policy Gate | Workspace, auth, permission, and ownership rules are covered where required |
| Transaction Gate | Multi-write workflows are safe and consistent |
| Validation Gate | Input validation is complete for exposed surfaces |
| Observability Gate | Critical flows are visible through logs, request id, or health evidence |
| Verification Gate | Static, runtime, and smoke checks pass or are marked not applicable |
| Freeze Gate | Critical gaps are closed or documented and handoff is clear |

## Gate Result Format

```text
Runtime Gate        PASS / FAIL / N/A
Structure Gate      PASS / FAIL / N/A
Contract Gate       PASS / FAIL / N/A
Capability Gate     PASS / FAIL / N/A
Verification Gate   PASS / FAIL / N/A
Freeze Gate         PASS / FAIL / N/A
```

## Rule

A phase is complete when the relevant gates pass.

## BE-06 Evidence

BE-06 validated this model:

```text
Discovery               PASS
Inventory               PASS
Blueprint Alignment     PASS
Feature-first Migration PASS
Static Verification     PASS
Runtime Verification    PASS
Smoke Verification      PASS
Freeze                  PASS
```

## Maintenance Rule

Update this document when new gates or pass conditions are introduced.
