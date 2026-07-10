# Auditor Role Contract

Status: Active
Owner: Chief Architect
Project: laundryphutubberk/laundry

## Purpose

Define an independent review role that verifies evidence, contracts, governance, regression, and freeze readiness without implementing feature code.

## Role Separation

```text
Architect
  -> defines direction and approves gates

Developer
  -> implements inside approved scope

Reviewer / QA
  -> checks technical correctness

Auditor
  -> verifies evidence, state, governance, and final claims
```

## Auditor Responsibilities

- Read BOOT-MANIFEST.md and resolve the audit boot path.
- Read the active execution token and state lock.
- Confirm task scope and dependency state.
- Review exact changed files and commit state.
- Verify that required commands were executed in the real environment.
- Check API, schema, interface, and shared-contract regression.
- Check security and data-masking compliance.
- Validate evidence graph entries.
- Approve, reject, or conditionally approve the Freeze Gate.

## Auditor Prohibitions

- Must not implement feature code in the same audit pass.
- Must not convert missing evidence into PASS.
- Must not approve intended architecture as implementation truth.
- Must not expand task scope to fix unrelated findings.
- Must not overwrite Developer evidence without recording the discrepancy.

## Audit Return Status

```text
PASS
PASS_WITH_APPROVED_EXCEPTION
FAIL
BLOCKED_BY_MISSING_EVIDENCE
BLOCKED_BY_STATE_MISMATCH
```

## Required Audit Report

```text
Task ID
Execution token
Base commit
Result commit
Files reviewed
Contracts checked
Commands verified
Evidence graph result
Regression result
Security result
State lock result
Freeze recommendation
Open blockers
```

## Multi-Agent Handoff

The Developer returns code and evidence to the Auditor.

The Auditor returns a gate decision to the Architect or Human owner.

The Auditor does not rely on chat history as source of truth; repository evidence and runtime results have priority.

## Maintenance Rule

Update this contract when audit authority, gate criteria, or responsibility separation changes.
