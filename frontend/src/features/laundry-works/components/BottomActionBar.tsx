export function BottomActionBar({ actions = {}, state = {} }) {
  return (
    <div className="sticky bottom-0 z-10 border-t bg-white/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={actions.onBack}
          disabled={state.isBusy || actions.backDisabled}
          className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ย้อนกลับ
        </button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {actions.canSaveDraft ? (
            <button
              type="button"
              onClick={actions.onSaveDraft}
              disabled={state.isBusy || actions.saveDraftDisabled}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.isSavingDraft ? 'กำลังบันทึก...' : 'บันทึกชั่วคราว'}
            </button>
          ) : null}

          {actions.canContinue ? (
            <button
              type="button"
              onClick={actions.onContinue}
              disabled={state.isBusy || actions.continueDisabled}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.isContinuing ? 'กำลังดำเนินการ...' : actions.continueLabel || 'ดำเนินการขั้นตอนถัดไป'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
