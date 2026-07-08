# UI-FLOW-MAP.md

Status: Active
Owner: Frontend Architect / Business Architect

## Purpose

Map user-facing frontend workflows before FE implementation.

## Primary Laundry Flow

```text
Create / select work
  -> receive bag
  -> open bag
  -> count linen
  -> record issue if any
  -> update work status
  -> prepare return
  -> close work
```

## Workspace Views

| Workspace | Primary View | Notes |
|---|---|---|
| Laundry Workspace | Work queues and operational detail | Can see operational work across resorts |
| Resort Workspace | Resort-specific linen visibility | Must be scoped to own resort data |

## Screen Flow

| Flow | Screens |
|---|---|
| Work management | Dashboard -> Work List -> Work Detail |
| Bag receiving | Work Detail -> Receive Bag |
| Counting | Work Detail -> Bag Detail -> Count Linen |
| Issue handling | Work Detail or Bag Detail -> Report Issue |
| Inventory visibility | Resort Workspace -> Inventory Summary |
| Machine planning | Dashboard or Work Detail -> Machine Planning |

## Rule

Every frontend workflow must start from user task, not from database model or route name.
