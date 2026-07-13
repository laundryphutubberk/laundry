# Project OS Executor Independence

Status: ACTIVE
Owner: Project Owner / Chief Architect
Scope: Long-term Project OS architecture and collaboration model

## Architecture Decision

Project OS is executor-independent.

Project OS is the primary long-term asset. It preserves durable organizational and engineering knowledge independently of any implementation tool, AI, IDE, environment, or individual executor.

Execution tools and execution roles are secondary, replaceable assets.

## Durable Ownership

Project OS owns:

- Business knowledge.
- Operational Capability definitions.
- Blueprint.
- Architecture.
- Verification standards.
- Traceability.
- Execution contracts.

No executor owns or replaces this durable project truth.

## Replaceable Execution Layer

The Execution Layer may include:

- Human developers.
- Architect.
- Backend specialists.
- Frontend specialists.
- Verification specialists.
- Codex.
- Canvas.
- Future AI agents.
- IDE integrations.
- Other approved executors.

An executor may be assigned, replaced, paused, or removed without redesigning Project OS knowledge.

## Operating Model

```text
Business Vision
    -> Business Capability
    -> Blueprint
    -> Project OS
    -> Execution Layer
         - Human
         - Architect
         - Backend Specialists
         - Frontend Specialists
         - Verification Specialists
         - Codex
         - Canvas
         - Future Executors
```

The Execution Layer is replaceable.

Project OS is not.

## Execution Without Tool Dependency

The project must continue planning, verification, architecture, review, integration planning, and execution planning when any implementation tool becomes unavailable.

Tool unavailability may reduce execution throughput. It must not invalidate project knowledge or block overall project continuity.

Interrupted or partial implementation must remain recoverable through Project OS capability definitions, contracts, evidence, traceability, exact Git state, and handoff records.

## Architecture Rules

Project OS must not contain architecture coupled to:

- Codex.
- Canvas.
- VS Code.
- Any specific AI.
- Any specific IDE.
- Any single implementation environment.

Project OS defines these replaceable execution concepts instead:

- Owner.
- Executor.
- Execution Contract.
- Verification Contract.

The `Executor` assignment is replaceable. Capability, Blueprint, architecture, verification, traceability, and operating principles remain stable unless the underlying business or architecture truth changes.

## Execution Contract Evolution

### Canonical Interface

The Execution Contract is the canonical interface between Project OS and every executor.

A Command Pack is an Execution Contract. It is owned by Project OS, not by Codex or any other executor.

The canonical execution model is:

```text
Business Capability
    -> Blueprint
    -> Execution Contract
    -> Executor Assignment
    -> Verification
    -> Capability Completion
```

The Execution Contract remains stable when the executor changes. Only the Executor Assignment and executor-specific operating details may change.

### Required Execution Fields

Every execution activity should define:

- Owner.
- Executor.
- Execution Contract.
- Verification Contract.
- Completion Gate.

Executor selection is an operational decision. It is never an architectural dependency.

### Preferred Terminology

Preferred terminology for future documents is:

- Execution Command Pack.
- Execution Flow.
- Execution Resume.
- Execution Queue.
- Execution Assignment.
- Execution Completion.

Legacy terminology containing `Codex` remains supported for backward compatibility. No mandatory documentation migration is required. Terminology should evolve naturally when existing documents are revised for substantive reasons.

### Compatibility Rule

Existing references such as `Codex Command Pack`, `Codex Big Flow`, or similar tool-specific labels remain valid historical and operational aliases when their meaning is clear.

New architecture and kernel documents should prefer executor-independent terminology unless a rule applies specifically to Codex as the selected executor.

Changing terminology must not alter Capability meaning, Blueprint truth, verification requirements, traceability, completion gates, or architecture.

### Engineering Objective

Keep Project OS independent of present and future implementation technology.

Replacing Codex, Claude Code, Gemini CLI, Cursor Agents, Human developers, specialists, or future AI systems must require changing only execution assignment—not business architecture or durable Project OS knowledge.

## Execution Capability Awareness

### Principle

Before assigning an Execution Contract, Project OS must identify the operational capabilities required by the mission and compare them with the capabilities currently available to the proposed executor.

Executor selection must be based on capability compatibility, not only on executor name, AI brand, task label, team role, historical habit, or preferred tool.

An executor may be appropriate for one mission and incapable of another.

### Required Execution Contract Fields

Each execution activity should define:

- Owner.
- Executor.
- Required Execution Capabilities.
- Available Executor Capabilities.
- Execution Contract.
- Verification Contract.
- Completion Gate.
- Fallback Executor or Recovery Path when useful.

### Capability Categories

Execution capabilities may include:

- Knowledge and planning: business analysis, architecture, Blueprint interpretation, decomposition, Command Pack creation, review, and documentation.
- Repository access: remote read/write, branch creation, commit creation, and pull-request operations.
- Local workspace: filesystem access, uncommitted working-tree access, local Git status/diff, branch switching, local commits, and stash access.
- Engineering runtime: package installation, build tools, database and migration access, browser runtime, automated tests, local servers, and service credentials.
- Human authority: business approval, Human Operational Test, remote Git authorization, release approval, secret management, and product acceptance.

### Assignment Rule

An Execution Contract may be assigned only when:

```text
Available Executor Capabilities
satisfy
Required Execution Capabilities
```

When they do not match:

- Do not improvise or fabricate evidence.
- Do not restart verified work unnecessarily.
- Do not transfer uncommitted local work through unsupported channels.
- Select another executor, wait for the required environment, or re-scope execution without changing architectural intent.

A mismatch is an `EXECUTION_ASSIGNMENT_BLOCKER`. It is not automatically a Product blocker, Architecture blocker, Capability failure, or reason to restart implementation.

### Resume Rule

When verified work exists in an inaccessible local working tree:

- Preserve that working tree.
- Avoid reset, clean, stash mutation, branch switching, or recreation.
- Resume with an executor that can access the exact workspace.
- Prefer Resume over Restart.

Project OS must preserve the verified mission state and choose a compatible continuation path.

### Capability Profile Model

Project OS may maintain lightweight capability profiles for executor classes. Profiles describe current operational access, not permanent identity.

Example:

```text
Executor: Assistant Architect with GitHub Connector
Available: architecture, planning, review, remote repository inspection, remote documentation changes
Unavailable: Human local working tree, uncommitted local files, local npm execution, local browser testing, local commit from an unavailable checkout
```

```text
Executor: Local Engineering Agent
Available: local filesystem, local Git, package manager, database, tests, build, local commit
Unavailable: Human business approval, Human Reality Gate, unauthorized remote Git operations
```

### Relationship to Existing Principles

Execution Capability Awareness extends Executor Independence:

- Executor Independence asks: Can the executor be replaced?
- Execution Capability Awareness asks: Which executor can perform this exact mission safely right now?

It preserves Operational Capability First, Human Reality Gate, Git Responsibility Standard, Resume over Restart, Codex breadth and Task depth, and the Architect Boundary Rule.

### Engineering Objective

Prevent avoidable execution stalls, local-only work assigned to remote-only executors, fabricated evidence, unnecessary restarts, and wasted context or token consumption.

## Executor Replacement Rule

Changing an executor must require changing only execution assignment and executor-specific operating details.

Executor replacement must not require redesigning:

- Operational Capability.
- Blueprint.
- Verification model.
- Traceability.
- Architecture.
- Project operating model.

If executor replacement requires architectural redesign, executor-specific concerns have leaked into Project OS and must be separated.

## Continuity Rule

Codex limits, environment limits, security restrictions, tool outages, and partial execution interruptions are execution-layer events.

They are not Project OS architecture events.

Project continuity is preserved by durable capability truth, execution contracts, verification contracts, evidence, and synchronized Git state.

## Relationship to Existing Doctrine

This principle preserves and strengthens:

- Operational Capability First.
- Capability Lock Doctrine.
- Human Operational Test as the Reality Gate.
- Git Responsibility Standard.
- Codex owns breadth.
- Project OS Tasks own depth.
- The Architect decides the execution boundary.

These doctrines describe how work is framed, executed, verified, locked, and evolved. Executor Independence ensures that none of them depends on one particular implementation tool.

## Engineering Objective

Preserve organizational knowledge independently of implementation technology.

Future executor replacement must require changing execution assignments, never reconstructing architectural knowledge.

> Project OS preserves durable truth. Execution Contracts define stable work. Capability-aware assignments select executors that can safely perform the required mission.