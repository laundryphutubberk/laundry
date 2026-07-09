# FE-04 UI Composition Standard

Status: BASELINE
Owner: FE-04 UI Composition
Handoff Target: FE-05 State

## Purpose

Define the UI Composition Standard for the entire Laundry Management System.

This document describes how frontend screens must be composed so that every page is task-first, workspace-safe, adaptive, reusable, and ready for state integration in FE-05.

## Scope

This standard covers composition rules only.

It defines:

- Screen Layout
- Workspace Layout
- Detail Page
- Dashboard
- Timeline
- Summary Cards
- Data Table
- Action Panel
- Empty State
- Loading State
- Error State
- Modal
- Drawer
- Responsive Rule
- Component Boundary
- Naming Standard

## Non-Scope

FE-04 must not:

- Write real UI implementation.
- Modify runtime code.
- Add business logic.
- Change API contracts.
- Change schema.prisma.
- Create state management logic.
- Create backend behavior.

---

## 1. Core Composition Principles

### 1.1 Task-First UI

Every screen must begin with what the user needs to do or decide.

Navigation, reports, and secondary information must not visually overpower the current task.

### 1.2 Workspace-Safe UI

Every screen belongs to a workspace context.

```text
Laundry Workspace
Resort Workspace
```

Laundry Workspace may show laundry-wide operational data when the authenticated role allows it.

Resort Workspace must only show data scoped by the authenticated user's `resortId`.

### 1.3 One Component, Multiple Layouts

Desktop, tablet, and mobile must use the same component logic.

Layout may adapt by screen size, but component families must not split into Desktop/Mobile duplicates.

### 1.4 Composition Before Implementation

FE-04 defines structure and boundaries.

Implementation belongs to later frontend execution tasks.

---

## 2. Component Boundary Model

All UI must follow this composition hierarchy:

```text
Page
↓
Sections
↓
Cards
↓
Panels
↓
Tables
↓
Widgets
```

### 2.1 Page

A Page owns route-level composition.

A Page may:

- Arrange Sections.
- Receive route parameters.
- Connect workspace shell context.
- Decide task-first ordering.

A Page must not:

- Own deep business rules.
- Perform API mutation logic directly.
- Contain reusable visual primitives that belong in shared UI.

### 2.2 Section

A Section groups a major screen area.

Examples:

- WorkHeaderSection
- WorkTimelineSection
- CountSummarySection
- IssueSection
- ResortInventorySection

A Section may:

- Arrange Cards, Panels, Tables, and Widgets.
- Express page-level meaning.

A Section must not:

- Become a full page.
- Own unrelated feature behavior.

### 2.3 Card

A Card presents compact information or a grouped summary.

Examples:

- SummaryCard
- IssueCard
- InventoryCard
- PhotoCard

A Card must be readable, scannable, and action-light.

### 2.4 Panel

A Panel is an operational workspace for a task or interaction group.

Examples:

- CountPanel
- SortPanel
- ActionPanel
- FilterPanel

A Panel may contain inputs and actions when implementation begins, but FE-04 only defines structure.

### 2.5 Table

A Table presents structured rows for comparison, review, or operational scanning.

Tables must not be used when cards or lists are clearer on mobile.

### 2.6 Widget

A Widget is a small, reusable unit used inside Cards, Panels, Tables, or Sections.

Examples:

- StatusBadge
- MetricWidget
- StepIndicator
- IssueBadge

Widgets must stay business-light and reusable.

---

## 3. Screen Layout Standard

Every screen should follow this order unless the domain document explicitly approves otherwise:

```text
Screen Header
↓
Current Task / Primary Decision Area
↓
Operational Summary
↓
Detail Content
↓
Secondary Context
↓
Actions
```

### Required Screen Header Content

A Screen Header should answer:

- What screen is this?
- Which workspace is this?
- What object or task is active?
- What is the current status?

### Forbidden Screen Layout

- Do not start with menu-only content.
- Do not hide the current task below reports.
- Do not mix unrelated domains on one screen.
- Do not create screen layouts that require duplicated mobile components.

---

## 4. Workspace Layout Standard

### 4.1 Laundry Workspace

Composition order:

```text
Current Tasks
↓
Work Queue / Operational Summary
↓
Issue and Exception Alerts
↓
Reports / Secondary Navigation
```

Primary UI focus:

- งานค้าง
- งานรอเปิดถุง
- งานที่นับแล้ว
- งานพร้อมส่งกลับ
- งานมีปัญหา

### 4.2 Resort Workspace

Composition order:

```text
Own Linen Status
↓
Laundry-in-progress Visibility
↓
Issue Summary
↓
History / Reports
```

Primary UI focus:

- ผ้าทั้งหมด
- อยู่ที่รีสอร์ต
- อยู่โรงซัก
- มีปัญหา
- ประวัติส่งซัก

### Workspace Boundary Rule

Workspace layout is a data access boundary, not just a visual shell.

Resort Workspace must never render unscoped cross-resort information.

---

## 5. Detail Page Standard

Detail pages are the main place for operational work.

Example: Work Detail.

Composition order:

```text
Detail Header
↓
Progress / Timeline
↓
Current Step Panel
↓
Summary Cards
↓
Data Review Table
↓
Activity / Attachments / Issues
↓
Action Panel
```

### Detail Header

Must show:

- Entity identifier
- Current status
- Related customer/resort
- Key date/time
- Responsible user when available

### Current Step Priority

The current step must be visually clearer than completed or future steps.

### Forbidden Detail Page Pattern

- Do not make a detail page a static information page only.
- Do not hide next actions.
- Do not put issue information only inside notes.

---

## 6. Dashboard Standard

Dashboards must show task and decision information first.

Dashboard composition order:

```text
Task Summary
↓
Urgent / Exception Cards
↓
Operational Metrics
↓
Work Queues or Recent Activity
↓
Reports Preview
```

### Laundry Dashboard

Must prioritize:

- Active works
- Pending steps
- Ready-to-return works
- Issue works
- Today summary

### Resort Dashboard

Must prioritize:

- Linen inventory status
- Linen currently at laundry
- Issue quantity
- Recent work history
- Reports relevant to the resort only

### Dashboard Forbidden Pattern

- Do not build dashboards as static menu grids.
- Do not show reports before current tasks.
- Do not bypass workspace isolation.

---

## 7. Timeline Standard

Timeline is used to show operational progress and history.

### Progress Timeline

Used for workflow state.

Example steps:

```text
รับถุง
↓
โรงซักรับถุง
↓
เปิดถุง
↓
นับชิ้น
↓
แยกประเภท
↓
แยกสี
↓
บันทึกข้อมูล
↓
ส่งกลับ
```

Step states:

```text
completed
current
pending
blocked
cancelled
```

### Activity Timeline

Used for audit-like history.

Must show:

- Time
- Event
- Actor when available
- Short note when useful

### Timeline Rules

- Current step must be visually dominant.
- Completed steps must be scannable.
- Pending steps must be clear but secondary.
- Timeline must not own transition business rules.

---

## 8. Summary Cards Standard

Summary Cards present high-value metrics.

Examples:

- จำนวนถุง
- น้ำหนักรวม
- นับแล้วทั้งหมด
- ชิ้นที่มีปัญหา
- ผ้าอยู่โรงซัก
- ผ้าพร้อมส่งกลับ

Rules:

- One card should answer one question.
- Labels must be short.
- Values must be visually dominant.
- Units must be visible.
- Cards must not contain complex forms.

---

## 9. Data Table Standard

Data Tables are for structured review.

Use tables for:

- Counted item rows
- Work lists
- Issue lists
- Report summaries

A table should include:

- Clear column labels
- Empty state
- Loading state
- Error state
- Row-level action placement when needed

Responsive behavior:

- Desktop: table layout allowed.
- Tablet: compact table or card-list allowed.
- Mobile: card-list or stacked rows preferred.

Forbidden:

- Do not force wide tables on mobile.
- Do not put primary task actions only in table rows when mobile users need them frequently.

---

## 10. Action Panel Standard

Action Panel owns visible next actions.

Typical placement:

```text
Desktop: bottom or right-side action area
Tablet: sticky lower action area when needed
Mobile: sticky bottom action bar when task-critical
```

Action priority:

```text
Primary Action
Secondary Action
Destructive Action
Navigation Action
```

Rules:

- Primary action must be clear.
- Destructive action must not be visually confused with primary action.
- Action Panel must not own business logic.
- Save draft and next-step actions should be visually distinct.

---

## 11. Empty State Standard

Empty State must explain what is missing and what the user can do next.

Required structure:

```text
Title
Short explanation
Optional next action
Optional secondary hint
```

Examples:

- No active laundry work.
- No issue reports.
- No counted items yet.
- No resort inventory history yet.

Forbidden:

- Do not show only blank space.
- Do not show technical backend messages as empty state.

---

## 12. Loading State Standard

Loading State must preserve layout stability where possible.

Use:

- Skeleton for cards and tables.
- Spinner only for small inline actions.
- Clear loading text when the wait affects task completion.

Forbidden:

- Do not block the whole workspace unnecessarily.
- Do not replace the entire screen when only one section is loading.

---

## 13. Error State Standard

Error State must be actionable and human-readable.

Required structure:

```text
What happened
What the user can do next
Retry or safe navigation action
```

Rules:

- Technical details may be logged, but should not dominate UI copy.
- Workspace isolation errors must fail closed.
- Data mutation errors must not pretend success.

---

## 14. Modal Standard

Use Modal for focused decisions that interrupt the current flow.

Allowed use:

- Confirm destructive actions.
- Review important changes.
- Short focused forms.
- Issue detail preview when context must remain on the current page.

Forbidden:

- Do not use modal for full workflows.
- Do not hide multi-step work inside modals.
- Do not use modal when Drawer or Detail Page is more appropriate.

---

## 15. Drawer Standard

Use Drawer for contextual side content without leaving the current task.

Allowed use:

- Filters
- Detail preview
- Mobile navigation
- Secondary context
- Short supporting panels

Rules:

- Drawer must not become a full hidden page.
- Drawer content must have a clear close path.
- Mobile drawer must be touch-friendly.

---

## 16. Responsive Rule

Breakpoints follow the UI Adaptive Guide:

```text
Desktop >= 1280px
Tablet 768px - 1279px
Mobile < 768px
```

### Desktop

- Persistent sidebar allowed.
- Multi-column layout allowed.
- Dashboard can show multiple panels.
- Task area must remain primary.

### Tablet

- Collapsible sidebar preferred.
- Two-column layout only when it helps active work.
- Touch targets must remain large.

### Mobile

- Drawer or bottom navigation.
- Single-column layout.
- Current task before secondary context.
- Large touch targets.
- Prefer scan, tap, and selection over typing.

### Responsive Forbidden Pattern

- Do not create separate component families for desktop and mobile.
- Do not hide primary actions on mobile.
- Do not force desktop table behavior on mobile.

---

## 17. Naming Standard

All UI files must use clear suffix naming by responsibility.

```text
*Page.tsx
*Section.tsx
*Card.tsx
*Panel.tsx
*Table.tsx
*Timeline.tsx
```

### Naming Meaning

#### *Page.tsx

Route-level screen composition.

Example:

```text
WorkDetailPage.tsx
LaundryDashboardPage.tsx
ResortDashboardPage.tsx
```

#### *Section.tsx

Major content region inside a page.

Example:

```text
WorkTimelineSection.tsx
IssueSummarySection.tsx
ResortInventorySection.tsx
```

#### *Card.tsx

Compact display unit.

Example:

```text
SummaryCard.tsx
IssueCard.tsx
InventoryCard.tsx
```

#### *Panel.tsx

Operational or contextual interaction area.

Example:

```text
CountPanel.tsx
SortPanel.tsx
ActionPanel.tsx
FilterPanel.tsx
```

#### *Table.tsx

Structured row-based display.

Example:

```text
CountLineTable.tsx
WorkQueueTable.tsx
IssueTable.tsx
```

#### *Timeline.tsx

Progress or activity timeline.

Example:

```text
WorkProgressTimeline.tsx
WorkActivityTimeline.tsx
```

---

## 18. Handoff to FE-05

FE-05 may use this document to define state shape and view models for:

- Current task state
- Dashboard summary state
- Timeline state
- Summary card state
- Data table state
- Empty/loading/error state
- Modal/drawer visibility state
- Action panel state

FE-05 must preserve the component boundaries and must not push business logic into Page or Shared UI components.

---

## 19. Done Checklist

- [x] Screen Layout standard defined.
- [x] Workspace Layout standard defined.
- [x] Detail Page standard defined.
- [x] Dashboard standard defined.
- [x] Timeline standard defined.
- [x] Summary Cards standard defined.
- [x] Data Table standard defined.
- [x] Action Panel standard defined.
- [x] Empty State standard defined.
- [x] Loading State standard defined.
- [x] Error State standard defined.
- [x] Modal standard defined.
- [x] Drawer standard defined.
- [x] Responsive Rule defined.
- [x] Component Boundary defined.
- [x] Naming Standard defined.
- [x] No real UI implementation included.
- [x] No runtime changes included.
- [x] No business logic added.
- [x] Ready for FE-05 handoff.
