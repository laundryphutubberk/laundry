# Laundry Work Detail Screen Blueprint

Status: BASELINE
Owner: FE-04 UI Composition
Workspace: Laundry
Screen Type: Detail Page
Implementation Target: UI Team

## Purpose

Define the screen blueprint for Laundry Work Detail, the main operational page for tracking and continuing one laundry work item from receiving bags through return.

This document is an architecture and UI composition spec only. It does not implement React components, runtime logic, or business logic.

## User Goal

Laundry staff, manager, or owner should immediately understand:

- Which work item is open.
- Which resort owns the work.
- What the current status/step is.
- What has already been counted or recorded.
- What issues exist.
- What action should happen next.

## Runtime Dependencies

Runtime dependencies are read-only expectations for FE-05 and later implementation.

- Route parameter: `workId` or `workNo`.
- Authenticated user context.
- Workspace type must be Laundry Workspace.
- Work status lifecycle from FE-03 Runtime.
- Current active step derived from work status.
- User permission/policy state for visible actions.

## Projection Dependencies

The UI team should expect FE-05 to provide view models for:

- Work header summary.
- Timeline steps.
- Summary card metrics.
- Count line table rows.
- Issue panel items.
- Image panel items.
- History/activity events.
- Bottom action bar actions.
- Empty/loading/error states.

## Policy Dependencies

- Screen is Laundry Workspace only.
- Data may include multiple resorts only when policy permits.
- Actions must be policy-aware.
- Resort Workspace must not use this full operational detail page unless separately approved by policy.

## Layout

Desktop composition:

```text
LaundryWorkspaceLayout
  Header / Top Context
  Main Content Area
    WorkDetailHeaderSection
    Two-column Operational Area
      Left Column
        WorkTimelineSection
      Right Column
        WorkSummarySection
        CountLineTableSection
    Lower Context Grid
      HistoryPanelSection
      ImagePanelSection
      IssuePanelSection
  BottomActionBar
```

Tablet composition:

```text
LaundryWorkspaceLayout
  WorkDetailHeaderSection
  WorkTimelineSection
  WorkSummarySection
  CountLineTableSection
  Context Panels
    HistoryPanelSection
    ImagePanelSection
    IssuePanelSection
  BottomActionBar
```

Mobile composition:

```text
LaundryWorkspaceLayout
  WorkDetailHeaderSection
  CurrentStep / Timeline Compact
  WorkSummarySection
  CountLineTableSection as Card List
  IssuePanelSection
  ImagePanelSection
  HistoryPanelSection
  StickyBottomActionBar
```

## Component Tree

```text
LaundryWorkDetailPage
  WorkDetailHeaderSection
    WorkIdentityCard
    WorkStatusBadge
    WorkMetaWidget
    WorkHeaderToolbar

  WorkTimelineSection
    WorkProgressTimeline
    WorkTimelineStepWidget

  WorkSummarySection
    SummaryCard: Bag Count
    SummaryCard: Total Weight
    SummaryCard: Counted Items
    SummaryCard: Issue Items

  CountLineTableSection
    CountLineTable
    CountLineTableRow
    CountLineMobileCard

  IssuePanelSection
    IssuePanel
    IssueCard
    IssueStatusBadge

  ImagePanelSection
    ImagePanel
    ImageThumbnailCard
    ImageGalleryActionWidget

  HistoryPanelSection
    HistoryPanel
    WorkActivityTimeline
    WorkActivityEventWidget

  WorkBottomActionBar
    SecondaryActionButton
    DraftActionButton
    PrimaryNextActionButton
```

## Components

### 1. WorkDetailHeaderSection

Purpose:

- Identify the active work item and key context.

Required content:

- Work number.
- Current status badge.
- Resort name.
- Received date/time.
- Responsible staff when available.
- Header actions such as print/report/edit when policy allows.

Rules:

- Must be readable before scrolling.
- Must not own business logic.
- Must not trigger mutations directly.

Suggested naming:

```text
WorkDetailHeaderSection.tsx
WorkStatusBadge.tsx
WorkHeaderToolbar.tsx
```

### 2. WorkTimelineSection

Purpose:

- Show workflow progress and current step.

Required steps:

```text
รับถุง
โรงซักรับถุง
เปิดถุง
นับชิ้น
แยกประเภท
แยกสี
บันทึกข้อมูล
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
- Pending steps must be secondary.
- Timeline must not own transition rules.

Suggested naming:

```text
WorkTimelineSection.tsx
WorkProgressTimeline.tsx
WorkTimelineStepWidget.tsx
```

### 3. WorkSummarySection

Purpose:

- Show high-value work metrics.

Required cards:

- Bag count.
- Total weight.
- Counted item quantity.
- Issue quantity.

Rules:

- One card answers one question.
- Values must be visually dominant.
- Units must be visible.
- Cards must be action-light.

Suggested naming:

```text
WorkSummarySection.tsx
SummaryCard.tsx
```

### 4. CountLineTableSection

Purpose:

- Review counted linen items.

Expected columns:

- Item type.
- Quantity.
- Weight when available.
- Issue quantity when available.
- Note when useful.

Responsive behavior:

- Desktop: table.
- Tablet: compact table or grouped rows.
- Mobile: card list.

Rules:

- Table is review-first, not the main editor.
- Row actions must not hide primary workflow actions.
- Must support empty/loading/error states.

Suggested naming:

```text
CountLineTableSection.tsx
CountLineTable.tsx
CountLineMobileCard.tsx
```

### 5. IssuePanelSection

Purpose:

- Show explicit issues related to the work.

Expected issue data:

- Issue type.
- Quantity.
- Related item type when available.
- Status.
- Reporter/actor when available.
- Timestamp when available.

Rules:

- Issues must not be hidden only in notes.
- Issue severity/status must be readable without color-only meaning.
- Issue action visibility must be policy-aware.

Suggested naming:

```text
IssuePanelSection.tsx
IssuePanel.tsx
IssueCard.tsx
IssueStatusBadge.tsx
```

### 6. ImagePanelSection

Purpose:

- Show supporting work images.

Expected image data:

- Thumbnail URL.
- Capture/upload time when available.
- Optional caption/note.
- Optional uploader.

Rules:

- Gallery must remain secondary to current task.
- Mobile layout must support thumb grid or horizontal scroll.
- Do not treat images as source of inventory truth.

Suggested naming:

```text
ImagePanelSection.tsx
ImagePanel.tsx
ImageThumbnailCard.tsx
```

### 7. HistoryPanelSection

Purpose:

- Show work activity/audit history.

Expected history data:

- Time.
- Event label.
- Actor.
- Note when available.

Rules:

- History is read-only context.
- Must not be used as the primary workflow control.
- Must be scannable and compact.

Suggested naming:

```text
HistoryPanelSection.tsx
HistoryPanel.tsx
WorkActivityTimeline.tsx
```

### 8. WorkBottomActionBar

Purpose:

- Provide visible next actions.

Expected action groups:

```text
Back / Navigation
Save Draft
Primary Next Step
Secondary Contextual Action
```

Rules:

- Primary next action must be visually clear.
- Destructive actions must be separated or confirmed.
- Mobile should use sticky bottom action behavior when task-critical.
- Action Bar must not own business rules.

Suggested naming:

```text
WorkBottomActionBar.tsx
BottomActionBar.tsx
```

## Empty State

### Whole Screen Empty

Use when work cannot be found or is unavailable.

Required content:

- Clear title.
- Explanation.
- Safe navigation action back to work list.

### Count Line Empty

Use when no counted items exist yet.

Required content:

- Explain that no items have been counted.
- Show next step only if policy/runtime allows.

### Issue Empty

Use when no issues exist.

Required content:

- Short positive empty message.
- No unnecessary action required.

### Image Empty

Use when no images exist.

Required content:

- Short explanation.
- Optional add/view action only when implementation/policy allows.

### History Empty

Use when no events are available.

Required content:

- Short explanation.

## Loading State

Use section-level loading whenever possible.

Examples:

- Header skeleton.
- Timeline skeleton.
- Summary card skeletons.
- Table row skeletons.
- Panel skeletons.

Rules:

- Do not block the entire page when only one panel is loading.
- Keep layout stable.

## Error State

Error state must be human-readable.

Required content:

- What happened.
- What the user can do next.
- Retry or safe navigation action.

Rules:

- Workspace/policy errors fail closed.
- Mutation errors must not show success.

## Responsive Notes

### Desktop

- Use two-column operational area.
- Timeline can sit left of main detail content.
- Summary/table content can sit in the larger right column.
- Lower panels may use a three-column grid.

### Tablet

- Use stacked or two-column layout depending on available width.
- Timeline may become horizontal/compact if needed.
- Bottom Action Bar may be sticky.

### Mobile

- Single-column layout.
- Current step and primary action appear early.
- Count table becomes card list.
- Bottom Action Bar is sticky for primary next action.

## Action Bar

Primary next action should be provided by runtime/policy projection.

Examples by status, for future implementation only:

- Continue counting.
- Continue sorting type.
- Continue sorting color.
- Record data.
- Mark ready to return.
- Confirm returned.

FE-04 does not define the transition logic.

## Implementation Notes for UI Team

- Build from this blueprint and FE-04 UI Composition Standard.
- Do not put business logic into visual components.
- Keep Page composition thin.
- Move derived display data to FE-05 projections/view models.
- Respect component naming standard.

## Done Criteria

- Header spec defined.
- Timeline spec defined.
- Summary cards spec defined.
- Table spec defined.
- Issue panel spec defined.
- Image panel spec defined.
- History panel spec defined.
- Bottom action bar spec defined.
- Ready for UI component implementation.
