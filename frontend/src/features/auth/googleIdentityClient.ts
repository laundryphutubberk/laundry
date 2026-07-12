const GOOGLE_SCRIPT_ID = 'google-identity-services'
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

type GoogleNotification = { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; isDismissedMoment: () => boolean; getNotDisplayedReason?: () => string; getSkippedReason?: () => string; getDismissedReason?: () => string }
type GoogleAccounts = { id: { initialize: (options: Record<string, unknown>) => void; prompt: (callback: (notification: GoogleNotification) => void) => void; cancel: () => void } }

declare global { interface Window { google?: { accounts: GoogleAccounts } } }

function loadGoogleIdentity() {
  if (window.google?.accounts) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null
    if (existing) { existing.addEventListener('load', () => resolve(), { once: true }); existing.addEventListener('error', () => reject(new Error('Google Identity is unavailable')), { once: true }); return }
    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google Identity is unavailable'))
    document.head.appendChild(script)
  })
}

export async function requestGoogleIdentityCredential() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('Google Identity is not configured for this environment')
  await loadGoogleIdentity()
  if (!window.google?.accounts) throw new Error('Google Identity is unavailable')
  return new Promise<string>((resolve, reject) => {
    let settled = false
    const finish = (callback: () => void) => { if (!settled) { settled = true; callback() } }
    window.google!.accounts.id.initialize({ client_id: clientId, auto_select: false, cancel_on_tap_outside: false, callback: (response: { credential?: string }) => finish(() => response.credential ? resolve(response.credential) : reject(new Error('Google Identity did not return a credential'))) })
    window.google!.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
        const reason = notification.getNotDisplayedReason?.() || notification.getSkippedReason?.() || notification.getDismissedReason?.() || 'cancelled'
        finish(() => reject(new Error(`Google Identity flow was cancelled or unavailable (${reason})`)))
      }
    })
  })
}

export function cancelGoogleIdentityPrompt() { window.google?.accounts.id.cancel() }
