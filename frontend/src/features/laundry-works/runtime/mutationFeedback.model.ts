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
