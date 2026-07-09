export function ImagePanel({ images = [], actions }) {
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">รูปภาพ</h2>
          <p className="mt-1 text-sm text-slate-500">รูปภาพหรือหลักฐานที่เกี่ยวข้องกับงานนี้</p>
        </div>
        {actions?.canUploadImage ? (
          <button type="button" onClick={actions.onUploadImage} className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            เพิ่มรูป
          </button>
        ) : null}
      </div>

      {images.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <figure key={image.id || index} className="overflow-hidden rounded-xl border bg-slate-50">
              {image.url ? (
                <img src={image.url} alt={image.alt || image.name || 'Laundry work image'} className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center text-sm text-slate-400">ไม่มีรูป</div>
              )}
              {image.name ? <figcaption className="truncate px-2 py-2 text-xs text-slate-500">{image.name}</figcaption> : null}
            </figure>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed p-4 text-sm text-slate-500">ยังไม่มีรูปภาพ</p>
      )}
    </section>
  )
}
