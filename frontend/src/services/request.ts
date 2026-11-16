import { database } from '../integrations/supabase/client';

/** Browser gateway only; authorization and business invariants live in backend SQL. */
export async function callRpc<T = void>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await database().rpc(name, args);
  if (error) throw error;
  return data as T;
}
