# Codex + Project OS Collaborative Development Model

Status: ACTIVE
Owner: Project Owner / Chief Architect
Scope: All future project development

## Purpose

This document defines the standard collaboration model between Human, Architect, Codex, and Project OS Tasks.

Project OS remains the long-term source of truth for blueprint, architecture, standards, governance, audit, evidence, and elevation.

Codex is the primary implementation engine after the blueprint and engineering principles are approved.

## Core Principle

> Project OS defines the truth. The Architect translates the truth into executable work. Codex executes broad implementation. Project OS Tasks complete depth, audit evidence, and elevate the result.

## Responsibility Model

### Human

- Owns product direction and real operational truth.
- Approves business decisions and consequential changes.
- Performs real browser and operational testing.
- Supplies observed evidence, including screenshots, logs, and actual outcomes.

### Chief Architect / Codex Orchestrator

- Converts approved blueprints into concise executable command packs.
- Selects flow boundaries, dependencies, and work owners.
- Maximizes implementation throughput while minimizing Codex context and token usage.
- Analyzes human-test evidence before assigning completion work.
- Routes gaps to the correct Task based on flow responsibility, not folder location.
- Coordinates Local Codex work and Git-based Task work.

### Codex

Codex owns breadth:

- End-to-end business-flow implementation.
- Cross-module Backend and Frontend work.
- Runtime, transaction, API, UI wiring, verification scripts, and initial evidence.
- Build/test/fix loops inside the approved flow.

Codex must not reinterpret approved business decisions or repeatedly revisit a completed broad flow for small gaps when a specialist Task can finish them more efficiently.

### Project OS Tasks

Tasks own depth:

- Complete narrow gaps found during real operation.
- Patch policy, state, UI behavior, domain rules, validation, accessibility, testing, and regression gaps.
- May edit Backend and Frontend together when both changes belong to the same flow responsibility.
- Are implementation-capable completion agents, not checklist-only reviewers.

Task ownership follows business/engineering responsibility, not repository folder boundaries.

## Standard Development Lifecycle

```text
Project OS Blueprint and Principles
  -> Architect Command Pack
  -> Codex Big Flow Implementation
  -> Automated / DB / Build Verification
  -> Human Operational Browser Test
  -> Architect Evidence Analysis
  -> Project OS Task Completion
  -> Targeted Human Re-test
  -> Project OS Audit and Elevation
  -> Acceptance / Release
```

## Human Test Rule

Human operational testing occurs before detailed completion work and before final audit.

The purpose is to discover gaps that build, lint, unit, HTTP, and database tests cannot prove, including:

- incorrect or confusing workflow behavior;
- missing UI wiring;
- invalid input affordances;
- focus, keyboard, loading, and error-state defects;
- read-versus-mutation policy mistakes;
- stale or misleading projections.

A Task should be opened from observed evidence whenever possible, not from speculation.

## Evidence-Driven Completion

Acceptable evidence includes:

- Browser behavior.
- Runtime and business logs.
- API requests and responses.
- Database verification.
- Screenshots.
- User observations from real operational execution.

The Architect classifies each finding as business decision, architecture gap, functional bug, UX gap, policy gap, or deferred elevation.

## Command Philosophy

- Resume > Restart.
- Patch > Rewrite.
- Evidence > Explanation.
- Working Tree > Re-reading.
- One Flow > One Command Pack.
- Maximum Work > Maximum Conversation.

Codex commands should be concise and implementation-oriented. Tasks should receive narrow, evidence-backed completion missions.

## Cross-Layer Ownership Rule

A Task may modify both Backend and Frontend when required to complete one flow responsibility.

Example:

- A policy/domain Task may separate Backend read and mutation rules and also disable Frontend mutation controls for terminal state.

The Task must not expand into unrelated flows or redesign approved business meaning.

## Parallel Execution and Git Coordination

Codex edits Local working trees. Project OS Tasks commonly edit Git branches.

To prevent conflicts:

1. Uncommitted Local state is private Codex execution state.
2. A checkpoint commit is the shared development truth for handoff.
3. Every Task should use a dedicated branch based on an exact checkpoint commit SHA.
4. Tasks must not write directly to `main` unless explicitly authorized.
5. One file should have one active owner at a time.
6. Task completion should return a branch and commit SHA for controlled integration.
7. `main` represents accepted milestone truth, not unfinished parallel work.

No pull, reset, rebase, merge, or cherry-pick should be performed during uncertain ownership without an Architect reconciliation plan.

## Git Responsibility Standard

### Local Commit Boundary

Codex may analyze, implement, verify, and create local commits inside the approved mission boundary.

The normal Codex execution boundary ends when one of these terminal states is reached:

```text
BLOCKED
READY_FOR_TEST
LOCAL_COMMIT_CREATED
```

An Architect Command Pack must terminate at one of these states. It must not continue into remote Git operations unless the Human explicitly authorizes an exceptional recovery case.

### Human-Owned Remote Operations

The Human owns all remote repository operations and decisions, including:

- `fetch`;
- `pull`;
- `push`;
- branch synchronization;
- merge and conflict acceptance;
- release and deployment initiation;
- remote repository policy and integration decisions.

Routine remote Git operations must not consume Codex implementation tokens. Codex must not perform or narrate routine push, pull, merge, synchronization, or release work as part of a normal Command Pack.

### Architect Planning Rule

The Architect plans execution from an exact commit SHA.

Project OS Tasks must begin from a synchronized Git state and an explicitly identified base commit SHA. If the Human has not synchronized the repository, the Task remains blocked at the Git boundary rather than guessing from stale or divergent state.

### Exceptional Recovery Rule

Remote Git operations may be included only when the Human explicitly authorizes them for an exceptional recovery case and the recovery boundary is clear, evidence-backed, and reversible where possible.

Such authorization is mission-specific and does not change the default responsibility model.

### Engineering Time Principle

Engineering time and Codex tokens should be spent on architecture, implementation, verification, debugging, and evidence—not on routine remote Git mechanics that the Human can perform directly.

The collaboration model therefore optimizes for:

- Codex completing the largest safe local implementation unit;
- the Architect stopping Command Packs at the local commit boundary;
- the Human controlling remote integration and release decisions;
- Project OS recording exact commit-based handoffs.

## Project OS Operating Modes

### Before Development

Project OS is primary:

- Business blueprint.
- Domain model.
- Architecture.
- Engineering standards.
- Approved decisions.

### During Codex Development

Project OS is a minimal reference and execution truth source. Avoid documentation churn that consumes implementation context without protecting a real decision.

### After Implementation

Project OS becomes active again for:

- Human-test findings.
- Completion Tasks.
- Traceability reconstruction.
- Architecture drift review.
- Audit evidence.
- Reliability, security, accessibility, and production elevation.

## Completion Rule

A broad Codex result marked `READY_FOR_TEST` is not final acceptance.

Final acceptance requires:

- Human operational test.
- Completion of material findings.
- Targeted re-test.
- Required audit/elevation evidence.
- Explicit authorization for commit, merge, push, deploy, or release where policy requires it.

## Durable Summary

> Codex builds the broad flow. Human operation reveals reality. The Architect analyzes and routes the gaps. Project OS Tasks complete the depth. Project OS audits and elevates the stable result.