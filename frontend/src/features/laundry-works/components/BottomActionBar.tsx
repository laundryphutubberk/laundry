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
    <div className="sticky bottom-0 z-10 border-t bg-white/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={backAction.onClick}
          disabled={busy || backAction.disabled || backAction.loading}
          className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {backAction.loading ? 'กำลังโหลด...' : backAction.label || 'ย้อนกลับ'}
        </button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          {actions.secondary?.map((action, index) => (
            <button
              key={`${action.label || 'secondary'}-${index}`}
              type="button"
              onClick={action.onClick}
              disabled={busy || action.disabled || action.loading}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action.loading ? 'กำลังดำเนินการ...' : action.label || 'เพิ่มเติม'}
            </button>
          ))}

          {canSaveDraft ? (
            <button
              type="button"
              onClick={saveDraftAction.onClick}
              disabled={busy || saveDraftAction.disabled || saveDraftAction.loading}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveDraftAction.loading ? 'กำลังบันทึก...' : saveDraftAction.label || 'บันทึกชั่วคราว'}
            </button>
          ) : null}

          {actions.destructive ? (
            <button
              type="button"
              onClick={actions.destructive.onClick}
              disabled={busy || actions.destructive.disabled || actions.destructive.loading}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actions.destructive.loading ? 'กำลังดำเนินการ...' : actions.destructive.label || 'ยกเลิก'}
            </button>
          ) : null}

          {canContinue ? (
            <button
              type="button"
              onClick={continueAction.onClick}
              disabled={busy || continueAction.disabled || continueAction.loading}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {continueAction.loading ? 'กำลังดำเนินการ...' : continueAction.label || 'ดำเนินการขั้นตอนถัดไป'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
