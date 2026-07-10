import { ImagePanel } from '../components/ImagePanel'
import { useLaundryImageController } from '../controllers/useLaundryImageController'
import { createLaundryImageProjection } from '../projections/laundryImageProjection'

export function LaundryImageRuntimePanel({ workId, workStatus }: { workId?: string | number; workStatus?: string }) {
  const runtime = useLaundryImageController({ workId, workStatus })
  const images = createLaundryImageProjection(runtime.images).map((image) => {
    const source = runtime.images.find((item) => String(item.id) === String(image.id))

    return {
      ...image,
      coverLabel: image.isCover ? 'รูปปก' : undefined,
      actions: source
        ? {
            canEditCaption: runtime.policy.canEditCaption,
            canSetCover: runtime.policy.canSetCover && !source.isCover,
            canSoftDelete: runtime.policy.canSoftDelete,
            pending: runtime.pendingImageId === source.id,
            onEditCaption: () => runtime.actions.editCaption(source),
            onSetCover: () => runtime.actions.setCover(source),
            onSoftDelete: () => runtime.actions.softDelete(source),
          }
        : undefined,
    }
  })

  return (
    <ImagePanel
      images={images}
      actions={{
        uploadImage: {
          label: 'เพิ่มรูป',
          onClick: runtime.actions.registerByUrl,
          disabled: !runtime.policy.canRegister,
          loading: runtime.registerPending,
        },
        canUploadImage: runtime.policy.canRegister,
      }}
      loading={runtime.loading}
      error={runtime.error?.message || null}
      emptyText="ยังไม่มีรูปภาพหรือหลักฐานสำหรับงานนี้"
    />
  )
}
