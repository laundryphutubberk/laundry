# Laundry Work Detail Component Spec

Status: BASELINE
Owner: FE-04 UI Composition
Related Blueprint: `laundry-work-detail.blueprint.md`
Implementation Target: UI Team

## Purpose

Define component-level responsibilities for the Laundry Work Detail screen.

This file is a UI architecture spec only. It does not include React implementation, runtime logic, business logic, or existing implementation changes.

## Component Boundary

```text
LaundryWorkDetailPage
↓
Sections
↓
Cards / Panels / Tables / Timelines
↓
Widgets
```

## Top-Level Page

### LaundryWorkDetailPage

Type: `*Page.tsx`

Responsibility:

- Compose all screen sections.
- Receive route-level work identity.
- Connect to workspace shell context when implementation begins.
- Keep ordering task-first.

Must not:

- Own status transition logic.
- Perform API mutations directly.
- Render unscoped data.

Children:

```text
WorkDetailHeaderSection
WorkTimelineSection
WorkSummarySection
CountLineTableSection
IssuePanelSection
ImagePanelSection
HistoryPanelSection
WorkBottomActionBar
```

---

## 1. Header Components

### WorkDetailHeaderSection

Type: `*Section.tsx`

Purpose:

- Present work identity and top-level context.

Inputs from future view model:

```text
workNo
status
resortName
receivedAt
responsibleName
headerActions
```

Children:

```text
WorkIdentityCard
WorkStatusBadge
WorkMetaWidget
WorkHeaderToolbar
```

Rules:

- Must be visible near the top of the screen.
- Must not own edit/print/report logic.
- Must pass actions to toolbar as display/action descriptors only.

### WorkIdentityCard

Type: `*Card.tsx`

Purpose:

- Show work number and core identity.

### WorkStatusBadge

Type: `*Widget.tsx` or `*Card.tsx` depending on implementation.

Purpose:

- Show current work status.

Rules:

- Must not rely on color alone.
- Label must use approved runtime vocabulary.

### WorkMetaWidget

Type: `*Widget.tsx`

Purpose:

- Show resort, received date/time, and responsible staff.

### WorkHeaderToolbar

Type: `*Toolbar.tsx`

Purpose:

- Show secondary actions such as print/report/edit when policy allows.

Rules:

- Toolbar actions are not the primary workflow actions.

---

## 2. Timeline Components

### WorkTimelineSection

Type: `*Section.tsx`

Purpose:

- Host the workflow timeline.

Children:

```text
WorkProgressTimeline
WorkTimelineStepWidget
```

### WorkProgressTimeline

Type: `*Timeline.tsx`

Purpose:

- Render ordered workflow steps.

Expected step fields from future projection:

```text
id
label
state
completedAt
actorName
helperText
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

- Current step visually dominant.
- Completed and pending steps scannable.
- No transition logic inside timeline.

### WorkTimelineStepWidget

Type: `*Widget.tsx`

Purpose:

- Render one timeline step.

Rules:

- Must handle label, state, time, actor, and helper text.
- Must be reusable for compact/mobile timeline.

---

## 3. Summary Card Components

### WorkSummarySection

Type: `*Section.tsx`

Purpose:

- Host key summary metrics.

Children:

```text
SummaryCard
```

Required summary cards:

```text
Bag Count
Total Weight
Counted Items
Issue Items
```

### SummaryCard

Type: `*Card.tsx`

Expected fields:

```text
title
value
unit
statusTone optional
helperText optional
```

Rules:

- One metric per card.
- Value must be dominant.
- Unit must be clear.
- No forms inside summary cards.

---

## 4. Table Components

### CountLineTableSection

Type: `*Section.tsx`

Purpose:

- Host counted linen review table or responsive card list.

Children:

```text
CountLineTable
CountLineMobileCard
```

### CountLineTable

Type: `*Table.tsx`

Expected row fields:

```text
itemTypeName
quantity
weightKg
issueQuantity
note
```

Rules:

- Desktop uses table layout.
- Must support empty/loading/error states.
- Must not be primary editor for count/sort workflow.

### CountLineMobileCard

Type: `*Card.tsx`

Purpose:

- Mobile representation of one count line row.

Rules:

- Must preserve same information as table row.
- Must avoid wide horizontal scrolling.

---

## 5. Issue Panel Components

### IssuePanelSection

Type: `*Section.tsx`

Purpose:

- Host explicit work issues.

Children:

```text
IssuePanel
IssueCard
IssueStatusBadge
```

### IssuePanel

Type: `*Panel.tsx`

Expected fields:

```text
issues
emptyState
loadingState
errorState
```

Rules:

- Issues must be visible as explicit issues, not hidden in note text.
- Must be policy-aware for actions.

### IssueCard

Type: `*Card.tsx`

Expected fields:

```text
issueType
quantity
itemTypeName optional
status
reportedBy optional
reportedAt optional
```

### IssueStatusBadge

Type: `*Widget.tsx`

Purpose:

- Show issue status clearly.

---

## 6. Image Panel Components

### ImagePanelSection

Type: `*Section.tsx`

Purpose:

- Host work image gallery/preview.

Children:

```text
ImagePanel
ImageThumbnailCard
ImageGalleryActionWidget
```

### ImagePanel

Type: `*Panel.tsx`

Expected fields:

```text
images
emptyState
loadingState
errorState
```

Rules:

- Image panel is supporting evidence, not inventory source of truth.
- Must be secondary to current operational task.

### ImageThumbnailCard

Type: `*Card.tsx`

Expected fields:

```text
thumbnailUrl
caption optional
uploadedAt optional
uploadedBy optional
```

### ImageGalleryActionWidget

Type: `*Widget.tsx`

Purpose:

- Represent view-all or gallery action when allowed.

---

## 7. History Panel Components

### HistoryPanelSection

Type: `*Section.tsx`

Purpose:

- Host read-only activity history.

Children:

```text
HistoryPanel
WorkActivityTimeline
WorkActivityEventWidget
```

### HistoryPanel

Type: `*Panel.tsx`

Expected fields:

```text
events
emptyState
loadingState
errorState
```

### WorkActivityTimeline

Type: `*Timeline.tsx`

Purpose:

- Render chronological work activity.

### WorkActivityEventWidget

Type: `*Widget.tsx`

Expected fields:

```text
time
eventLabel
actorName optional
note optional
```

Rules:

- Read-only.
- Must not become workflow control.

---

## 8. Bottom Action Bar Components

### WorkBottomActionBar

Type: `*Panel.tsx` or shared `BottomActionBar.tsx`

Purpose:

- Show visible next actions for the current work state.

Expected action descriptors from future projection:

```text
primaryAction
secondaryActions
navigationAction
draftAction
destructiveAction optional
```

Rules:

- Primary action visually dominant.
- Destructive action separated and confirmed.
- Sticky behavior allowed on mobile/tablet.
- No transition logic inside the component.

Suggested children:

```text
BottomActionBar
PrimaryActionButtonWidget
SecondaryActionButtonWidget
```

---

## Cross-Component States

Each major section must support:

```text
empty
loading
error
ready
```

State rendering must be provided by future FE-05 state/projection, not FE-04 implementation.

## Responsive Component Behavior

### Desktop

- Header full width.
- Timeline can be left column.
- Summary and table can be right/main column.
- Issue/image/history panels can form lower grid.

### Tablet

- Sections stack or use two columns when useful.
- Bottom action bar may become sticky.
- Timeline may become compact.

### Mobile

- Single column.
- Timeline compact.
- Table becomes mobile cards.
- Bottom action bar sticky.

## UI Team Implementation Guardrails

- Follow naming suffixes from FE-04 UI Composition Standard.
- Do not put business logic in visual components.
- Do not put status transition rules in timeline or action bar.
- Do not bypass workspace policy.
- Do not duplicate desktop/mobile component families.
- Use the same component logic with responsive layout variants.

## Ready for React Implementation

The UI team can start creating component files using these names:

```text
LaundryWorkDetailPage.tsx
WorkDetailHeaderSection.tsx
WorkTimelineSection.tsx
WorkSummarySection.tsx
CountLineTableSection.tsx
IssuePanelSection.tsx
ImagePanelSection.tsx
HistoryPanelSection.tsx
WorkBottomActionBar.tsx
WorkProgressTimeline.tsx
WorkActivityTimeline.tsx
CountLineTable.tsx
CountLineMobileCard.tsx
IssuePanel.tsx
ImagePanel.tsx
HistoryPanel.tsx
SummaryCard.tsx
IssueCard.tsx
ImageThumbnailCard.tsx
```

## Done Criteria

- Header component spec defined.
- Timeline component spec defined.
- Summary cards component spec defined.
- Table component spec defined.
- Issue panel component spec defined.
- Image panel component spec defined.
- History panel component spec defined.
- Bottom action bar component spec defined.
- UI team can begin React component implementation from this spec.
