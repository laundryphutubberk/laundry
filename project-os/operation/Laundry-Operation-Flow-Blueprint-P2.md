# Laundry Operation Flow Blueprint (P2)

Status: Draft v0.1
Scope: Laundry operation workflow, workspace UX, and reusable screen patterns
Owner: Project OS / Laundry Workspace

## 1. Purpose

This blueprint defines the first practical workflow standard for Laundry OS. It is not a long theoretical design document. It exists to keep future screens consistent, reduce rework, and make each new workflow page follow the same operational language.

The blueprint should evolve from real implementation evidence. When a UI pattern is accepted in the product, record it here as a baseline before reusing it elsewhere.

## 2. Operating Principle

Laundry OS should feel like one workspace, not many unrelated pages.

Every operational module should follow the same mental model:

```text
List -> Detail -> Action -> Evidence -> Issue -> History -> Next Step
```

This applies to laundry work, customers/resorts, machines, delivery, stock, reports, and future operational modules.

## 3. Core Laundry Operation Flow

Baseline end-to-end laundry work flow:

```text
Receive Work
  -> Verify Intake
  -> Weigh / Count
  -> Sort
  -> Wash
  -> Dry
  -> Iron / Fold
  -> Quality Check
  -> Pack
  -> Ready for Delivery
  -> Deliver / Close Work
```

Each step must answer:

- What is happening now?
- Who is responsible?
- What evidence was captured?
- Are there issues?
- What is the next safe action?

## 4. Screen Flow Standard

Operational work should move through this screen flow:

```text
Work List
  -> Work Detail
  -> Current Step Workspace
  -> Action / Record Result
  -> Review Evidence
  -> Continue to Next Step
```

A user should not need to understand backend states to operate the screen. The UI should translate runtime and operational state into clear work instructions.

## 5. Workspace Layout Standard

Accepted baseline from Laundry Work Detail UI:

- Fixed left sidebar
- Sticky top header
- Main content workspace on light slate background
- Detail content centered inside a wide max-width container
- Bottom action bar for primary workflow actions

Current accepted Sidebar baseline:

- Width: `280px`
- Position: fixed left, independent from page scroll
- Content offset: `lg:pl-[280px]`
- Brand mark displayed at top
- Navy gradient background
- Compact menu rhythm
- Menu typography accepted as readable at browser zoom 100%

Current accepted Header direction:

- Header uses the same navy family as Sidebar
- Sticky top
- Right-side operational controls
- Profile group visually separated from utility icons
- Header should feel like part of the workspace shell, not a separate white web navbar

## 6. Detail Page Pattern

A standard detail page should include:

1. Work / Record Header
2. Summary Metrics
3. Workflow Timeline
4. Primary Detail Panel
5. Issues / Exceptions
6. Attachments / Images
7. History / Audit Timeline
8. Bottom Action Bar

The page should avoid placing business logic directly inside presentational components.

Preferred architecture remains:

```text
Page
  -> Runtime Host / Controller
  -> Projection
  -> Policy / Action Model
  -> Presentation Components
```

Presentation components should not call API/store directly.

## 7. Action Pattern

Actions should be grouped by operational priority:

- Primary: continue, confirm, complete, submit
- Secondary: save draft, add note, add image, print report
- Tertiary: back, cancel view, open related detail
- Destructive: cancel work, void, delete, reject

Bottom action bars should be used for workflow-level actions. Inline buttons should be used only for local panel actions.

## 8. Timeline Pattern

Workflow timeline should show:

- Completed step
- Current step
- Pending step
- Blocked/cancelled state when needed
- Actor/time metadata when available

Timeline should help the user answer:

```text
Where am I in the workflow?
What is already done?
What must happen next?
```

## 9. Issue Pattern

Issue panels should use a repeatable structure:

- Severity
- Status
- Issue title/type
- Affected item/count
- Reporter
- Time
- Description/evidence

Issues are operational exceptions. They should be visible before the user continues to the next step.

## 10. Attachment / Image Pattern

Attachments should be treated as evidence, not decoration.

Attachment/image panels should support:

- Preview
- Caption/name
- Uploaded time/user when available
- Add image action when allowed
- View all action when needed

## 11. State and API Boundary Reminder

This blueprint does not define implementation details. It only defines workflow and UX structure.

Implementation must continue to respect existing contracts:

- UI components remain presentation-only
- Controller/projection owns data shaping
- Policy/action model owns allowed actions
- API boundary owns external calls
- State ownership follows the state contract documents

## 12. First Implementation Baselines

Accepted so far:

- Laundry Workspace Sidebar v1
- Navy Sidebar + Navy Header direction
- Fixed shell layout
- Work Detail component composition pattern

Still under review:

- Header final density
- Main content spacing
- Summary card density
- Timeline visual density
- Count table dashboard style
- Button hierarchy

## 13. Checklist Before Creating a New Operational Screen

Before building a new screen, confirm:

- Which operation step does this screen support?
- Is this a List, Detail, Action, Evidence, Issue, or History screen?
- What is the primary user action?
- What information must be visible before acting?
- What evidence is captured?
- What state resets after completion?
- What persists across navigation?
- What component pattern can be reused?

## 14. Handoff

Use this blueprint as the practical UX and operation reference for the next Laundry Workspace screens. Future implementation should update this document only when a pattern is accepted through real UI review.
