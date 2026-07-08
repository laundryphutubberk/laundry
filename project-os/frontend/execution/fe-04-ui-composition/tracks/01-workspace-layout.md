# FE-04 Track 01 — Workspace Layout

Status: DRAFT
Owner: FE-04 UI Composition

## Purpose

Define the UI composition rules for Laundry Workspace and Resort Workspace shells before implementing concrete pages.

This track ensures every workspace starts from the user's current task, preserves workspace isolation, and follows the adaptive UI rules from the Project OS.

## Source of Truth

- Business Blueprint: Workspace Model, Workspace Isolation Principle, Main Screens, Critical Business Rules
- UI Adaptive Guide: One Component, Multiple Layouts; task-first screens; desktop/tablet/mobile behavior
- FE-02 Architecture: Workspace Shell, Page Layer, Shared UI Layer, Domain Boundaries
- schema.prisma: User workspaceType, role, resortId, LaundryWork, Resort, LaundryCountLine, LinenInventorySummary, IssueReport

## Composition Principle

Workspace layout is not only navigation.

Workspace layout must answer:

```text
Who is using this workspace?
What can they see?
What task should they do first?
What data scope is allowed?
```

## Workspace Shells

### Laundry Workspace Shell

Primary users:

- Laundry Owner
- Laundry Manager
- Laundry Staff

Allowed scope:

- Laundry-wide operational data
- Multiple resorts when role permits
- Work queues
- Issue queues
- Return-ready work
- Reports and summaries

Primary composition order:

```text
Current Tasks
↓
Work Queue / Operational Summary
↓
Issue and Exception Alerts
↓
Reports / Secondary Navigation
```

Must emphasize:

- งานค้าง
- งานรอเปิดถุง
- งานที่นับแล้ว
- งานพร้อมส่งกลับ
- งานมีปัญหา

### Resort Workspace Shell

Primary users:

- Resort Owner
- Resort Staff

Allowed scope:

- Only the authenticated user's resortId
- Own linen inventory summary
- Own work history
- Own issues and reports

Primary composition order:

```text
Own Linen Status
↓
Laundry-in-progress Visibility
↓
Issue Summary
↓
History / Reports
```

Must emphasize:

- ผ้าทั้งหมด
- อยู่ที่รีสอร์ต
- อยู่โรงซัก
- มีปัญหา
- ประวัติส่งซัก

## Layout Rules

### Desktop

- Persistent sidebar is allowed.
- Multi-panel dashboard is allowed.
- Task panel must remain visually primary.
- Reports are secondary to current tasks.

### Tablet

- Sidebar should be collapsible.
- Use two-column layout only when it helps active work.
- Work Detail and Count & Sort interactions must remain touch-friendly.

### Mobile

- Use drawer or bottom navigation.
- Single-column layout.
- Current task appears before navigation depth.
- Large touch targets.
- Minimize typing; prefer scan, tap, and selection.

## Forbidden Composition

- Do not create separate Desktop and Mobile component families.
- Do not put business workflow logic inside the shell.
- Do not allow Resort Workspace to render data without resortId scope.
- Do not make reports mutate operational state.
- Do not make Shared UI import feature stores.

## Required Outputs

- Workspace layout composition map
- Laundry Workspace shell rules
- Resort Workspace shell rules
- Adaptive behavior baseline
- Clear handoff to Work Detail Timeline track

## Acceptance Checklist

- [ ] Laundry Workspace begins with task-oriented operational work.
- [ ] Resort Workspace is scoped by resortId.
- [ ] Desktop, tablet, and mobile use the same component logic.
- [ ] Navigation does not replace current-task visibility.
- [ ] Shell does not own deep business logic.
- [ ] Shared UI remains business-light.
