import { useCallback, useEffect, useRef, useState } from 'react'
import { identityLinkingApi, IdentityLinkingError, type LinkIntentSummary, type SafeIdentity, type UnlinkIntentSummary } from './identityLinkingApi'
import { cancelGoogleIdentityPrompt, requestGoogleIdentityCredential } from './googleIdentityClient'

type Phase = 'idle' | 'link-confirm' | 'link-password' | 'unlink-confirm' | 'unlink-password'
const terminalCodes = /EXPIRED|REPLAY|TERMINAL|CONTEXT|AUTH_SESSION|IDENTITY_CONFLICT|IDENTITY_ALREADY_LINKED/

export function useIdentityLinkingController() {
  const lock = useRef(false)
  const [identities, setIdentities] = useState<SafeIdentity[]>([])
  const [phase, setPhase] = useState<Phase>('idle')
  const [linkIntent, setLinkIntent] = useState<LinkIntentSummary | null>(null)
  const [unlinkIntent, setUnlinkIntent] = useState<UnlinkIntentSummary | null>(null)
  const [selectedIdentity, setSelectedIdentity] = useState<SafeIdentity | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const refresh = useCallback(async () => { setLoading(true); try { setIdentities((await identityLinkingApi.list()).items); setError(null) } catch (value) { setError(value instanceof Error ? value.message : 'Unable to load login methods') } finally { setLoading(false) } }, [])
  useEffect(() => { void refresh(); return () => cancelGoogleIdentityPrompt() }, [refresh])
  const clearFlow = useCallback(() => { setPhase('idle'); setLinkIntent(null); setUnlinkIntent(null); setSelectedIdentity(null) }, [])
  const run = useCallback(async (operation: () => Promise<void>) => { if (lock.current) return; lock.current = true; setPending(true); setError(null); try { await operation() } catch (value) { const errorValue = value instanceof Error ? value : new Error('Identity request failed'); setError(errorValue.message); if (value instanceof IdentityLinkingError && terminalCodes.test(value.code)) clearFlow() } finally { lock.current = false; setPending(false) } }, [clearFlow])

  return {
    identities, phase, linkIntent, unlinkIntent, selectedIdentity, loading, pending, error, success, refresh,
    startLink: () => run(async () => { const credential = await requestGoogleIdentityCredential(); const intent = await identityLinkingApi.createGoogleIntent(credential); setLinkIntent(intent); setPhase('link-confirm') }),
    confirmLink: () => run(async () => { if (!linkIntent) return; await identityLinkingApi.confirmGoogleIntent(linkIntent.id); setPhase('link-password') }),
    completeLink: (password: string) => run(async () => { if (!linkIntent) return; const { grant } = await identityLinkingApi.passwordStepUp(password, 'LINK_IDENTITY', linkIntent.id); await identityLinkingApi.completeGoogleIntent(linkIntent.id, grant); clearFlow(); await refresh(); setSuccess('เชื่อมบัญชี Google สำเร็จ') }),
    cancelLink: () => run(async () => { cancelGoogleIdentityPrompt(); if (linkIntent) await identityLinkingApi.cancelGoogleIntent(linkIntent.id); clearFlow() }),
    chooseUnlink: (identity: SafeIdentity) => { setError(null); setSelectedIdentity(identity); setPhase('unlink-confirm') },
    confirmUnlink: () => run(async () => { if (!selectedIdentity) return; const intent = await identityLinkingApi.createUnlinkIntent(selectedIdentity.id); setUnlinkIntent(intent); setPhase('unlink-password') }),
    completeUnlink: (password: string) => run(async () => { if (!unlinkIntent) return; const { grant } = await identityLinkingApi.passwordStepUp(password, 'UNLINK_IDENTITY', unlinkIntent.id); await identityLinkingApi.completeUnlinkIntent(unlinkIntent.id, grant); clearFlow(); await refresh(); setSuccess('ยกเลิกการเชื่อมบัญชี Google สำเร็จ') }),
    clearFlow,
  }
}
