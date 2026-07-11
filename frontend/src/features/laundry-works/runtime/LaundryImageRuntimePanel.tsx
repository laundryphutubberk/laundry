import { useEffect, useRef, useState } from 'react'
import { ImagePanel } from '../components/ImagePanel'
import { useLaundryImageController } from '../controllers/useLaundryImageController'
import { createLaundryImageProjection } from '../projections/laundryImageProjection'

export function LaundryImageRuntimePanel({ workId, workStatus }: { workId?: string | number; workStatus?: string }) {
  const runtime = useLaundryImageController({ workId, workStatus })
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!file) { setPreviewUrl(null); return }
    const url = URL.createObjectURL(file); setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  const submitUpload = async () => {
    if (!file) return
    if (await runtime.actions.uploadFile(file, caption.trim() || undefined)) { setFile(null); setCaption(''); if (inputRef.current) inputRef.current.value = '' }
  }
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
    <div className="space-y-4">
      {runtime.policy.canRegister ? <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} disabled={runtime.registerPending} className="block w-full text-sm" />
        {previewUrl ? <img src={previewUrl} alt="Selected upload preview" className="mt-3 max-h-48 rounded-xl object-contain" /> : null}
        {file ? <div className="mt-3 flex flex-col gap-2"><input value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={1000} placeholder="คำอธิบายรูปภาพ (ไม่บังคับ)" className="rounded-xl border px-3 py-2 text-sm" /><button type="button" onClick={() => void submitUpload()} disabled={runtime.registerPending} className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{runtime.registerPending ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}</button></div> : null}
      </div> : null}
      <ImagePanel
      images={images}
      actions={{
        uploadImage: {
          label: 'เพิ่มรูป',
          onClick: () => inputRef.current?.click(),
          disabled: !runtime.policy.canRegister,
          loading: runtime.registerPending,
        },
        canUploadImage: runtime.policy.canRegister,
      }}
      loading={runtime.loading}
      error={runtime.error?.message || null}
      emptyText="ยังไม่มีรูปภาพหรือหลักฐานสำหรับงานนี้"
      />
    </div>
  )
}
