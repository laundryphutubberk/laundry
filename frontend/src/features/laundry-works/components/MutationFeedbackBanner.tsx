export type MutationFeedbackTone = 'success' | 'error' | 'info'

export type MutationFeedbackModel = {
  tone: MutationFeedbackTone
  title: string
  message?: string
  requestId?: string
  retryLabel?: string
  onRetry?: () => void
  dismissLabel?: string
  onDismiss?: () => void
}

export type MutationFeedbackBannerProps = {
  feedback?: MutationFeedbackModel | null
}

const toneClassName: Record<MutationFeedbackTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

const actionClassName: Record<MutationFeedbackTone, string> = {
  success: 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-100',
  error: 'border-red-200 bg-white text-red-700 hover:bg-red-100',
  info: 'border-blue-200 bg-white text-blue-700 hover:bg-blue-100',
}

const toneSymbol: Record<MutationFeedbackTone, string> = {
  success: '✓',
  error: '!',
  info: 'i',
}

export function MutationFeedbackBanner({ feedback }: MutationFeedbackBannerProps) {
  if (!feedback) return null

  const liveMode = feedback.tone === 'error' ? 'assertive' : 'polite'

  return (
    <section
      className={`flex flex-col gap-4 rounded-2xl border px-5 py-4 shadow-sm sm:flex-row sm:items-start sm:justify-between ${toneClassName[feedback.tone]}`}
      role={feedback.tone === 'error' ? 'alert' : 'status'}
      aria-live={liveMode}
    >
      <div className="flex min-w-0 gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-sm font-black"
          aria-hidden="true"
        >
          {toneSymbol[feedback.tone]}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-black">{feedback.title}</p>
          {feedback.message ? <p className="mt-1 break-words text-sm leading-6 opacity-90">{feedback.message}</p> : null}
          {feedback.requestId ? (
            <p className="mt-2 break-all text-xs font-semibold opacity-75">รหัสอ้างอิง: {feedback.requestId}</p>
          ) : null}
        </div>
      </div>

      {feedback.onRetry || feedback.onDismiss ? (
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {feedback.onRetry ? (
            <button
              type="button"
              onClick={feedback.onRetry}
              className={`rounded-xl border px-3 py-2 text-xs font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-current/20 ${actionClassName[feedback.tone]}`}
            >
              {feedback.retryLabel || 'ลองใหม่'}
            </button>
          ) : null}
          {feedback.onDismiss ? (
            <button
              type="button"
              onClick={feedback.onDismiss}
              className={`rounded-xl border px-3 py-2 text-xs font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-current/20 ${actionClassName[feedback.tone]}`}
              aria-label={feedback.dismissLabel || 'ปิดข้อความ'}
            >
              {feedback.dismissLabel || 'ปิด'}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
