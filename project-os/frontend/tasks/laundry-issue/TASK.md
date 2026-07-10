# Laundry Issue — TASK

Status: IMPLEMENTED_PENDING_RUN_EVIDENCE

## Task

Complete the Laundry Issue flow and lock it only after extended runtime validation.

## Required Validation

- Count Line linkage
- Invalid Bag / Count Line protection
- Unlink / Relink
- Cancel Issue
- Summary synchronization
- Closed / Cancelled Work protection
- Workspace isolation
- Permission validation
- Duplicate-submit protection
- Build / lint evidence

## Rules

- No FE-09 feature implementation begins until this task is Completed.
- Existing runtime boundaries remain mandatory.
- Backend and frontend fixes may be completed in the same task when required for the flow.
- Completion requires real run evidence, not review-only evidence.

## Done

```text
IMPLEMENTED
+ BUILD PASS
+ RUNTIME PASS
+ EXTENDED FLOW PASS
+ ISOLATION/PERMISSION PASS
+ HANDOFF RECORDED
= COMPLETED
```
