export type BottomAction = {
  label?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

export type BottomActionBarActions = {
  back?: BottomAction
  saveDraft?: BottomAction
  continue?: BottomAction
  secondary?: BottomAction[]
  destructive?: BottomAction
  onBack?: () => void
  onSaveDraft?: () => void
  onContinue?: () => void
  canSaveDraft?: boolean
  canContinue?: boolean
  backDisabled?: boolean
  saveDraftDisabled?: boolean
  continueDisabled?: boolean
  continueLabel?: string
}

export type BottomActionBarState = {
  isBusy?: boolean
  isSavingDraft?: boolean
  isContinuing?: boolean
}

export type BottomActionBarProps = {
  actions?: BottomActionBarActions
  state?: BottomActionBarState
  loading?: boolean
  error?: string | null
}

const secondaryButtonClassName =
  'rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50'

export function BottomActionBar({ actions = {}, state = {}, loading = false, error = null }: BottomActionBarProps) {
  const backAction = actions.back || { label: 'ย้อนกลับ', onClick: actions.onBack, disabled: actions.backDisabled }
  const saveDraftAction = actions.saveDraft || {
    label: 'บันทึกชั่วคราว',
    onClick: actions.onSaveDraft,
    disabled: actions.saveDraftDisabled,
    loading: state.isSavingDraft,
  }
  const continueAction = actions.continue || {
    label: actions.continueLabel || 'ดำเนินการขั้นตอนถัดไป',
    onClick: actions.onContinue,
    disabled: actions.continueDisabled,
    loading: state.isContinuing,
  }

  const canSaveDraft = Boolean(actions.saveDraft || actions.canSaveDraft)
  const canContinue = Boolean(actions.continue || actions.canContinue)
  const busy = Boolean(state.isBusy || loading)

  return (
    <div
      className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-14px_34px_rgba(15,23,42,0.10)] backdrop-blur supports-[backdrop-filter]:bg-white/85"
      aria-busy={busy || undefined}
      aria-label="การดำเนินการของงานซัก"
    >
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between md:px-4 lg:px-8">
        <button
          type="button"
          onClick={backAction.onClick}
          disabled={busy || backAction.disabled || backAction.loading}
          className={secondaryButtonClassName}
        >
          {backAction.loading ? 'กำลังโหลด...' : backAction.label || 'ย้อนกลับ'}
        </button>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600" role="alert" aria-live="assertive">
              {error}
            </p>
          ) : null}

          {actions.secondary?.map((action, index) => (
            <button
              key={`${action.label || 'secondary'}-${index}`}
              type="button"
              onClick={action.onClick}
              disabled={busy || action.disabled || action.loading}
              className={secondaryButtonClassName}
            >
              {action.loading ? 'กำลังดำเนินการ...' : action.label || 'เพิ่มเติม'}
            </button>
          ))}

          {canSaveDraft ? (
            <button
              type="button"
              onClick={saveDraftAction.onClick}
              disabled={busy || saveDraftAction.disabled || saveDraftAction.loading}
              className={secondaryButtonClassName}
            >
              {saveDraftAction.loading ? 'กำลังบันทึก...' : saveDraftAction.label || 'บันทึกชั่วคราว'}
            </button>
          ) : null}

          {actions.destructive ? (
            <button
              type="button"
              onClick={actions.destructive.onClick}
              disabled={busy || actions.destructive.disabled || actions.destructive.loading}
              className="rounded-2xl border border-red-200 bg-white px-7 py-3.5 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actions.destructive.loading ? 'กำลังดำเนินการ...' : actions.destructive.label || 'ยกเลิก'}
            </button>
          ) : null}

          {canContinue ? (
            <button
              type="button"
              onClick={continueAction.onClick}
              disabled={busy || continueAction.disabled || continueAction.loading}
              className="rounded-2xl bg-blue-900 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {continueAction.loading ? 'กำลังดำเนินการ...' : continueAction.label || 'ดำเนินการขั้นตอนถัดไป'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
