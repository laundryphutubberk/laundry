# Codex + Project OS Collaboration Model

Status: ACTIVE
Owner: Project Owner / Chief Architect
Authority: Project-wide collaboration standard

## Purpose

This model defines how Project OS V2, the Chief Architect, Codex, specialist Tasks, and Human operational testing work together.

Project OS V2 is not replaced by Codex. It remains authoritative for blueprint, architecture, approved rules, governance, audit, evidence, and elevation.

Codex becomes the primary implementation engine after design truth is approved.

## Governing Principle

> Project OS defines durable truth. The Architect translates truth into executable command packs. Codex implements breadth. Specialist Tasks complete depth. Human testing supplies operational evidence. Project OS audits and elevates the result.

## Roles

### Human

- Owns product direction, priority, and real operational knowledge.
- Approves stop-condition decisions.
- Executes real browser/operational tests.
- Supplies screenshots, logs, and observed outcomes.

### Chief Architect / Codex Orchestrator

- Distills approved blueprints into concise commands.
- Plans dependencies and parallel execution lanes.
- Selects owners by flow responsibility, not by FE/BE folder.
- Minimizes repeated Codex context and token consumption.
- Analyzes operational evidence before opening completion work.
- Coordinates Local Codex state with Git-based Task state.

### Codex

Codex owns broad, continuous implementation:

- End-to-end business flows.
- Cross-module Backend and Frontend changes.
- Transactions, APIs, runtime wiring, UI integration, verification scripts, and initial evidence.
- Repeated build/test/fix cycles inside one approved flow.

Codex should continue forward into large flows rather than being repeatedly recalled for narrow, evidence-backed gaps that a specialist Task can complete safely.

### Specialist Tasks

Tasks are implementation-capable completion agents.

They own narrow depth such as:

- policy and domain-rule correction;
- state and mutation lifecycle completion;
- UI behavior and accessibility;
- validation and error handling;
- focused regression and verification;
- small cross-layer fixes belonging to one flow responsibility.

A Task may change both Backend and Frontend when required to close the same flow gap.

## Validated Lifecycle

```text
Approved Blueprint / Architecture
  -> Architect Command Pack
  -> Codex Big Flow
  -> Automated, HTTP, DB, Build Verification
  -> Human Operational Browser Test
  -> Architect Evidence Analysis
  -> Specialist Task Completion
  -> Targeted Human Re-test
  -> Project OS Audit / Elevation
  -> Acceptance / Release
```

## Human Operational Test Gate

A Codex result at `READY_FOR_TEST` must be exercised by a Human before detailed completion routing and final audit.

Human testing discovers operational gaps not proven by automated checks, including:

- incorrect workflow guidance;
- missing save/action wiring;
- misleading or unconstrained inputs;
- loading, error, focus, and keyboard defects;
- policy mismatches between read and mutation behavior;
- stale projection after refresh;
- terminal-state usability defects.

Human-test evidence should be collected step by step. Do not replace it with a speculative long review plan.

## Evidence-Driven Routing

The Architect uses observed evidence to classify and route findings.

Evidence may include:

- Browser screenshots.
- Runtime/business logs.
- HTTP request and response behavior.
- Database evidence.
- User observation.

Findings are routed by responsibility. Examples:

- Policy/domain rule -> policy Task, even if FE and BE both need edits.
- Mutation lifecycle -> state/runtime Task.
- Visual interaction -> UI composition Task.
- Transaction/idempotency -> transaction consistency Task.

## Command Efficiency Standard

Commands should optimize for maximum implemented work with minimum context:

- Resume current state instead of restarting.
- Read only source-of-truth and directly relevant files.
- Use targeted patches rather than rewrites.
- Batch one continuous flow into one Codex command.
- Avoid progress narration.
- Return evidence, not long explanations.
- Stop only for a real Human decision or destructive/irreversible boundary.

## Parallel Execution Standard

Codex commonly edits Local working trees while Tasks edit Git.

The shared-state hierarchy is:

```text
Uncommitted Local State = private Codex execution state
Checkpoint Commit = shared development truth
Task Branch = specialist completion proposal
Integration Branch = combined verified truth
main = accepted milestone truth
```

Rules:

1. Do not hand off uncommitted Local implementation to a Git Task.
2. Create a checkpoint commit before parallel Task work.
3. Every Task must start from an exact base commit SHA on a dedicated branch.
4. Do not write directly to `main` without explicit authorization.
5. One file should have one active owner at a time.
6. Do not pull, reset, rebase, merge, or cherry-pick during uncertain ownership.
7. Reconcile branches through an Architect integration plan.

## Project OS V2 Operating Position

### Before Implementation

Project OS V2 is primary for discovery, blueprint, domain design, architecture, standards, and approved decisions.

### During Codex Implementation

Use minimal active execution state. Do not require broad documentation updates at every implementation step when they do not protect a decision or recovery point.

### After Codex Implementation

Use Project OS V2 for:

- operational findings;
- specialist completion;
- audit and traceability;
- architecture drift detection;
- regression evidence;
- production elevation;
- release readiness.

## Completion and Acceptance

`READY_FOR_TEST` means broad implementation and automated evidence are ready for Human operational verification.

It does not mean accepted or complete.

Acceptance requires:

- Human flow verification;
- resolution of material findings;
- targeted re-test;
- audit/elevation evidence;
- compliance with Git and external-action authorization boundaries.

## Durable Formula

> Codex owns breadth. Tasks own depth. Human operation reveals reality. The Architect decides the boundary. Project OS preserves, audits, and elevates the truth.
