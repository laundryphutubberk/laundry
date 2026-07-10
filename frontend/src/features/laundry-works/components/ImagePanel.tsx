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

export type ImagePanelItemActions = {
  canEditCaption?: boolean
  canSetCover?: boolean
  canSoftDelete?: boolean
  pending?: boolean
  onEditCaption?: () => void
  onSetCover?: () => void
  onSoftDelete?: () => void
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
  isCover?: boolean
  coverLabel?: string
  actions?: ImagePanelItemActions
}

export type ImagePanelProps = {
  images?: ImagePanelItem[]
  actions?: ImagePanelActions
  loading?: boolean
  error?: string | null
  emptyText?: string
}

const itemActionClassName = 'rounded-xl border px-2.5 py-1.5 font-bold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50'

export function ImagePanel({ images = [], actions, loading = false, error = null, emptyText = 'ยังไม่มีรูปภาพ' }: ImagePanelProps) {
  const uploadAction = actions?.uploadImage
  const viewAllAction = actions?.viewAll
  const canUploadImage = Boolean(uploadAction || actions?.canUploadImage)
  const onUploadImage = uploadAction?.onClick || actions?.onUploadImage

  if (loading) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" aria-busy="true" aria-label="กำลังโหลดรูปภาพประกอบ">
        <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => <div key={item} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-red-800 shadow-sm" role="alert" aria-labelledby="laundry-image-error-title">
        <h2 id="laundry-image-error-title" className="text-lg font-black">รูปภาพประกอบ</h2>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="laundry-image-panel-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="laundry-image-panel-title" className="text-xl font-black tracking-tight text-slate-950">รูปภาพประกอบ</h2>
          <p className="mt-1 text-sm text-slate-500">รูปภาพหรือหลักฐานที่เกี่ยวข้องกับงานนี้</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {viewAllAction ? (
            <button
              type="button"
              onClick={viewAllAction.onClick}
              disabled={viewAllAction.disabled || viewAllAction.loading}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {viewAllAction.loading ? 'กำลังโหลด...' : viewAllAction.label || 'ดูทั้งหมด'}
            </button>
          ) : null}
          {canUploadImage ? (
            <button
              type="button"
              onClick={onUploadImage}
              disabled={uploadAction?.disabled || uploadAction?.loading}
              aria-busy={uploadAction?.loading}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadAction?.loading ? 'กำลังเพิ่มรูป...' : uploadAction?.label || 'เพิ่มรูป'}
            </button>
          ) : null}
        </div>
      </div>

      {images.length ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2" role="list" aria-label="รายการรูปภาพประกอบงานซัก">
          {images.map((image, index) => {
            const imageUrl = image.thumbnailUrl || image.url
            const itemActions = image.actions
            const itemName = image.name || image.caption || `รูปประกอบงาน ${index + 1}`
            const pending = Boolean(itemActions?.pending)

            return (
              <figure
                key={image.id || index}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                role="listitem"
                aria-busy={pending}
              >
                <div className="relative overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} alt={image.alt || image.caption || image.name || 'Laundry work image'} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center text-sm text-slate-400">ไม่มีรูป</div>
                  )}
                  {image.isCover ? (
                    <span className="absolute left-2 top-2 rounded-full bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                      {image.coverLabel || 'รูปปก'}
                    </span>
                  ) : null}
                </div>

                <figcaption className="space-y-3 px-3 py-3 text-xs text-slate-500">
                  <div className="space-y-1">
                    <p className="truncate font-bold text-slate-700" title={itemName}>{itemName}</p>
                    {image.caption && image.caption !== image.name ? <p className="line-clamp-2 text-slate-500">{image.caption}</p> : null}
                    {image.uploadedAt || image.uploadedBy ? <p className="truncate text-slate-400">{[image.uploadedAt, image.uploadedBy].filter(Boolean).join(' • ')}</p> : null}
                  </div>

                  {itemActions && (itemActions.canEditCaption || itemActions.canSetCover || itemActions.canSoftDelete) ? (
                    <div className="flex flex-wrap gap-1.5 border-t border-slate-200 pt-3" aria-label={`การทำงานสำหรับ ${itemName}`}>
                      {itemActions.canEditCaption ? (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={itemActions.onEditCaption}
                          className={`${itemActionClassName} border-slate-200 bg-white text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-200`}
                        >
                          {pending ? 'กำลังดำเนินการ...' : 'แก้คำอธิบาย'}
                        </button>
                      ) : null}
                      {itemActions.canSetCover ? (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={itemActions.onSetCover}
                          className={`${itemActionClassName} border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 focus-visible:ring-blue-200`}
                        >
                          {pending ? 'กำลังดำเนินการ...' : 'ตั้งเป็นปก'}
                        </button>
                      ) : null}
                      {itemActions.canSoftDelete ? (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={itemActions.onSoftDelete}
                          className={`${itemActionClassName} border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-200`}
                        >
                          {pending ? 'กำลังดำเนินการ...' : 'นำออก'}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </figcaption>
              </figure>
            )
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed p-5 text-sm text-slate-500">{emptyText}</p>
      )}
    </section>
  )
}
