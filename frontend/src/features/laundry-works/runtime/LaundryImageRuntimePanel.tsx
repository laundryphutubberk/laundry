import { ImagePanel } from '../components/ImagePanel'
import { useLaundryImageController } from '../controllers/useLaundryImageController'
import { createLaundryImageProjection } from '../projections/laundryImageProjection'

export function LaundryImageRuntimePanel({ workId }: { workId?: string | number }) {
  const runtime = useLaundryImageController({ workId })
  const images = createLaundryImageProjection(runtime.images)

  return (
    <ImagePanel
      images={images}
      loading={runtime.loading}
      error={runtime.error?.message || null}
      emptyText="ยังไม่มีรูปภาพหรือหลักฐานสำหรับงานนี้"
    />
  )
}
