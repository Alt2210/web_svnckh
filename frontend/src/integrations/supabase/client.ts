import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim();
export const isConfigured = Boolean(url && key);
// PKCE avoids putting access tokens in route fragments on GitHub Pages.
export const supabase = isConfigured ? createClient(url!, key!, {
  auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
}) : null;

export function database() {
  if (!supabase) throw new Error('Cổng tài khoản chưa được mở. Vui lòng quay lại sau.');
  return supabase;
}
