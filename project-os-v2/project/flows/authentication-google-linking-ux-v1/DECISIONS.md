# Google Linking UX Decisions

Status: APPROVED

- Add one focused account-security route under the existing authenticated workspace shell.
- Keep request orchestration in a controller hook and transport in a dedicated API module.
- Google credential is passed directly to intent creation and discarded; step-up grant is kept only in the completion call stack.
- Wrong-password and rate-limit errors preserve the password form; terminal intent/session/conflict errors clear transient flow state.
- No Google Login, onboarding, account creation or authorization behavior is introduced.
