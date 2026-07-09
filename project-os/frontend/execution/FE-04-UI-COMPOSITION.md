# FE-04 UI Composition Standard

Status: BASELINE
Owner: FE-04 UI Composition
Depends On: FE-02 Architecture, FE-03 Runtime
Handoff Target: FE-05 State

## Purpose

Define the UI Composition Standard for the entire Laundry Management System.

This document defines frontend architecture for composing screens and UI boundaries only. It does not implement React components, runtime logic, business logic, or existing application changes.

## Scope

FE-04 defines standards for:

1. Application Layout
2. Screen Composition
3. Component Composition
4. Standard UI Components
5. Responsive Rules
6. Workspace Rules
7. Screen Blueprint Standard
8. Naming Standard
9. Handoff to FE-05

## Rules

FE-04 must not:

- Write React Components.
- Add Runtime Logic.
- Add Business Logic.
- Modify Existing Implementation.
- Change API contracts.
- Change schema.prisma.

FE-04 may only produce architecture documentation.

---

## 1. Application Layout

Application Layout defines the outer composition used by all screens.

Layer order follows FE-02 Architecture:

```text
App Shell
→ Workspace Shell
→ Route Layer
→ Page Layer
→ Feature Module Layer
→ Shared UI Layer
→ State / Service Layer
→ API Contract Boundary
```

### 1.1 App Shell

App Shell owns application-wide framing.

Responsibilities:

- Mount global providers.
- Mount router.
- Provide global error boundary location.
- Provide global layout boot area.

Rules:

- Must not contain laundry business workflow logic.
- Must not decide workspace-specific data visibility.
- Must not render domain-specific operational content directly.

### 1.2 Workspace Layout

Workspace Layout owns the visible shell for a workspace.

Workspaces:

```text
Laundry Workspace
Resort Workspace
Shared Screens
```

Responsibilities:

- Separate workspace surfaces.
- Provide workspace navigation area.
- Provide workspace header area.
- Provide content area.
- Preserve workspace isolation.

Rules:

- Laundry Workspace may show laundry-wide data only when policy allows.
- Resort Workspace must always be scoped by `resortId`.
- Shared Screens must not leak workspace-specific data.

### 1.3 Navigation

Navigation helps users move between tasks but must not replace task-first UI.

Navigation may include:

- Sidebar.
- Drawer navigation.
- Bottom navigation.
- Breadcrumbs.
- Secondary tabs.

Rules:

- Navigation must reflect workspace context.
- Navigation must not expose forbidden workspace routes.
- Current task visibility must remain more important than navigation depth.

### 1.4 Header

Header provides current context.

Header may show:

- Workspace name.
- Current screen title.
- Current entity identifier.
- Current user/role summary.
- Notifications when allowed.
- Primary contextual actions when appropriate.

Rules:

- Header must not become the main workflow area.
- Header must not contain deep business logic.

### 1.5 Footer

Footer is optional.

Allowed use:

- Secondary legal/system links.
- Version information.
- Low-priority support links.

Rules:

- Footer must not contain critical task actions.
- Footer may be hidden on task-heavy mobile screens.

### 1.6 Content Area

Content Area owns the active page composition.

Default composition:

```text
Screen Header
↓
Primary Task / Decision Area
↓
Operational Summary
↓
Main Detail Content
↓
Secondary Context
↓
Action Area
```

Rules:

- Current task must appear before secondary reports.
- Content must adapt by device size.
- Content Area must not bypass Page/Section boundaries.

---

## 2. Screen Composition

Screen Composition defines page types and their required structure.

### 2.1 Dashboard

Dashboard shows tasks and decisions first.

Composition:

```text
Dashboard Header
↓
Task Summary
↓
Urgent / Exception Cards
↓
Operational KPI Cards
↓
Queues / Recent Activity
↓
Reports Preview
```

Rules:

- Dashboard must not be a static menu grid.
- Dashboard must not show reports before current tasks.
- Dashboard must respect workspace policy and projection boundaries.

### 2.2 List Page

List Page shows searchable, filterable collections.

Composition:

```text
List Header
↓
Toolbar
↓
Filter Bar / Search Bar
↓
Data Table or Responsive Card List
↓
Pagination / Load More
↓
Empty / Loading / Error State
```

Rules:

- List Page must not own mutation business logic.
- List Page must not assume backend fields outside contracts.
- Mobile may use card-list instead of wide table.

### 2.3 Detail Page

Detail Page is used for entity review and operational work.

Composition:

```text
Detail Header
↓
Timeline Workflow / Status Context
↓
Current Step or Primary Panel
↓
Summary Cards
↓
Detail Sections
↓
Activity / Issues / Attachments
↓
Action Panel or Bottom Action Bar
```

Rules:

- Detail Page must show current status and next action clearly.
- Detail Page must not hide issues only inside notes.
- Detail Page must not become a static read-only page when operational action is required.

### 2.4 Wizard

Wizard is used for guided multi-step creation or setup.

Composition:

```text
Wizard Header
↓
Step Indicator
↓
Current Step Form Section
↓
Validation / Helper Context
↓
Action Bar
```

Rules:

- Wizard must have clear step identity.
- Wizard must allow safe back/cancel behavior when appropriate.
- Wizard must not hide long operational workflows inside modal dialogs.

### 2.5 Timeline Workflow

Timeline Workflow shows process state.

Example workflow:

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

Rules:

- Current step must be visually dominant.
- Completed steps must be scannable.
- Pending steps must be clear but secondary.
- Timeline must not own status transition business rules.

### 2.6 Workspace Home

Workspace Home is the first operational surface after entering a workspace.

Laundry Workspace Home composition:

```text
Current Tasks
↓
Work Queue Summary
↓
Issue / Exception Summary
↓
Reports Entry
```

Resort Workspace Home composition:

```text
Own Linen Status
↓
Laundry-in-progress Visibility
↓
Issue Summary
↓
History / Reports Entry
```

Rules:

- Workspace Home must be task-first.
- Workspace Home must respect workspace scope.

---

## 3. Component Composition

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

### 3.1 Page

Route-level screen composition.

May:

- Arrange Sections.
- Receive route parameters.
- Connect workspace shell context.
- Decide task-first ordering.

Must not:

- Own deep business rules.
- Perform API mutation logic directly.
- Become a shared visual primitive.

### 3.2 Sections

Major content regions inside a Page.

May:

- Arrange Cards, Panels, Tables, and Widgets.
- Express page-level meaning.

Must not:

- Become full pages.
- Own unrelated feature behavior.

### 3.3 Cards

Compact display units for grouped information.

Rules:

- One Card should answer one question or group one small concept.
- Cards should be scannable.
- Cards should be action-light.

### 3.4 Panels

Operational or contextual interaction areas.

Rules:

- Panels may host forms, controls, or focused actions in later implementation.
- Panels must not own runtime logic in FE-04.

### 3.5 Tables

Structured row-based display.

Rules:

- Tables are for comparison, review, and scanning.
- Tables must have responsive alternatives.

### 3.6 Widgets

Small reusable UI units inside higher-level components.

Rules:

- Widgets must stay business-light.
- Widgets must not import feature stores.

---

## 4. Standard UI Components

This section defines standard component roles only.

### 4.1 Timeline

Purpose:

- Show workflow progress or activity history.

Types:

- Progress Timeline.
- Activity Timeline.

Required states:

- completed
- current
- pending
- blocked
- cancelled

### 4.2 Summary Card

Purpose:

- Show one operational summary value.

Examples:

- จำนวนถุง
- น้ำหนักรวม
- นับแล้วทั้งหมด
- ชิ้นที่มีปัญหา

### 4.3 Status Badge

Purpose:

- Show compact status label.

Rules:

- Status Badge must be readable without color-only meaning.
- Status names must come from approved runtime/status vocabulary.

### 4.4 KPI Card

Purpose:

- Show dashboard-level metric.

Rules:

- KPI Card must include label, value, unit when needed, and optional trend/context.
- KPI Card must not hide task-critical warnings.

### 4.5 Action Panel

Purpose:

- Group primary and secondary actions.

Action priority:

```text
Primary Action
Secondary Action
Destructive Action
Navigation Action
```

Rules:

- Primary action must be visually clear.
- Destructive action must not be confused with primary action.

### 4.6 Bottom Action Bar

Purpose:

- Provide persistent task-critical actions on tablet/mobile or task-heavy screens.

Rules:

- Must not cover required content permanently.
- Must include clear primary action.

### 4.7 Empty State

Required structure:

```text
Title
Short explanation
Optional next action
Optional secondary hint
```

Rules:

- Must not show blank space only.
- Must not expose technical backend messages as primary copy.

### 4.8 Loading State

Purpose:

- Communicate pending data or action.

Rules:

- Prefer skeleton for cards/tables.
- Use spinner only for small inline actions.
- Avoid blocking the whole workspace unnecessarily.

### 4.9 Error State

Required structure:

```text
What happened
What the user can do next
Retry or safe navigation action
```

Rules:

- Must be human-readable.
- Workspace isolation errors must fail closed.
- Mutation errors must not pretend success.

### 4.10 Confirmation Dialog

Purpose:

- Confirm important or destructive decisions.

Rules:

- Must clearly state consequence.
- Must provide cancel path.
- Must not host long workflows.

### 4.11 Drawer

Purpose:

- Show contextual side content without leaving current task.

Allowed use:

- Filters
- Detail preview
- Mobile navigation
- Secondary context

Rules:

- Drawer must not become a hidden full page.
- Drawer must have clear close path.

### 4.12 Form Section

Purpose:

- Group related inputs.

Rules:

- Form Section must have a clear title when the form is long.
- Validation display belongs near the relevant field or section.
- FE-04 does not define validation logic.

### 4.13 Data Table

Purpose:

- Present structured operational rows.

Rules:

- Must support Empty, Loading, and Error State.
- Must provide responsive behavior.

### 4.14 Filter Bar

Purpose:

- Scope visible list/report data.

Rules:

- Filter Bar must not bypass workspace policy.
- Filter state belongs to FE-05 or later state work.

### 4.15 Search Bar

Purpose:

- Search within allowed data scope.

Rules:

- Search must not imply cross-workspace access.
- Search behavior is not implemented in FE-04.

### 4.16 Toolbar

Purpose:

- Group list/page utilities and secondary actions.

Rules:

- Toolbar must not replace Action Panel for primary task actions.

---

## 5. Responsive Rules

### 5.1 Desktop

Baseline:

```text
>= 1280px
```

Rules:

- Persistent sidebar allowed.
- Multi-column layout allowed.
- Dashboard can show multiple panels.
- Task area must remain primary.

### 5.2 Tablet

Baseline:

```text
768px - 1279px
```

Rules:

- Collapsible sidebar preferred.
- Two-column layout only when it helps active work.
- Touch targets must remain large.
- Bottom Action Bar may be used for task-critical actions.

### 5.3 Mobile

Baseline:

```text
< 768px
```

Rules:

- Drawer or bottom navigation.
- Single-column layout.
- Current task before secondary context.
- Large touch targets.
- Prefer scan, tap, and selection over typing.
- Avoid wide table dependency.

### 5.4 Large Display

Baseline:

```text
Wide desktop / operations display / control room display
```

Rules:

- May use expanded dashboard grids.
- May show more operational queues at once.
- Must not introduce a different business logic path.
- Must not expose data outside workspace policy.

---

## 6. Workspace Rules

### 6.1 Laundry Workspace

Primary users:

- Laundry Owner
- Laundry Manager
- Laundry Staff

Allowed UI focus:

- Work operations.
- Work queues.
- Issue queues.
- Ready-to-return work.
- Laundry-wide reports when allowed.

Rules:

- May access multiple resorts only when policy allows.
- Must clearly show current operational tasks.

### 6.2 Resort Workspace

Primary users:

- Resort Owner
- Resort Staff

Allowed UI focus:

- Own linen status.
- Own laundry work history.
- Own issue visibility.
- Own reports.

Rules:

- Must scope every surface by authenticated `resortId`.
- Must not reveal other resort information.
- Must not expose laundry-internal-only operational details unless approved by policy.

### 6.3 Shared Screens

Examples:

- Login
- Access denied
- Not found
- Global error screen

Rules:

- Shared Screens must be business-light.
- Shared Screens must not render protected workspace data before access is resolved.

---

## 7. Screen Blueprint Standard

Every screen blueprint file must use this naming format:

```text
*.blueprint.md
```

Blueprint files are architecture documents for future implementation.

They must not contain React implementation.

### 7.1 Required Template

```markdown
# <Screen Name> Blueprint

Status: DRAFT | BASELINE
Owner: <Domain / FE Track>
Workspace: Laundry | Resort | Shared

## Purpose

<What this screen is for.>

## User Goal

<What the user needs to do or decide.>

## Runtime Dependencies

<Runtime state, route params, auth/session/workspace context.>

## Projection Dependencies

<Read models / view models / derived UI data needed.>

## Policy Dependencies

<Workspace, role, resortId, and access constraints.>

## Layout

<Screen-level layout order.>

## Component Tree

```text
<Page>
  <Section>
    <Card />
    <Panel />
    <Table />
    <Widget />
```

## Responsive Notes

<Desktop, Tablet, Mobile, Large Display notes.>

## Action Bar

<Primary, secondary, destructive, navigation actions.>

## Empty State

<When no data is available.>

## Loading State

<When data is loading.>

## Error State

<When loading/action fails.>
```

### 7.2 Blueprint Rules

- Must cite workspace type.
- Must identify policy dependencies.
- Must separate runtime dependencies from projection dependencies.
- Must define component tree before implementation.
- Must include Empty, Loading, and Error State.

---

## 8. Naming Standard

UI files must use clear suffix naming by responsibility.

```text
*Page.tsx
*Section.tsx
*Card.tsx
*Panel.tsx
*Table.tsx
*Widget.tsx
*Timeline.tsx
*Dialog.tsx
*Drawer.tsx
*Toolbar.tsx
```

### 8.1 *Page.tsx

Route-level screen composition.

Examples:

```text
WorkDetailPage.tsx
LaundryDashboardPage.tsx
ResortDashboardPage.tsx
```

### 8.2 *Section.tsx

Major content region.

Examples:

```text
WorkTimelineSection.tsx
IssueSummarySection.tsx
ResortInventorySection.tsx
```

### 8.3 *Card.tsx

Compact display unit.

Examples:

```text
SummaryCard.tsx
IssueCard.tsx
InventoryCard.tsx
```

### 8.4 *Panel.tsx

Operational or contextual area.

Examples:

```text
CountPanel.tsx
SortPanel.tsx
ActionPanel.tsx
FilterPanel.tsx
```

### 8.5 *Table.tsx

Structured row-based display.

Examples:

```text
CountLineTable.tsx
WorkQueueTable.tsx
IssueTable.tsx
```

### 8.6 *Widget.tsx

Small reusable display/control unit.

Examples:

```text
MetricWidget.tsx
StepIndicatorWidget.tsx
IssueBadgeWidget.tsx
```

### 8.7 *Timeline.tsx

Progress or activity timeline.

Examples:

```text
WorkProgressTimeline.tsx
WorkActivityTimeline.tsx
```

### 8.8 *Dialog.tsx

Focused confirmation or small decision surface.

Examples:

```text
ConfirmReturnDialog.tsx
CancelWorkDialog.tsx
```

### 8.9 *Drawer.tsx

Contextual side surface.

Examples:

```text
FilterDrawer.tsx
IssueDetailDrawer.tsx
```

### 8.10 *Toolbar.tsx

Utility/action group for page or list context.

Examples:

```text
WorkListToolbar.tsx
ReportToolbar.tsx
```

---

## 9. Handoff to FE-05

FE-05 may continue with state and projection design for:

- Workspace state.
- Route and runtime dependency state.
- Dashboard projection state.
- List page query/filter/search state.
- Detail page current entity state.
- Timeline state.
- Summary/KPI card view models.
- Data table view models.
- Action Panel and Bottom Action Bar state.
- Empty, Loading, and Error State modeling.
- Dialog and Drawer visibility state.
- Policy-aware view model shaping.

FE-05 must preserve:

- FE-02 layer boundaries.
- FE-03 runtime transition boundaries.
- Workspace isolation.
- Page → Sections → Cards → Panels → Tables → Widgets hierarchy.
- Naming standard defined in FE-04.

FE-05 must not push business logic into Page, Shared UI, or visual-only components.

---

## 10. Done Checklist

- [x] Application Layout standard defined.
- [x] Screen Composition standard defined.
- [x] Component Composition standard defined.
- [x] Standard UI Components defined.
- [x] Responsive Rules defined.
- [x] Workspace Rules defined.
- [x] Screen Blueprint Standard defined.
- [x] Naming Standard defined.
- [x] Handoff to FE-05 defined.
- [x] No React Components written.
- [x] No Runtime Logic added.
- [x] No Business Logic added.
- [x] No Existing Implementation changed.
