import type { LaundryWorkImageDTO } from '../api/laundryImageApi'

const formatDate = (value?: string | null) => {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function createLaundryImageProjection(images: LaundryWorkImageDTO[] = []) {
  return images.map((image) => ({
    id: image.id,
    url: image.url,
    thumbnailUrl: image.url,
    alt: image.caption || image.originalName || 'Laundry Work evidence image',
    name: image.originalName || (image.isCover ? 'รูปหน้าปกงาน' : 'รูปประกอบงาน'),
    caption: image.caption || undefined,
    uploadedAt: formatDate(image.uploadedAt),
    isCover: image.isCover,
    displayOrder: image.displayOrder,
  }))
}
