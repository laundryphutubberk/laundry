# Laundry Work — TASK

Status: BASELINE_LOCKED

## Task

Maintain Laundry Work as the stable operational host for downstream feature flows.

## Rules

- Preserve controller, projection, policy, store, and API boundaries.
- Preserve workspace isolation.
- Use minimal patches.
- Do not absorb specialized flows into the host unless they are required for orchestration.
- Reopen this task only for verified bugs, regression, or host-contract changes.

## Done

Laundry Work baseline remains buildable, runtime-safe, refresh-safe, and ready to host specialized Feature Tasks.
