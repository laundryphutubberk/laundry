# Laundry Issue Feature Task

Status: IMPLEMENTED_PENDING_RUN_EVIDENCE
Owner Domain: Laundry Workspace

## Mission

Support reporting, linking, updating, cancelling, resolving, and auditing operational issues discovered during Laundry Work.

## Owned Flow

```text
Open Laundry Work
→ Create Issue
→ Link to Work / Bag / Count Line
→ View Issue List
→ Update / Relink / Unlink
→ Cancel or Resolve
→ Refresh
→ Data Persists
```

## FE Standard Mapping

- FE-02 Architecture — applied
- FE-03 Runtime — applied
- FE-04 UI Composition — applied
- FE-05 State / Domain — applied
- FE-06 Integration — applied
- FE-07 Quality — core validation passed; extended validation pending
- FE-08 Delivery — build/runtime evidence partially complete

## Current Evidence

Verified in real runtime:

- Prisma migration and client generation
- Backend startup
- Frontend production build
- Create Issue
- Bag linkage
- Issue list reload
- Update Issue
- Resolve Issue
- Refresh persistence
- Business logs

## Remaining Gate

The task cannot be marked Completed until extended evidence covers Count Line linkage, unlink/relink, cancel behavior, summary synchronization, terminal work protection, workspace isolation, permission validation, and duplicate-submit behavior.

## Source Evidence

Existing FE-08 Laundry Issue documents under `project-os/frontend/execution/fe-08-laundry-issue/` remain active evidence during transition to the Feature Task ownership model.
