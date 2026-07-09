export type ImagePanelAction = {
  label?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

export type ImagePanelActions = {
  uploadImage?: ImagePanelAction
  viewAll?: ImagePanelAction
  canUploadImage?: boolean
  onUploadImage?: () => void
}

export type ImagePanelItem = {
  id?: string | number
  url?: string
  thumbnailUrl?: string
  alt?: string
  name?: string
  caption?: string
  uploadedAt?: string
  uploadedBy?: string
}

export type ImagePanelProps = {
  images?: ImagePanelItem[]
  actions?: ImagePanelActions
  loading?: boolean
  error?: string | null
  emptyText?: string
}

export function ImagePanel({
  images = [],
  actions,
  loading = false,
  error = null,
  emptyText = 'ยังไม่มีรูปภาพ',
}: ImagePanelProps) {
  const uploadAction = actions?.uploadImage
  const viewAllAction = actions?.viewAll
  const canUploadImage = Boolean(uploadAction || actions?.canUploadImage)
  const onUploadImage = uploadAction?.onClick || actions?.onUploadImage

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-busy="true">
        <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="aspect-square animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-800 shadow-sm">
        <h2 className="text-lg font-bold">รูปภาพประกอบ</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">รูปภาพประกอบ</h2>
          <p className="mt-1 text-sm text-slate-500">รูปภาพหรือหลักฐานที่เกี่ยวข้องกับงานนี้</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {viewAllAction ? (
            <button type="button" onClick={viewAllAction.onClick} disabled={viewAllAction.disabled || viewAllAction.loading} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              {viewAllAction.loading ? 'กำลังโหลด...' : viewAllAction.label || 'ดูทั้งหมด'}
            </button>
          ) : null}
          {canUploadImage ? (
            <button type="button" onClick={onUploadImage} disabled={uploadAction?.disabled || uploadAction?.loading} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              {uploadAction?.loading ? 'กำลังดำเนินการ...' : uploadAction?.label || 'เพิ่มรูป'}
            </button>
          ) : null}
        </div>
      </div>

      {images.length ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image, index) => {
            const imageUrl = image.thumbnailUrl || image.url
            return (
              <figure key={image.id || index} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {imageUrl ? (
                  <img src={imageUrl} alt={image.alt || image.caption || image.name || 'Laundry work image'} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square items-center justify-center text-sm text-slate-400">ไม่มีรูป</div>
                )}
                {image.name || image.caption || image.uploadedAt ? (
                  <figcaption className="space-y-1 px-2 py-2 text-xs text-slate-500">
                    {image.name || image.caption ? <p className="truncate">{image.name || image.caption}</p> : null}
                    {image.uploadedAt || image.uploadedBy ? <p className="truncate text-slate-400">{[image.uploadedAt, image.uploadedBy].filter(Boolean).join(' • ')}</p> : null}
                  </figcaption>
                ) : null}
              </figure>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed p-4 text-sm text-slate-500">{emptyText}</p>
      )}
    </section>
  )
}
