# LW-U-006 ImagePanel

Status: READY_FOR_IMPLEMENTATION
Feature Cell: Laundry Work
Track: UI Package
Runtime Source: `project-os/frontend/execution/fe-03-runtime-contract/FE-03-LAUNDRY-WORK-RUNTIME-CONTRACT.md`

## TASK

Implement the Laundry Work image panel component from `ImagePanelProjection` and policy/controller action descriptors.

## Target File

`frontend/src/features/laundry-works/components/ImagePanel.tsx`

## Runtime Contract Mapping

Uses `imagePanel` from `LaundryWorkDetailProjection`:

```ts
type ImagePanelProjection = {
  images: Array<{
    id: string | number
    url?: string
    thumbnailUrl?: string
    alt: string
    caption?: string
  }>
  canUploadImage: boolean
  emptyText: string
}
```

The runtime contract does not make images inventory truth. Images are supporting evidence only. Upload/view actions map to controller/policy only.

## Inputs

```text
imagePanel
  - images[]
  - canUploadImage
  - emptyText
actions optional
  - uploadImage handler/descriptor from controller
  - viewAll handler/descriptor from controller
loading optional
error optional
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
- FE-05 can pass `ImagePanelProjection` without UI boundary change.
