import { supabase, database } from '../integrations/supabase/client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { inspectAuthCallback } from '../lib/auth-callback';
export { isConfigured } from '../integrations/supabase/client';
export type { Session } from '@supabase/supabase-js';
// Memoized across React StrictMode mounts. Capture codes before removing them;
// exchange exactly once, and never leave credentials/errors in browser history.
let initialization: ReturnType<typeof runAuthInitialization> | undefined;
export function initializeAuth() { return initialization ??= runAuthInitialization(); }
async function runAuthInitialization() {
  const callback = inspectAuthCallback(window.location.href);
  if (callback.hasCallback) history.replaceState(history.state, '', callback.cleanUrl);
  let callbackError = '';
  let passwordSetup = false;
  if (supabase && callback.hasCallback) {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') passwordSetup = true; });
    try {
      if (callback.hasError) throw new Error('expired_callback');
      if (callback.code) {
        const result = await supabase.auth.exchangeCodeForSession(callback.code, callback.flowId ? { flowId: callback.flowId } : undefined);
        if (result.error) throw result.error;
        passwordSetup ||= ['recovery', 'invite'].includes(callback.type);
      } else if (callback.accessToken && callback.refreshToken) {
        // Also support dashboard invitation/legacy email callbacks. Supabase validates
        // the session; the application never trusts claims from an unverified token.
        const result = await supabase.auth.setSession({ access_token: callback.accessToken, refresh_token: callback.refreshToken });
        if (result.error) throw result.error;
        passwordSetup = ['recovery', 'invite'].includes(callback.type);
      } else throw new Error('incomplete_callback');
    } catch {
      callbackError = 'Liên kết xác thực không còn hợp lệ hoặc được mở trên trình duyệt khác. Vui lòng đăng nhập bằng mật khẩu, hoặc yêu cầu một liên kết mới và mở trên cùng trình duyệt.';
    } finally { listener.subscription.unsubscribe(); }
  }
  if (!supabase) return { session: null, callbackError, passwordSetup: false };
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, callbackError, passwordSetup };
  } catch { return { session: null, callbackError: callbackError || 'Không khôi phục được phiên đăng nhập. Vui lòng đăng nhập lại.', passwordSetup: false }; }
}

export const callbackUrl = () => `${window.location.origin}${import.meta.env.BASE_URL}`;

export function subscribeAuth(listener: (event: AuthChangeEvent, session: Session | null) => void) {
  const { data } = database().auth.onAuthStateChange(listener);
  return () => data.subscription.unsubscribe();
}
export async function signIn(email: string, password: string) {
  const { error } = await database().auth.signInWithPassword({ email, password });
  if (error) throw error;
}
export async function signUp(email: string, password: string, fullName: string) {
  const { error } = await database().auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: callbackUrl() } });
  if (error) throw error;
}
export async function requestPasswordReset(email: string) {
  const { error } = await database().auth.resetPasswordForEmail(email, { redirectTo: callbackUrl() });
  if (error) throw error;
}
export async function updatePassword(password: string, nonce?: string) {
  const { error } = await database().auth.updateUser({ password, ...(nonce ? { nonce } : {}) });
  if (error) throw error;
}
export async function signOutSession(global = false) {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut(global ? { scope: 'global' } : undefined);
  if (error) throw error;
}
export async function resendConfirmation(email: string) {
  const { error } = await database().auth.resend({ type: 'signup', email, options: { emailRedirectTo: callbackUrl() } });
  if (error) throw error;
}
export async function requestReauthentication() {
  const { error } = await database().auth.reauthenticate();
  if (error) throw error;
}
export async function verifiedTotpFactor() {
  const { data, error } = await database().auth.mfa.listFactors();
  if (error) throw error;
  return data.totp.find((factor) => factor.status === 'verified')?.id || '';
}
export async function enrollTotp() {
  const client = database();
  const factors = await client.auth.mfa.listFactors();
  if (factors.error) throw factors.error;
  // Retain existing behavior: remove only this account's unfinished setup attempts.
  for (const factor of factors.data.all.filter((factor) => factor.factor_type === 'totp' && factor.status === 'unverified')) {
    const { error } = await client.auth.mfa.unenroll({ factorId: factor.id });
    if (error) throw error;
  }
  const { data, error } = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'SVNCKH-NET' });
  if (error) throw error;
  return data;
}
export async function verifyTotp(factorId: string, code: string) {
  const { error } = await database().auth.mfa.challengeAndVerify({ factorId, code });
  if (error) throw error;
}
