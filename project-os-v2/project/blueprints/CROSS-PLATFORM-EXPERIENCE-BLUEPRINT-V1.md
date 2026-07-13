# Cross-Platform Experience Blueprint V1

Status: APPROVED
Owner: Project Owner / Chief Architect
Authority: Cross-platform operational experience architecture for the Laundry Operational Platform
Blueprint Lock: LOCKED

## 1. Purpose

Define the durable cross-platform experience architecture that every future Laundry Operational Capability must follow across desktop, tablet, mobile browser, and PWA-ready surfaces.

This Blueprint defines business-facing interaction, layout, navigation, accessibility, performance, and verification expectations only. Executors implement from this Blueprint and must not redesign it without explicit Blueprint revision.

## 2. Business Goals

- Mobile-first operational workflow.
- Cross-platform consistency of business behavior and information.
- Zero desktop regression.
- Touch-first interaction for operational work.
- One capability, one source of truth, and platform-adaptive presentation.

## 3. Supported Platforms

- Desktop browser.
- Tablet browser in portrait and landscape orientation.
- Mobile browser in portrait and landscape orientation.
- PWA readiness, including installable-shell compatibility, resilient navigation, and safe resume behavior.

PWA readiness does not imply offline business mutation unless a separate approved capability defines it.

## 4. Canonical Breakpoints

The experience uses the following canonical viewport classes:

- Phone: below 640 px.
- Large phone / small tablet: 640–767 px.
- Tablet: 768–1023 px.
- Desktop: 1024–1439 px.
- Large desktop: 1440 px and above.

Breakpoints govern composition and interaction density, not business rules or data contracts. Content must remain usable at intermediate widths and during browser zoom.

## 5. Layout Architecture

### Desktop Layout

- Persistent primary navigation may remain visible.
- Header exposes workspace identity, page context, and high-value actions.
- Content uses the available width without creating excessively long reading lines.
- Multi-column layouts are allowed when they preserve task priority and reading order.
- Primary actions remain visible without obscuring content.

### Tablet Layout

- Navigation may collapse to a compact rail or drawer.
- Content favors one primary column with optional supporting panels.
- Touch targets and spacing increase relative to desktop.
- Landscape may use split views only when both panes remain independently usable.

### Mobile Layout

- Single-column task flow is the default.
- Navigation uses a drawer or compact top-level control.
- Header remains concise and retains workspace and page identity.
- Primary operational actions may use a sticky bottom action area.
- Secondary actions move into contextual menus or expandable sections.
- Content order follows operational priority, not desktop visual placement.

### Navigation, Header, Drawer, Content, and Bottom Actions

- Header, drawer, content, and bottom actions are separate architectural regions.
- Drawers must preserve the current route and selected workspace.
- Bottom actions must never cover required content or validation messages.
- Sticky regions must respect safe areas, browser chrome, and software keyboards.

## 6. Navigation Rules

### Desktop

- Persistent navigation is preferred when space permits.
- Active route and workspace must remain visually clear.
- Detail pages preserve a predictable return path to their parent list or workspace.

### Tablet

- Navigation may be persistent, compact, or drawer-based depending on orientation and width.
- Opening and closing navigation must not reset page state.

### Phone

- Primary navigation uses a drawer or compact navigation surface.
- High-frequency operational destinations must remain reachable with minimal steps.
- Navigation must not compete with the primary task action.

### Back Navigation

- Browser back behavior must remain valid.
- In-app back controls must return to the logical parent context when deep-linked history is unavailable.
- Back navigation must not silently discard unsaved input.

### Deep Links

- Every operational detail page must support direct navigation when authorization and required context are available.
- Deep links must restore workspace, entity identity, loading, error, and read-only policy correctly.
- Invalid, unauthorized, or stale links must produce an explicit recoverable state.

## 7. Operational Workspace

### Laundry Work List

- Mobile prioritizes search, filters, status, resort/work identity, and next operational action.
- Desktop may use richer tabular density while preserving the same information hierarchy.
- Filters and search state should survive navigation to detail and back when operationally useful.

### Laundry Work Detail

- Work identity, status, workspace, and next permitted action appear before secondary information.
- Sections follow operational sequence rather than implementation module boundaries.

### Section Ordering

Canonical priority:

1. Work identity and lifecycle.
2. Current operational action or blocker.
3. Bags and count information.
4. Issues and Claims.
5. Images.
6. Timeline.
7. Supporting metadata.

A capability may refine this order only when its approved Blueprint defines a stronger operational priority.

### Collapsible Sections

- Secondary or historical sections may collapse on narrow screens.
- Collapsing must not hide active errors, blockers, pending mutations, or required primary actions.
- Expanded state should remain stable during non-destructive refresh when practical.

### Sticky Actions and Scrolling

- Sticky actions are reserved for the current primary task.
- Multiple competing sticky action bars are forbidden.
- Scrolling must remain within the page unless a contained region has a clear operational reason for independent scrolling.
- Focused content and validation errors must scroll into view without being hidden by fixed regions.

## 8. Operational Forms

- Minimum touch target: 44 by 44 CSS pixels; 48 by 48 is preferred for primary operational controls.
- Inputs must use appropriate keyboard and input semantics.
- Software keyboard appearance must not hide the active field, error, or primary action.
- Validation must be specific, local to the field or action, and preserved until corrected.
- Primary actions use clear operational verbs and remain distinct from cancel or destructive actions.
- Duplicate submission must be prevented while a mutation is pending.
- Dialogs are reserved for focused decisions, confirmations, or short forms.
- Long or multi-step forms must use a full page or dedicated workflow surface rather than an oversized dialog.
- Destructive confirmation must state the business consequence.

## 9. Operational Tables

### Desktop Table

- Use tables when column comparison is central to the task.
- Headers, row identity, status, and row actions must remain clear.
- Dense layouts must not reduce readability or target size below operational limits.

### Tablet Table

- Reduce non-essential columns or provide a detail expansion pattern.
- Horizontal scrolling is allowed only when comparison requires it and the first identifying column remains understandable.

### Mobile Cards

- Table rows become ordered cards or list items.
- Cards preserve identity, key status, high-value values, and the next action.
- Mobile cards must not become unstructured dumps of every desktop column.

### Sorting, Filtering, and Searching

- Sorting, filters, and search must behave consistently across platforms.
- Active criteria must remain visible and removable.
- Mobile filter surfaces may use a drawer or full-screen sheet.
- Empty results must distinguish no data from no matches.

## 10. Images

- Capture flows support camera and file selection where the platform permits.
- Preview occurs before irreversible submission when practical.
- Upload surfaces expose progress, failure, retry, and pending state.
- Gallery presentation preserves caption, cover, lifecycle state, and authorization rules.
- Mobile gallery favors swipe or stacked navigation; desktop may use grid and detail preview.
- Zoom must support touch gestures and keyboard/mouse interaction without trapping navigation.
- Image behavior must not change business truth or bypass server confirmation.

## 11. Timeline

- Timeline renders events in chronological or reverse-chronological order as defined by the owning capability.
- Event type, actor, time, and business meaning remain distinguishable.
- Desktop may use denser rows; mobile uses readable stacked entries.
- Repeated metadata may be visually reduced but must remain accessible.
- Long timelines use incremental rendering or pagination without losing orientation.

## 12. Issue and Claim UI

- Issues and Claims appear as separate but related cards or sections.
- Issue cards communicate operational finding, status, quantity/context, and available follow-up.
- Claim cards communicate independent lifecycle state and explicit permitted actions.
- Lifecycle actions use approved business commands only.
- Terminal states are clearly read-only and expose no mutation actions.
- CLOSED and CANCELLED Work behavior must follow each capability's approved policy.

## 13. Performance Rules

- Defer rendering of non-critical, off-screen, or collapsed content.
- Preserve the primary task surface during background refresh.
- Loading states distinguish initial load, section load, mutation, and background reconciliation.
- Skeletons should approximate final structure and avoid misleading interactive affordances.
- Touch feedback must be immediate even when server completion is pending.
- Large lists, galleries, and timelines require bounded rendering.
- Performance optimization must not create stale business truth or optimistic terminal states.

## 14. Accessibility

- Interactive targets meet the touch-size rule and provide sufficient spacing.
- Text, status, focus, and controls meet accessible contrast expectations.
- Status must never be conveyed by color alone.
- Keyboard navigation and visible focus are required on desktop and tablet keyboard use.
- Screen-reader labels describe business actions and state.
- Portrait and landscape orientations remain usable unless a separately approved constraint exists.
- Reduced motion preferences must be respected.

## 15. Desktop Compatibility Rules

Desktop UX must not regress.

Mobile-first means prioritizing the narrow-screen operational experience while preserving or improving desktop efficiency, information density, navigation clarity, keyboard access, comparison behavior, and existing validated workflows.

A cross-platform change is unacceptable when it:

- removes a validated desktop capability;
- increases unnecessary desktop steps;
- degrades table comparison or keyboard operation;
- hides required actions or context;
- changes business behavior by viewport;
- introduces inconsistent authorization or lifecycle rules.

Platform adaptation changes presentation and interaction composition only. Business logic, data truth, policies, and capability outcomes remain consistent.

## 16. Implementation Order

### Pass A — Foundation

Establish shared cross-platform shell, canonical breakpoints, safe-area behavior, navigation regions, responsive content rules, and accessibility baseline.

### Pass B — Workspace

Adapt Laundry Work List and Laundry Work Detail, including section order, responsive navigation, scrolling, and primary-action placement.

### Pass C — Forms

Adapt operational forms, dialogs, validation, software-keyboard behavior, and pending-action protection.

### Pass D — Issue, Claim, Images, and Timeline

Apply the Blueprint to Issue and Claim cards, lifecycle actions, image capture/gallery, and timeline readability.

### Pass E — Human Verification

Perform Human Operational Test on supported platform classes, including explicit desktop regression verification.

Implementation passes are architectural sequencing only. They do not record execution or verification state.

## 17. Definition of Done

A capability conforms to CPX Blueprint V1 when:

- Its complete operational flow is usable on desktop, tablet, and phone.
- Business behavior and authorization remain platform-consistent.
- Touch, keyboard, focus, validation, loading, error, and pending states are operationally safe.
- Deep links and back navigation preserve valid context.
- Tables adapt intentionally rather than merely shrinking.
- Images and timelines remain readable and controllable.
- Accessibility and performance rules are satisfied.
- Human verification includes mobile, tablet, and desktop regression evidence.
- No viewport-specific business logic or API contract is introduced.

## 18. Out of Scope

- Product implementation.
- React, component-library, styling-system, CSS, or utility-class decisions.
- Backend, schema, API, or database changes.
- Native mobile applications.
- Offline mutation and conflict resolution.
- Push notifications.
- Device-specific integrations not covered by an approved capability.
- Execution state, capability state, project state, or verification records.

## 19. Blueprint Lock

Cross-Platform Experience Blueprint V1 is `LOCKED` as the architectural source of truth for future Laundry Operational Capability experiences.

Executors must implement from this Blueprint. Any change to supported platform policy, canonical breakpoint model, navigation architecture, operational layout rules, desktop compatibility guarantee, accessibility baseline, or cross-platform Definition of Done requires explicit Blueprint revision and approval.

This document contains architecture only. It records no implementation, execution, capability, project, or verification state.
