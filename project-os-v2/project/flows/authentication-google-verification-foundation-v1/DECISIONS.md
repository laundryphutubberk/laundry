# Google Verification Foundation Decisions

Status: APPROVED

- Use the official `google-auth-library` verification client.
- Google Identity is disabled by default; enabling it without a Client ID fails environment validation at startup.
- No temporary HTTP verification endpoint is exposed because injected adapter verification provides sufficient evidence.
- Provider credentials remain confined to the adapter and are never logged or returned.
- The normalized result contains provider, subject, verified email state, display name and avatar URL only.
