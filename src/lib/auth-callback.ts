const authKeys = ['code', 'access_token', 'refresh_token', 'provider_token', 'provider_refresh_token', 'expires_in', 'expires_at', 'token_type', 'error', 'error_code', 'error_description', 'type', 'flow_id', 'sb_flow_id'];

export function inspectAuthCallback(address: string) {
  const url = new URL(address);
  const rawHash = url.hash.slice(1);
  const routeHash = rawHash.startsWith('/');
  const hashQuery = routeHash ? rawHash.split('?').slice(1).join('?') : rawHash;
  const fragment = new URLSearchParams(hashQuery);
  const value = (key: string) => url.searchParams.get(key) || fragment.get(key) || '';
  const hasCallback = ['code', 'access_token', 'refresh_token', 'error', 'error_code', 'error_description'].some((key) => Boolean(value(key)));
  const result = { hasCallback, code: value('code'), accessToken: value('access_token'), refreshToken: value('refresh_token'), type: value('type'), flowId: value('sb_flow_id') || value('flow_id'), hasError: Boolean(value('error') || value('error_code') || value('error_description')), cleanUrl: url.toString() };
  if (hasCallback) {
    authKeys.forEach((key) => { url.searchParams.delete(key); fragment.delete(key); });
    const route = routeHash ? rawHash.split('?')[0] : '/';
    url.hash = `${route}${fragment.toString() ? `?${fragment}` : ''}`;
    result.cleanUrl = url.toString();
  }
  return result;
}

export function routeFromHash(hash: string) {
  let raw = hash.replace(/^#/, '');
  if (/^%2f/i.test(raw)) { try { raw = decodeURIComponent(raw); } catch { return '/'; } }
  if (!raw.startsWith('/')) return '/';
  const [path, ...query] = raw.split('?');
  const normalized = path.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
  return `${normalized}${query.length ? `?${query.join('?')}` : ''}`;
}
