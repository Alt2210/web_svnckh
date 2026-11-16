import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { isConfigured, initializeAuth, subscribeAuth, signOutSession, type Session } from '../services/auth.service';
import { loadAccount } from '../services/profiles.service';
import { readableError } from '../lib/errors';
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
  const [loading, setLoading] = useState(isConfigured);
  const [error, setError] = useState('');
  const [aal2, setAal2] = useState(false);
  const [callbackError, setCallbackError] = useState('');
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(async () => { setRevision((v) => v + 1); }, []);

  useEffect(() => {
    if (!isConfigured) return;
    let alive = true;
    initializeAuth().then((result) => {
      if (!alive) return;
      setCallbackError(result.callbackError);
      setSession(result.session);
      if (!result.session) setLoading(false);
      if (result.passwordSetup) navigate('/dat-lai-mat-khau', true);
      else if (result.callbackError && !result.session) navigate('/dang-nhap', true);
    });
    const unsubscribe = subscribeAuth((event, next) => {
      setSession(next);
      if (!next) { setProfile(null); setRoles([]); setAal2(false); setLoading(false); }
      else { setLoading(true); setRevision((value) => value + 1); }
      if (event === 'PASSWORD_RECOVERY') navigate('/dat-lai-mat-khau', true);
    });
    return () => { alive = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session || !isConfigured) return;
    let alive = true;
    const load = async () => {
      try {
        const account = await loadAccount(session.user.id);
        if (!alive) return;
        setProfile(account.profile); setRoles(account.roles);
        setAal2(account.aal2); setError('');
      } catch (err) { if (alive) { setProfile(null); setRoles([]); setError(readableError(err)); } }
      finally { if (alive) setLoading(false); }
    };
    void load();
    return () => { alive = false; };
  }, [session?.access_token, session?.user.id, revision]);

  async function signOut() {
    await signOutSession();
    setSession(null); setProfile(null); setRoles([]); navigate('/');
  }
  return <AuthContext.Provider value={{ session, profile, roles, loading, error, aal2, refresh, signOut, callbackError, dismissCallbackError: () => setCallbackError('') }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is missing');
  return value;
}
