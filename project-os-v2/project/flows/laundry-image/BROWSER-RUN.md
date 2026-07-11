# Laundry Image Browser Validation

Status: ACTIVE
Execution: READY_FOR_MANUAL_OR_BROWSER_AUTOMATION

## Purpose

Capture user-visible evidence that the verified metadata backend and frontend boundaries work together in a real browser. This run excludes binary upload and uses the current provider-neutral URL registration interaction.

## Preconditions

- Backend and frontend are running against the verified development environment.
- A Laundry staff account and a Resort account are available without recording credentials in evidence.
- Test Works exist for a mutable status, a terminal status, and at least two different resorts.
- Use disposable image URLs and test records.

## Scenarios

### BR-LI-001 — Load and reload

Open a mutable Work, record the visible active-image list, reload, and confirm the same authoritative list and cover marker.

### BR-LI-002 — Register metadata

Use Add Image, supply a disposable URL and caption, confirm it appears only after the request succeeds, then reload and confirm persistence.

### BR-LI-003 — Caption

Edit the caption, confirm the refreshed projection, reload, and confirm the updated caption remains.

### BR-LI-004 — Cover

Set a different image as cover, confirm only one cover marker, reload, and confirm uniqueness remains.

### BR-LI-005 — Soft delete

Remove an image, confirm it disappears after the successful command, reload, and confirm it remains absent.

### BR-LI-006 — Duplicate submit

Trigger a mutation and immediately attempt a second mutation. Confirm controls/pending state prevent a duplicate command and the resulting list contains no unintended duplicate.

### BR-LI-007 — Terminal Work

Open a `CLOSED` or `CANCELLED` Work. Confirm images remain readable and mutation actions are unavailable.

### BR-LI-008 — Resort scope

Open the same capability as a Resort actor. Confirm own-resort images are readable, mutation actions are unavailable, and another resort's Work cannot be accessed.

## Evidence Per Scenario

- scenario id;
- actor/workspace without credentials;
- Work identifier safe for test evidence;
- action and observed result;
- refresh result;
- request id or relevant log reference;
- screenshot only if it contains no secrets or sensitive production data;
- PASS/FAIL and notes.

## Completion Rule

The browser gate remains `NOT_EXECUTED` until these scenarios are observed in a real browser or equivalent browser automation. Build, lint, source inspection, and HTTP tests do not substitute for this evidence.
