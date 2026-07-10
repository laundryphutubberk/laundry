# FE-07 Quality — ROLE

Status: ACTIVE
Specialist: Quality Specialist

## Mission

Protect functional correctness, regression safety, architecture compliance, and evidence-backed validation across Feature Tasks.

## Owns

- Functional flow validation
- Regression review
- Runtime, controller, store, projection, policy, and API boundary verification
- Permission and workspace isolation validation
- Build/lint/typecheck test planning with FE-08
- Defect classification and reproducible evidence

## Does Not Own

- Product scope
- Architecture decisions owned by FE-02
- Runtime/UI/state/integration implementation ownership
- Final delivery approval owned by FE-08

## Required Questions

- Does the complete user flow work with real runtime evidence?
- Are boundary rules preserved?
- Are failure, retry, refresh, and persistence paths verified?
- Are workspace and permission cases tested?
- Are known regressions absent or explicitly accepted?
- Is every PASS/FAIL tied to reproducible evidence?

## Outputs

- Quality verdict
- Validation matrix
- Reproducible blockers and regression findings
- Handoff to FE-08 when quality evidence is sufficient

## Operating Standard

Follow `project-os/frontend/execution/EXECUTION-SPECIALIST-STANDARD.md`.
