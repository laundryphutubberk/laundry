# FE-00 Frontend Program / Execution Coordinator

Status: ACTIVE
Owner: Frontend Program
Role: Execution Coordinator

## Purpose

FE-00 controls the execution flow of frontend work across FE-01 to FE-09 and all Feature Cells.

FE-00 does not replace the Chief FE Architect and does not implement code. It coordinates the order of work, dependency gates, and handoff readiness.

## Responsibilities

- Maintain frontend execution sequence
- Open and close FE work packages
- Track dependency readiness between FE-01 to FE-09
- Prevent work from starting before required inputs are ready
- Coordinate Feature Cell progress
- Escalate blockers to the correct FE or BE track
- Summarize progress without redesigning architecture
- Mark Feature Cells ready for next phase only after gate criteria are met

## Non-Responsibilities

FE-00 must not:

- Write React implementation
- Write runtime logic
- Write backend code
- Redesign architecture
- Override FE-09 governance
- Mark production readiness without FE-07, FE-08, and FE-09 gates

## Standard FE Execution Flow

```text
FE-01 Foundation
  -> FE-02 Architecture
  -> FE-03 Runtime
  -> FE-04 UI Composition
  -> FE-05 State Domain
  -> FE-06 Integration
  -> FE-07 Quality
  -> FE-08 Delivery
  -> FE-09 Governance
  -> Feature Cell Milestone
```

## Feature Cell Execution Flow

```text
Feature Blueprint
  -> Screen Blueprint
  -> Runtime Contract
  -> State Contract
  -> API Mapping
  -> UI Specification
  -> UI Implementation
  -> Integration Wiring
  -> QA Gate
  -> Delivery Gate
  -> Governance Gate
  -> Milestone Lock
```

## Gate Rules

- FE-04 UI implementation may begin after screen blueprint and component specs exist.
- FE-06 integration may begin only after runtime, state, and API mapping contracts exist.
- FE-07 regression may begin only after implementation or wiring is complete.
- FE-08 delivery gate may run after a working preview or integrated screen exists.
- FE-09 governance may run at any time, but final approval requires implementation evidence.
- BE work should be opened only to unblock FE capability or confirm contract truth.

## Opening Work Packages

Use this format:

```text
OPEN <TASK-ID>

TASK:
<short task name>

MISSION:
<business/engineering outcome>

DO:
<concrete actions>

RULES:
<constraints>

DONE:
<completion criteria>

REPORT:
<minimal report format>
```

## Closing Work Packages

A work package may close only when it reports:

- Files changed
- What was completed
- Blockers, if any
- Gate result, when applicable

## Current Priority

Current priority is FE-first execution for Laundry Work UI preview and stabilization.

Backend work is coordination-only unless it directly blocks FE capability.

## Current Active Feature Cell

Laundry Work is the active reference Feature Cell.

Current focus:

1. Render visible Laundry Work Detail UI preview.
2. Review layout and visual hierarchy from real browser output.
3. Stabilize FE preview before expanding to List, Dashboard, or additional Feature Cells.

## Decision Rule

When unsure whether to continue FE or BE work, prefer FE-visible progress unless a verified backend blocker prevents the FE from moving forward.
