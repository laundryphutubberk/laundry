# Checkpoint and Context Rehydration Standard

Status: Active
Owner: Chief Architect
Scope: Long-running AI execution

## Purpose

Reduce context poisoning by replacing long conversational continuity with repository-backed checkpoints.

## Principle

Do not depend on chat history as the durable state of a task.

Use:

```text
Verified commit
+ checkpoint file
+ execution state lock
+ task return contract
```

## Checkpoint Lifecycle

```text
Sub-task complete
  -> Verification pass
  -> Pre-commit gate pass
  -> Commit created and verified
  -> Write checkpoint
  -> End or split session
  -> New task starts at BOOT-MANIFEST
  -> Read execution state and checkpoint
  -> Rehydrate only relevant context
```

## Required Checkpoint Fields

```json
{
  "task_id": "FE-04-FOCUS-001",
  "status": "verified",
  "base_commit": "",
  "result_commit": "",
  "files_changed": [],
  "contracts_preserved": [],
  "verification": [],
  "known_gaps": [],
  "blocked_by": [],
  "next_task": "",
  "updated_at": ""
}
```

## Rehydration Rule

A resumed task must read only:

1. `project-os/00-core/BOOT-MANIFEST.md`
2. Applicable responsibility and execution boot files
3. `EXECUTION-STATE-LOCK.json`
4. Latest checkpoint/handoff for the task
5. Source files directly relevant to the next action

Do not reload unrelated error logs, abandoned proposals, or obsolete chat summaries.

## Session Split Triggers

Create a checkpoint and start a fresh session when:

- a milestone is verified and committed
- responsibility changes
- module ownership changes
- an upstream dependency blocks progress
- error history becomes larger than current task context
- the task moves from discovery to implementation or verification

## Truth Rule

A checkpoint must describe verified repository state, not intended work.
