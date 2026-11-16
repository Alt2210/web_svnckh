import { database } from '../integrations/supabase/client';
import { callRpc } from './request';
import type { Profile, StaffRole } from '../types/domain';

export async function loadAccount(userId: string) {
  const client = database();
  const [profile, roles, assurance] = await Promise.all([
    client.from('profiles').select('*').eq('id', userId).single(),
    client.from('access_roles').select('role').eq('user_id', userId),
    client.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  for (const result of [profile, roles, assurance]) if (result.error) throw result.error;
  return { profile: profile.data as Profile, roles: roles.data!.map((item) => item.role as StaffRole), aal2: assurance.data!.currentLevel === 'aal2' };
}

export interface ProfileInput { full_name: string; university: string; field: string; bio: string }
export const saveProfile = (profile: ProfileInput) => callRpc('save_profile', {
  p_full_name: profile.full_name, p_university: profile.university, p_field: profile.field, p_bio: profile.bio,
});
