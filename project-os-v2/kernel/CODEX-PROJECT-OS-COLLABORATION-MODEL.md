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

- Policy and domain-rule correction.
- State and mutation lifecycle completion.
- UI behavior and accessibility.
- Validation and error handling.
- Focused regression and verification.
- Small cross-layer fixes belonging to one flow responsibility.

A Task may change both Backend and Frontend when required to close the same flow gap.

## Validated Lifecycle

```text
Approved Blueprint / Architecture
  -> Domain Discovery
  -> Operational Capability Definition
  -> Architect Command Pack
  -> Codex Big Flow
  -> Automated, HTTP, DB, Build Verification
  -> Human Operational Browser Test
  -> Architect Evidence Analysis
  -> Specialist Task Completion
  -> Targeted Human Re-test
  -> Project OS Audit / Elevation
  -> Verified Baseline / Acceptance / Release
```

## Operational Capability First

### Principle

Development work must be framed as an operational business capability before it is framed as technical implementation.

Codex must not be assigned a module, CRUD set, screen, API group, or database entity as the primary mission when the actual business capability has not yet been defined.

### Capability Definition

An Operational Capability must identify:

- Actor.
- Operational goal.
- Entry condition.
- Main flow.
- Exception flow.
- Domain ownership.
- State and lifecycle.
- Policies and blocking rules.
- Data and source of truth.
- Cross-layer behavior.
- Verification evidence.
- Human operational acceptance.

### Command Rule

Prefer:

> Implement Laundry Issue Operational Capability.

over:

> Implement Laundry Issue CRUD.

A Codex Command Pack must describe the end-to-end capability across all required layers, which may include:

- Backend.
- Frontend.
- Runtime.
- Policy.
- Persistence.
- Integration.
- Automated verification.
- Database verification.
- Browser-test preparation.

### Architecture Gate

A new Codex Big Flow must not begin until the Architect can clearly explain:

1. What business capability is being created.
2. Who uses it and why.
3. What truth it owns or changes.
4. What states and transitions apply.
5. What conditions block or permit progress.
6. What evidence proves completion.
7. What decisions remain unresolved.

If these cannot be answered, the work remains in Domain Discovery or Blueprint refinement.

### Ownership Rule

Ownership follows the operational capability and business responsibility, not a strict Frontend or Backend folder boundary.

A Project OS Task may patch both Frontend and Backend when both changes are necessary to complete the same approved capability.

### Codex and Task Rule

Codex owns breadth:

- End-to-end implementation.
- Cross-module integration.
- Major runtime and transaction work.
- Initial automated verification.

Project OS Tasks own depth:

- Evidence-driven completion.
- Policy refinement.
- UX and behavior gaps.
- Focused regression protection.
- Targeted cross-layer patches.

The Architect decides the boundary.

### Human Reality Gate

Automated verification does not complete an operational capability.

The capability must pass Human Operational Test before it can be accepted, audited, elevated, or locked as a verified baseline.

### Lifecycle

```text
Blueprint
-> Domain Discovery
-> Operational Capability Definition
-> Architect Command Pack
-> Codex Big Flow
-> Automated and Database Verification
-> Human Operational Test
-> Architect Analysis
-> Project OS Task Completion
-> Human Re-test
-> Audit and Elevation
-> Verified Baseline
```

### Anti-Patterns

Do not:

- Open Codex work while domain identity is unresolved.
- Use CRUD completion as proof of business completion.
- Divide ownership solely by Frontend/Backend folders.
- Mark `READY_FOR_TEST` as `ACCEPTED`.
- Perform premature audit before Human Operational Test.
- Send a whole flow back to Codex for narrow evidence-driven gaps.

### Engineering Objective

Maximize completed business capability per Codex run.

Minimize redesign, repeated context loading, and correction cycles by completing architecture and domain reasoning before implementation begins.

## Human Operational Test Gate

A Codex result at `READY_FOR_TEST` must be exercised by a Human before detailed completion routing and final audit.

Human testing discovers operational gaps not proven by automated checks, including:

- Incorrect workflow guidance.
- Missing save/action wiring.
- Misleading or unconstrained inputs.
- Loading, error, focus, and keyboard defects.
- Policy mismatches between read and mutation behavior.
- Stale projection after refresh.
- Terminal-state usability defects.

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

## Project OS V2 Operating Position

### Before Implementation

Project OS V2 is primary for discovery, blueprint, domain design, architecture, standards, and approved decisions.

### During Codex Implementation

Use minimal active execution state. Do not require broad documentation updates at every implementation step when they do not protect a decision or recovery point.

### After Codex Implementation

Use Project OS V2 for:

- Operational findings.
- Specialist completion.
- Audit and traceability.
- Architecture drift detection.
- Regression evidence.
- Production elevation.
- Release readiness.

## Completion and Acceptance

`READY_FOR_TEST` means broad implementation and automated evidence are ready for Human operational verification.

It does not mean accepted or complete.

Acceptance requires:

- Human flow verification.
- Resolution of material findings.
- Targeted re-test.
- Audit/elevation evidence.
- Compliance with Git and external-action authorization boundaries.

## Durable Formula

> Define the operational capability first. Codex owns breadth. Tasks own depth. Human operation reveals reality. The Architect decides the boundary. Project OS preserves, audits, and elevates the truth.