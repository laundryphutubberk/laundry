# LW-U-006 ImagePanel

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work image panel component from image projection and policy-derived action model.

## Target File

`frontend/src/features/laundry-works/components/ImagePanel.tsx`

## Runtime Contract Mapping

Uses projection/policy/controller output. The runtime contract does not make images inventory truth; images are supporting evidence only.

```text
LaundryWorkDetailDTO
- work
- bags
- countLines
- issues
- statusLogs

Projection may provide supporting images when available from the approved data source.
Policy/controller provides upload/view action availability.
```

## Inputs

```text
images[]
  - id
  - url/thumbnailUrl
  - alt
  - name/caption
  - uploadedAt
  - uploadedBy
actions optional
  - uploadImage
  - viewAll
  - canUploadImage legacy-compatible
loading optional
error optional
emptyText optional
```

## Outputs

- Presentational image panel.
- Responsive image gallery/list.
- Empty/loading/error-safe states.
- Optional view/upload entry points when provided.

## Rules

- No upload implementation.
- No direct API calls.
- No file processing logic.
- No permission checks inside JSX.
- No image-to-inventory truth calculation.
- Images remain supporting evidence only.
- Action visibility comes from policy/controller output only.

## Acceptance Criteria

- Renders image list or empty state safely.
- Supports responsive gallery/list layout.
- Loading/error states render safely.
- Action visibility comes from policy/controller output.
- Component remains presentation-only.
- FE-05 can wire image projection/actions without UI boundary change.
