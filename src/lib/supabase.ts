import { createClient } from '@supabase/supabase-js';
import { inspectAuthCallback } from './auth-callback';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim();
export const isConfigured = Boolean(url && key);
// PKCE avoids putting access tokens in route fragments on GitHub Pages.
export const supabase = isConfigured ? createClient(url!, key!, {
  auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
}) : null;

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

export function database() {
  if (!supabase) throw new Error('Cổng tài khoản chưa được mở. Vui lòng quay lại sau.');
  return supabase;
}
export const callbackUrl = () => `${window.location.origin}${import.meta.env.BASE_URL}`;
export function readableError(error: unknown): string {
  const text = error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String(error.message) : 'Không thực hiện được thao tác. Vui lòng thử lại.';
  if (/invalid login credentials/i.test(text)) return 'Email hoặc mật khẩu không đúng.';
  if (/email not confirmed/i.test(text)) return 'Bạn cần xác minh email trước khi đăng nhập.';
  if (/rate limit|too many/i.test(text)) return 'Bạn thao tác quá nhanh. Vui lòng chờ một lúc rồi thử lại.';
  if (/failed to fetch|network/i.test(text)) return 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng.';
  if (/row.level|permission denied|not authorized/i.test(text)) return 'Bạn không có quyền thực hiện thao tác này hoặc cần xác thực hai bước.';
  return text;
}
