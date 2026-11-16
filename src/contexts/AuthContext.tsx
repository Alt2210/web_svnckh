import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, readableError, initializeAuth } from '../lib/supabase';
import { navigate } from '../lib/navigation';
import type { Profile, StaffRole } from '../types/domain';

interface AuthState {
  session: Session | null; profile: Profile | null; roles: StaffRole[]; loading: boolean; error: string; aal2: boolean;
  refresh: () => Promise<void>; signOut: () => Promise<void>;
  callbackError: string; dismissCallbackError: () => void;
}
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState('');
  const [aal2, setAal2] = useState(false);
  const [callbackError, setCallbackError] = useState('');
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(async () => { setRevision((v) => v + 1); }, []);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let alive = true;
    initializeAuth().then((result) => {
      if (!alive) return;
      setCallbackError(result.callbackError);
      setSession(result.session);
      if (!result.session) setLoading(false);
      if (result.passwordSetup) navigate('/dat-lai-mat-khau', true);
      else if (result.callbackError && !result.session) navigate('/dang-nhap', true);
    });
    const { data } = client.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (!next) { setProfile(null); setRoles([]); setAal2(false); setLoading(false); }
      else { setLoading(true); setRevision((value) => value + 1); }
      if (event === 'PASSWORD_RECOVERY') navigate('/dat-lai-mat-khau', true);
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session || !supabase) return;
    let alive = true;
    const client = supabase;
    const load = async () => {
      try {
        const [p, r, assurance] = await Promise.all([
          client.from('profiles').select('*').eq('id', session.user.id).single(),
          client.from('access_roles').select('role').eq('user_id', session.user.id),
          client.auth.mfa.getAuthenticatorAssuranceLevel(),
        ]);
        if (p.error) throw p.error;
        if (r.error) throw r.error;
        if (assurance.error) throw assurance.error;
        if (!alive) return;
        setProfile(p.data as Profile); setRoles(r.data.map((item) => item.role as StaffRole));
        setAal2(assurance.data.currentLevel === 'aal2'); setError('');
      } catch (err) { if (alive) { setProfile(null); setRoles([]); setError(readableError(err)); } }
      finally { if (alive) setLoading(false); }
    };
    void load();
    return () => { alive = false; };
  }, [session?.access_token, session?.user.id, revision]);

  async function signOut() {
    if (supabase) { const result = await supabase.auth.signOut(); if (result.error) throw result.error; }
    setSession(null); setProfile(null); setRoles([]); navigate('/dang-nhap');
  }
  return <AuthContext.Provider value={{ session, profile, roles, loading, error, aal2, refresh, signOut, callbackError, dismissCallbackError: () => setCallbackError('') }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is missing');
  return value;
}
