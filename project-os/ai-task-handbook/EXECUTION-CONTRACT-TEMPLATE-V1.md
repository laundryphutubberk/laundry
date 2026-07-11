# Execution Contract Template (ECT) V1

Status: ACTIVE
Owner: Project Owner / Chief Architect
Authority: Project-wide execution standard

## Purpose

This template converts an approved and locked Blueprint into an executable mission that any compatible executor can perform without redesigning business meaning.

An Execution Contract is owned by Project OS. It is not owned by Codex, any AI, any IDE, or any individual executor.

## Governing Flow

```text
Business Capability
  -> Locked Blueprint
  -> Execution Contract
  -> Executor Assignment
  -> Verification Contract
  -> Completion Gate
  -> Handoff
```

The Blueprint contains business and architecture truth. The Execution Contract contains current execution instructions. Executors implement; they do not redefine the Blueprint.

## Required Metadata

Every contract should identify:

- Mission Name
- Mission Type
- Capability
- Priority
- Blueprint Version
- Blueprint Commit or authoritative reference
- Execution Contract Version
- Owner
- Assigned Executor
- Required Execution Capabilities
- Current Status
- Target Status

## 1. Mission

State the outcome in one clear sentence.

Include:

- Mission name
- Mission type, such as Open Flow, Resume, Completion Pass, Verification, Recovery, or Integration
- Capability
- Expected result

## 2. Background

Summarize only the context needed to execute safely.

Do not retell the full project history. Prefer a short explanation of why the mission exists and what prior verified work must be preserved.

## 3. Current Verified State

Record facts only.

Examples:

- Blueprint: LOCKED
- Product implementation: PASS
- Focused verification: PASS
- Regression: PASS
- Human test: NOT_EXECUTED

Do not mix assumptions, opinions, or unverified progress into this section.

## 4. Runtime State

Populate immediately before assignment because these values may change quickly.

Include where relevant:

- Current branch
- Exact base SHA
- Current HEAD
- Working-tree state
- Existing local commit
- Current blocker
- Active executor
- Protected stash or local artifacts

## 5. Required Execution Capabilities

List the capabilities needed to perform the mission safely.

Examples:

- Local filesystem
- Uncommitted working-tree access
- Local Git status and diff
- Local commit creation
- Remote repository read or write
- Package manager
- Database and migration access
- Browser runtime
- External service credentials
- Human business approval
- Human operational testing

Assignment is valid only when the executor's available capabilities satisfy the required capabilities.

A mismatch is an Execution Assignment blocker, not automatically a Product or Architecture blocker.

## 6. Scope

### DO

List only the work required to reach the target state.

Prefer targeted patches, reuse of verified work, and explicit boundaries.

### DO NOT

State the forbidden actions clearly.

Typical examples:

- Do not redesign the Blueprint.
- Do not change business rules, lifecycle, ownership, or approved API contracts.
- Do not restart verified work when Resume is possible.
- Do not touch unrelated product code.
- Do not perform remote Git operations without Human ownership or explicit exceptional authorization.

## 7. Verification Contract

Define the exact gates that prove completion.

Possible gates include:

- Focused domain or policy verification
- HTTP or database integration
- Concurrency and rollback evidence
- Prisma or schema validation
- Frontend lint and build
- Project OS verification
- Human Reality Gate

Each gate must report one of:

- PASS
- FAIL
- NOT_EXECUTED
- MISSING_CAPABILITY

Do not claim completion from narration, wake events, or unverified intent.

## 8. Completion Gate

Define the exact conditions that close the mission.

Examples:

- Required verification passes.
- Expected local commit exists.
- Working tree is clean.
- Status reaches READY_FOR_TEST, READY_FOR_PASS_B, HUMAN_VERIFIED, or another approved target.
- No prohibited remote Git action occurred.

A mission is not complete merely because implementation code exists.

## 9. Report Format

Use a compact evidence-first report:

```text
Result
Branch and base SHA
Files changed by responsibility
Behavior or contract completed
Verification results
Human-test state
Commit SHA
Working-tree state
Remaining blocker
Push: NOT PERFORMED / performed by Human
```

Do not print full files or large diffs unless specifically requested.

## 10. Handoff

Identify the continuation path.

Include where relevant:

- Current executor
- Next executor
- Expected handoff input
- Expected handoff output
- Next completion gate

Example:

```text
Local Engineering Agent
  -> Human Operational Tester
  -> Chief Architect Review
  -> Integration Operator
```

## Resume Contract

For interrupted verified work:

- Preserve the exact branch and working tree.
- Re-read current runtime state before acting.
- Continue from recorded evidence.
- Do not reproduce already verified failures unnecessarily.
- Prefer Resume over Restart and Patch over Rewrite.
- Use a compatible executor with access to the exact workspace.

## Blueprint Boundary

An Execution Contract may not silently change:

- Business goal
- Domain ownership
- Lifecycle
- Integrity boundaries
- Authorization policy
- Approved API contract
- Human acceptance meaning

Any such change requires Blueprint Revision and explicit approval before implementation continues.

## Template Skeleton

```text
MISSION
- Name:
- Type:
- Capability:
- Priority:
- Expected Result:

AUTHORITATIVE BLUEPRINT
- Version:
- Commit / Reference:
- Status: LOCKED

BACKGROUND
- Minimal execution context:

CURRENT VERIFIED STATE
- Product:
- Verification:
- Human test:

RUNTIME STATE
- Branch:
- Base SHA:
- HEAD:
- Working tree:
- Current blocker:

OWNER AND EXECUTOR
- Owner:
- Executor:
- Required capabilities:
- Available capabilities confirmed:

DO
1.
2.

DO NOT
- 

VERIFICATION CONTRACT
- 

COMPLETION GATE
- 

HANDOFF
- Next executor:
- Expected input:
- Expected output:

REPORT ONLY
- Result
- Branch / SHA
- Verification
- Commit
- Working tree
- Remaining blocker
- Push status
```

## Engineering Objective

Reduce rediscovery, context load, token waste, scope drift, and executor dependency while preserving Business Capability, Blueprint truth, verified evidence, and safe handoff across Human, specialist, local-agent, remote-agent, and future execution channels.
